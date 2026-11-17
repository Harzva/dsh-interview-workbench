import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export async function buildAndPack() {
  execFileSync('npm', ['run', 'build'], { cwd: project, stdio: 'inherit' })
  execFileSync('npm', ['run', 'check'], { cwd: project, stdio: 'inherit' })
  const destination = join(project, '.local', 'releases')
  await mkdir(destination, { recursive: true })
  const [pack] = JSON.parse(execFileSync('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', destination], { cwd: project, encoding: 'utf8' }))
  const artifact = join(destination, pack.filename)
  const verification = await inspectArtifact(artifact)
  await writeFile(`${artifact}.sha256`, `${verification.sha256}  ${pack.filename}\n`)
  await writeFile(`${artifact}.manifest.json`, JSON.stringify(verification, null, 2) + '\n')
  console.log(`Verified ${pack.filename}: ${verification.files.length} files, SHA-256 ${verification.sha256}`)
  return artifact
}
export async function inspectArtifact(artifact) {
  const names = execFileSync('tar', ['-tzf', artifact], { encoding: 'utf8' }).trim().split('\n')
  for (const name of names) {
    if (!name.startsWith('package/') || name.split('/').some(x => x === '..') || /(?:^|\/)(?:\.env(?:\..*)?|\.local|node_modules|references|test|scripts)(?:\/|$)/.test(name) || name.endsWith('.map')) throw new Error(`Unexpected release entry: ${name}`)
  }
  const read = name => execFileSync('tar', ['-xOf', artifact, `package/${name}`], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 })
  const manifest = JSON.parse(read('package.json'))
  const source = JSON.parse(await readFile(join(project, 'package.json'), 'utf8'))
  if (manifest.name !== source.name || manifest.version !== source.version || manifest.dsh?.client?.platform !== 'web') throw new Error('Packed package identity or Client contract differs from this release')
  const required = ['LICENSE', 'README.md', 'THIRD_PARTY_NOTICES.md', 'content/seed.json', manifest.main, manifest.exports['./client'], manifest.dsh.bundle.patch].map(x => x.replace(/^\.\//, ''))
  for (const file of required) if (!names.includes(`package/${file}`)) throw new Error(`Release is missing ${file}`)
  const files = []
  for (const full of names) {
    if (full.endsWith('/')) continue
    const path = full.slice('package/'.length), body = read(path)
    const current = await readFile(join(project, path), 'utf8')
    if (body !== current) throw new Error(`Stale artifact differs from current release file: ${path}`)
    if (/\/Users\/[a-zA-Z0-9_.-]+\/|\/Volumes\/(?:Ultra|My PSSD)\/|(?:sk-(?:proj-)?[A-Za-z0-9_-]{24,})|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(body)) throw new Error(`Private-path or credential marker in ${path}; inspect locally before release`)
    files.push({ path, bytes: Buffer.byteLength(body), sha256: createHash('sha256').update(body).digest('hex') })
  }
  const binary = await readFile(artifact)
  return { name: manifest.name, version: manifest.version, sha256: createHash('sha256').update(binary).digest('hex'), bytes: binary.length, files }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await buildAndPack()
