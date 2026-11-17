/**
 * Seven-day, self-authored Python recovery sprint for the interview workbench.
 *
 * These exercises are deliberately small and executable without third-party
 * numerical libraries.  They are training specifications, not a transcription
 * of a hidden exam.  In particular, the supplied Encoder/Bi-Kmeans material is
 * missing formula weights, so it must not be used as an oracle for hidden tests.
 */

export const SPRINT_NOTICE = '本课程使用自编题目练习算法与模型基础。'

export const SPRINT_DAYS = [
  {
    id: 'day1',
    title: 'Python 恢复：循环、函数、列表与输入输出',
    goal: '恢复用 Python 写短函数的手感，能从零写出距离和中位数，并用断言检查边界。',
    minutes: 45,
    steps: [
      {
        id: 'day1-manhattan',
        title: '曼哈顿距离',
        minutes: 5,
        lesson: '曼哈顿距离就是对应坐标之差的绝对值相加。例如 [2, 8] 和 [4, 5] 的距离是 2 + 3 = 5。\n\ntotal 从 0 开始，循环中累加 `abs(a[i] - b[i])`，最后返回 total。这一步约定两个列表长度相同。',
        task: '补完 manhattan(a, b) 的下标循环。先点“Run · 运行”，确认下面两组输出，再点“检查本课训练用例”。忘了循环写法也没关系，点一次提示再试。',
        examples: [
          { input: 'a=[2, 8], b=[4, 5]', expected: '5' },
          { input: 'a=[1, -2, 3], b=[4, 2, 3]', expected: '7' },
        ],
        starter: String.raw`def manhattan(a, b):
    total = 0
    # TODO: 用循环累加每个坐标的距离
    return total

print(manhattan([2, 8], [4, 5]))
print(manhattan([1, -2, 3], [4, 2, 3]))`,
        tests: String.raw`for a, b, expected in [([2, 8], [4, 5], 5), ([1, -2, 3], [4, 2, 3], 7), ([], [], 0)]:
    actual = manhattan(a, b)
    assert actual == expected, f"输入 {a} 和 {b}：期望 {expected}，实际 {actual}"
`,
        hints: [
          '先写 total = 0，再让循环每次处理一个坐标。',
          '用 for i in range(len(a)): 访问第 i 个坐标，并把贡献加到 total。',
          '返回 total；不要在循环里提前 return。',
        ],
        solution: String.raw`def manhattan(a, b):
    if len(a) != len(b):
        raise ValueError("a 和 b 必须等长")
    total = 0
    for i in range(len(a)):
        total += abs(a[i] - b[i])
    return total`,
        acceptance: [
          'total 在循环前初始化为 0。',
          '使用下标循环，并且每一维累加 abs(a[i] - b[i])。',
          '两组指定样例分别得到 5 和 7；这一步约定输入等长。',
        ],
      },
      {
        id: 'day1-median',
        title: '中位数：先排序再取中间',
        minutes: 10,
        lesson: '中位数先处理顺序，再处理奇偶：奇数长度取中间元素，偶数长度取中间两个元素的平均值。用 sorted 拷贝输入，避免悄悄改掉调用方的列表。',
        task: '写 median(values)。本地规格：values 必须非空；支持整数和浮点数；偶数长度返回算术平均；不修改原列表。空列表属于非法输入，必须 raise ValueError。',
        examples: [
          { input: 'values=[3, 1, 2]', expected: '2' },
          { input: 'values=[1, 2, 3, 4]', expected: '2.5' },
        ],
        starter: String.raw`def median(values):
    # TODO
    pass

print(median([3, 1, 2]))`,
        tests: String.raw`original = [3, 1, 2]
actual = median(original)
assert actual == 2, f"输入 {original}：期望中位数 2，实际 {actual}"
assert original == [3, 1, 2], f"输入列表被修改：期望 [3, 1, 2]，实际 {original}"
actual = median([1, 2, 3, 4])
assert actual == 2.5, f"输入 [1, 2, 3, 4]：期望 2.5，实际 {actual}"
actual = median([-4, -1, -3])
assert actual == -3, f"输入 [-4, -1, -3]：期望 -3，实际 {actual}"
try:
    median([])
except ValueError:
    pass
else:
    raise AssertionError("输入 []：期望 ValueError，实际没有拒绝空列表")`,
        hints: [
          '先用 ordered = sorted(values)，不要对 values 原地 sort。',
          'n 为奇数时下标是 n // 2；n 为偶数时取 n // 2 - 1 和 n // 2。',
          '空列表没有中位数，明确 raise ValueError。',
        ],
        solution: String.raw`def median(values):
    if not values:
        raise ValueError("中位数需要至少一个数")
    ordered = sorted(values)
    n = len(ordered)
    middle = n // 2
    if n % 2 == 1:
        return ordered[middle]
    return (ordered[middle - 1] + ordered[middle]) / 2`,
        acceptance: [
          '奇数和偶数长度都正确处理。',
          '函数不改变调用方列表。',
          '空列表显式报错，而不是返回 None 或越界。',
        ],
      },
    ],
  },
  {
    id: 'day2',
    title: 'K-Median 单轮：分配样本并更新中心',
    goal: '把距离函数、分组、逐维中位数串成一轮 K-Median，并明确并列距离与空簇规则。',
    minutes: 50,
    steps: [
      {
        id: 'day2-kmedian-round',
        title: 'K-Median 单轮更新',
        minutes: 35,
        lesson: '一轮分两步：先将每个点分配到曼哈顿距离最近的中心，再对每个簇逐维取中位数。距离相同时选编号更小的簇；空簇保留旧中心。返回 assignments 和 new_centers，且不要原地改写输入。',
        task: '实现 k_median_round(points, centers)。本地规格：points 与 centers 都是非空、等维数值列表；违反非空或维度前提时必须 raise ValueError。输出 assignments[i] 是第 i 个点的簇编号，new_centers 与 centers 形状相同，且不原地修改输入。',
        examples: [
          {
            input: 'points=[[0,0],[1,1],[2,0],[8,8],[9,7],[10,9]], centers=[[0,0],[10,10]]',
            expected: 'assignments=[0,0,0,1,1,1]; new_centers=[[1,0],[9,8]]',
          },
          {
            input: 'points=[[1],[0]], centers=[[0],[2]]',
            expected: 'assignments=[0,0]; new_centers=[[0.5],[2]]（等距取较小簇，空簇保留旧中心）',
          },
        ],
        starter: String.raw`def k_median_round(points, centers):
    # TODO: 校验形状
    # TODO: 最近中心分配，距离并列时取较小编号
    # TODO: 每个非空簇逐维取中位数；空簇保留旧中心
    return assignments, new_centers`,
        tests: String.raw`points = [[0, 0], [1, 1], [2, 0], [8, 8], [9, 7], [10, 9]]
original_points = [point[:] for point in points]
original_centers = [[0, 0], [10, 10]]
assignments, new_centers = k_median_round(points, original_centers)
assert assignments == [0, 0, 0, 1, 1, 1], f"输入 points={points}：期望分配 [0, 0, 0, 1, 1, 1]，实际 {assignments}"
assert new_centers == [[1, 0], [9, 8]], f"输入 points={points}：期望中心 [[1, 0], [9, 8]]，实际 {new_centers}"
assert points == original_points, f"points 不应被修改：期望 {original_points}，实际 {points}"
assert original_centers == [[0, 0], [10, 10]], f"centers 不应被修改：实际 {original_centers}"

# [1] 到两个中心等距，按规则进入编号更小的簇；第二簇为空，保留旧中心。
tie_assignments, tie_centers = k_median_round([[1], [0]], [[0], [2]])
assert tie_assignments == [0, 0], f"等距输入 [[1], [0]]：期望 [0, 0]，实际 {tie_assignments}"
assert tie_centers == [[0.5], [2]], f"空簇输入：期望 [[0.5], [2]]，实际 {tie_centers}"

for bad_points, bad_centers, label in [
    ([[0, 1], [2]], [[0, 0]], "点维数不一致"),
    ([[0, 1]], [[0]], "中心维数不一致"),
    ([], [[0]], "空 points"),
]:
    try:
        k_median_round(bad_points, bad_centers)
    except ValueError:
        pass
    else:
        raise AssertionError(f"输入 {label}：期望 ValueError，实际允许非法形状")`,
        hints: [
          '先建立 groups = [[] for _ in centers]，分配时同时记录 assignments。',
          '用 min(range(len(centers)), key=lambda i: (distance, i))，元组第二项处理并列。',
          '更新第 d 维时收集 point[d]；groups[i] 为空时复制旧中心。',
        ],
        solution: String.raw`def _manhattan(a, b):
    return sum(abs(x - y) for x, y in zip(a, b))

def _median(values):
    ordered = sorted(values)
    middle = len(ordered) // 2
    if len(ordered) % 2:
        return ordered[middle]
    return (ordered[middle - 1] + ordered[middle]) / 2

def k_median_round(points, centers):
    if not points or not centers:
        raise ValueError("points 和 centers 不能为空")
    dimension = len(points[0])
    if dimension == 0 or any(len(point) != dimension for point in points):
        raise ValueError("points 维数不一致")
    if any(len(center) != dimension for center in centers):
        raise ValueError("center 维数不一致")

    assignments = []
    groups = [[] for _ in centers]
    for point in points:
        cluster = min(
            range(len(centers)),
            key=lambda i: (_manhattan(point, centers[i]), i),
        )
        assignments.append(cluster)
        groups[cluster].append(point)

    new_centers = []
    for old_center, group in zip(centers, groups):
        if not group:
            new_centers.append(list(old_center))
            continue
        new_centers.append([
            _median([point[d] for point in group])
            for d in range(dimension)
        ])
    return assignments, new_centers`,
        acceptance: [
          '分配按曼哈顿距离，距离并列稳定地选择较小簇编号。',
          '非空簇逐维更新为中位数，偶数个点取两个中间值平均。',
          '空簇不崩溃且保留旧中心；输入 points/centers 未被原地修改。',
        ],
      },
    ],
  },
  {
    id: 'day3',
    title: 'K-Median 整题：迭代、停止条件与 inertia',
    goal: '闭卷写出可运行的 K-Median 小程序，读 stdin，迭代到中心稳定，并输出可核对的结果。',
    minutes: 55,
    steps: [
      {
        id: 'day3-kmedian-full',
        title: '完整 K-Median 程序',
        minutes: 45,
        lesson: '把单轮封装进迭代：用前 k 个点作为初始中心，重复“分配→更新”，当新旧中心完全相同就停止；达到 max_iter 也必须停止。inertia 定义为所有点到其所属中心的曼哈顿距离之和，不要误写成平方距离。',
        task: '实现 k_median(points, k, max_iter=100) 和 solve_text(data)。stdin 格式为第一行 n d k，随后 n 行各 d 个数；输出 k 行中心（每个坐标 6 位小数），再输出 inertia 和 iterations。k 必须在 1..n 内、d 和 max_iter 必须为正；违反这些前提时 k_median 应 raise ValueError。在线运行器中可粘贴 sample_input。先自己闭卷写 25 分钟，再展开 solution 对照。',
        supportsStdin: true,
        sampleInput: String.raw`6 2 2
0 0
9 9
1 0
0 1
10 9
9 8`,
        examples: [
          {
            input: String.raw`6 2 2
0 0
9 9
1 0
0 1
10 9
9 8`,
            expected: String.raw`0.000000 0.000000
9.000000 9.000000
inertia 4.000000
iterations 1`,
          },
          {
            input: String.raw`3 1 1
5
1
9`,
            expected: String.raw`5.000000
inertia 8.000000
iterations 1`,
          },
        ],
        starter: String.raw`import sys

def k_median(points, k, max_iter=100):
    # TODO: 用前 k 个点初始化；循环分配和逐维更新
    pass

def solve_text(data):
    # TODO: 解析 n d k 和 n 行点，格式化输出
    pass

if __name__ == "__main__":
    data = sys.stdin.read()
    if data.strip():
        print(solve_text(data), end="")`,
        tests: String.raw`points = [[0, 0], [9, 9], [1, 0], [0, 1], [10, 9], [9, 8]]
centers, assignments, inertia, iterations = k_median(points, 2)
assert centers == [[0.0, 0.0], [9.0, 9.0]], f"输入 points={points}, k=2：期望中心 [[0.0, 0.0], [9.0, 9.0]]，实际 {centers}"
assert assignments == [0, 1, 0, 0, 1, 1], f"期望分配 [0, 1, 0, 0, 1, 1]，实际 {assignments}"
assert inertia == 4.0, f"期望 Manhattan inertia 4.0，实际 {inertia}"
assert iterations == 1, f"中心首轮稳定，期望迭代次数 1，实际 {iterations}"
sample = """6 2 2
0 0
9 9
1 0
0 1
10 9
9 8
"""
actual_text = solve_text(sample)
expected_text = """0.000000 0.000000
9.000000 9.000000
inertia 4.000000
iterations 1
"""
assert actual_text == expected_text, f"stdin sample：期望输出 {expected_text!r}，实际 {actual_text!r}"

one_cluster = k_median([[5], [1], [9]], 1)
assert one_cluster[0] == [[5.0]], f"k=1：期望中心 [[5.0]]，实际 {one_cluster[0]}"
assert one_cluster[2] == 8.0, f"k=1：期望 inertia 8.0，实际 {one_cluster[2]}"

for args, label in [
    (([], 1), "空 points"),
    ([[[0], [1]], 0], "k=0"),
    ([[[0], [1]], 1, 0], "max_iter=0"),
]:
    try:
        k_median(*args)
    except ValueError:
        pass
    else:
        raise AssertionError(f"输入 {label}：期望 ValueError，实际没有拒绝非法参数")`,
        hints: [
          '把 day2 的分配和逐维中位数更新分别写成小函数；主循环只管理中心和迭代次数。',
          '每轮先保存 old_centers，再比较 updated == centers；停止后重新按最终中心分配一次。',
          '输出前统一用 f"{value:.6f}"，inertia 用最终 assignments 计算。',
        ],
        solution: String.raw`import math
import sys

def _manhattan(a, b):
    return sum(abs(x - y) for x, y in zip(a, b))

def _median(values):
    ordered = sorted(values)
    middle = len(ordered) // 2
    if len(ordered) % 2:
        return ordered[middle]
    return (ordered[middle - 1] + ordered[middle]) / 2

def _assign(points, centers):
    return [min(range(len(centers)), key=lambda i: (_manhattan(point, centers[i]), i)) for point in points]

def _update(points, assignments, centers):
    dimension = len(points[0])
    groups = [[] for _ in centers]
    for point, cluster in zip(points, assignments):
        groups[cluster].append(point)
    updated = []
    for old, group in zip(centers, groups):
        if not group:
            updated.append(list(old))
        else:
            updated.append([_median([point[d] for point in group]) for d in range(dimension)])
    return updated

def k_median(points, k, max_iter=100):
    if not points or not (1 <= k <= len(points)):
        raise ValueError("需要 1 <= k <= 点数")
    dimension = len(points[0])
    if dimension == 0 or any(len(point) != dimension for point in points):
        raise ValueError("点的维数不一致")
    if max_iter < 1:
        raise ValueError("max_iter 必须为正")
    centers = [list(map(float, point)) for point in points[:k]]
    iterations = 0
    for iteration in range(1, max_iter + 1):
        assignments = _assign(points, centers)
        updated = _update(points, assignments, centers)
        iterations = iteration
        if updated == centers:
            break
        centers = updated
    assignments = _assign(points, centers)
    inertia = sum(_manhattan(point, centers[cluster]) for point, cluster in zip(points, assignments))
    return centers, assignments, float(inertia), iterations

def solve_text(data):
    tokens = data.split()
    if not tokens:
        return ""
    cursor = iter(tokens)
    n, dimension, k = int(next(cursor)), int(next(cursor)), int(next(cursor))
    points = [[float(next(cursor)) for _ in range(dimension)] for _ in range(n)]
    centers, _, inertia, iterations = k_median(points, k)
    lines = [" ".join(f"{value:.6f}" for value in center) for center in centers]
    lines.extend([f"inertia {inertia:.6f}", f"iterations {iterations}"])
    return "\n".join(lines) + "\n"

if __name__ == "__main__":
    data = sys.stdin.read()
    if data.strip():
        print(solve_text(data), end="")`,
        acceptance: [
          '支持 stdin 的 n、d、k 格式，程序在没有输入时不会误报。',
          '停止条件明确，空簇继续保留旧中心，最终 inertia 使用最终分配。',
          'sample_output 与参考实现一致，并且不把 Manhattan 距离平方。',
        ],
      },
    ],
  },
  {
    id: 'day4',
    title: '单头注意力：缩放、mask 与稳定 softmax',
    goal: '先手算一个小例子，再用纯 Python 实现不会因大数溢出的 scaled dot-product attention。',
    minutes: 55,
    steps: [
      {
        id: 'day4-single-head-attention',
        title: '稳定的单头注意力',
        minutes: 45,
        lesson: '对每个 query，先算 q·k / sqrt(d)，再对允许的位置做 softmax，最后按权重加权 V。mask 约定 True 表示允许关注；先从分数中减去允许分数的最大值再 exp，避免极大输入溢出。全遮挡行在本练习中返回全 0。',
        task: '实现 single_head_attention(q, keys, values, mask=None)。本地规格：keys/values 非空且 token 数相同，q/key 维度相同，values 为非空矩形，mask 为 None 或长度 n；违反这些形状前提时必须 raise ValueError。q 是长度 d 的向量，keys 是 n×d，values 是 n×dv；返回长度 dv 的向量。先手算两个相等分数的平均，再测试 mask 和极大值。',
        examples: [
          {
            input: 'q=[1,1], keys=[[1,0],[0,1]], values=[[10,0],[0,20]]',
            expected: '[5.0, 10.0]（两个分数相等）',
          },
          {
            input: '同一输入，mask=[True, False]',
            expected: '[10.0, 0.0]（只看第一个键）',
          },
          {
            input: 'q=[1000], keys=[[1000],[-1000]], values=[[1],[99]]',
            expected: '[1.0]（稳定 softmax，不溢出）',
          },
        ],
        starter: String.raw`import math

def single_head_attention(q, keys, values, mask=None):
    # TODO: 点积 / sqrt(d)，应用 mask，稳定 softmax，加权求和
    pass`,
        tests: String.raw`result = single_head_attention([1, 1], [[1, 0], [0, 1]], [[10, 0], [0, 20]])
assert len(result) == 2, f"输入 value 维度 2：期望输出长度 2，实际 {len(result)}"
expected = [5, 10]
assert all(abs(a - b) < 1e-9 for a, b in zip(result, expected)), f"等分数输入：期望 {expected}，实际 {result}"
masked = single_head_attention([1, 1], [[1, 0], [0, 1]], [[10, 0], [0, 20]], [True, False])
assert masked == [10.0, 0.0], f"mask=[True, False]：期望 [10.0, 0.0]，实际 {masked}"
stable = single_head_attention([1000], [[1000], [-1000]], [[1], [99]])
assert len(stable) == 1, f"极大分数输入：期望输出长度 1，实际 {len(stable)}"
assert abs(stable[0] - 1.0) < 1e-12, f"极大分数输入：期望稳定输出 [1.0]，实际 {stable}"
all_hidden = single_head_attention([1, 1], [[1, 0], [0, 1]], [[10, 20], [30, 40]], [False, False])
assert all_hidden == [0.0, 0.0], f"全遮挡输入：期望 [0.0, 0.0]，实际 {all_hidden}"
for bad_mask, label in [([True], "mask 长度 1"), ([True, True, True], "mask 长度 3")]:
    try:
        single_head_attention([1], [[1], [2]], [[3], [4]], bad_mask)
    except ValueError:
        pass
    else:
        raise AssertionError(f"输入 {label}：期望 ValueError，实际接受了错误 mask")
try:
    single_head_attention([], [[1]], [[2]])
except ValueError:
    pass
else:
    raise AssertionError("输入空 query：期望 ValueError，实际接受了空向量")`,
        hints: [
          '先构造 scores；mask 为 False 的位置不要参与最大值、分母或输出。',
          '对允许分数减 max_score，再计算 exp(score - max_score) 和归一化分母。',
          '用双重循环按 value 维度累加，所有位置都被遮挡时直接返回零向量。',
        ],
        solution: String.raw`import math

def single_head_attention(q, keys, values, mask=None):
    if not keys or len(keys) != len(values):
        raise ValueError("keys 和 values 必须等长且非空")
    dimension = len(q)
    if dimension == 0 or any(len(key) != dimension for key in keys):
        raise ValueError("q/key 维数不一致")
    value_dimension = len(values[0])
    if value_dimension == 0 or any(len(value) != value_dimension for value in values):
        raise ValueError("value 维数不一致")
    if mask is None:
        mask = [True] * len(keys)
    if len(mask) != len(keys):
        raise ValueError("mask 长度不匹配")
    allowed = [i for i, visible in enumerate(mask) if visible]
    if not allowed:
        return [0.0] * value_dimension

    scale = math.sqrt(dimension)
    scores = [sum(q[j] * key[j] for j in range(dimension)) / scale for key in keys]
    maximum = max(scores[i] for i in allowed)
    weights = [0.0] * len(keys)
    denominator = sum(math.exp(scores[i] - maximum) for i in allowed)
    for i in allowed:
        weights[i] = math.exp(scores[i] - maximum) / denominator
    return [
        sum(weights[i] * values[i][j] for i in allowed)
        for j in range(value_dimension)
    ]`,
        acceptance: [
          '分数按 sqrt(d) 缩放，mask=False 的键不会影响结果。',
          'softmax 先减最大值，极大输入不会 OverflowError 或产生 NaN。',
          '全遮挡行按本题约定返回全 0，并校验基本形状。',
        ],
      },
    ],
  },
  {
    id: 'day5',
    title: 'GQA 整题：按列拆头、对应 KV 并拼接',
    goal: '理解 Query 头数与 KV 头数的分组关系，完成多 token 的 GQA，并用 stdin 样例验算形状与数值。',
    minutes: 60,
    steps: [
      {
        id: 'day5-gqa-full',
        title: 'Grouped Query Attention',
        minutes: 50,
        lesson: '输入矩阵按列切成头：Q 的列数是 query_heads×head_dim，K/V 的列数是 kv_heads×head_dim。每个 query 头 h 对应 kv 头 h // (query_heads // kv_heads)；每个头独立做缩放点积注意力，最后按 query 头顺序拼回每个 token 的列。',
        task: '实现 gqa(query, key, value, query_heads, kv_heads, head_dim, mask=None)。本地规格：Q/K/V 非空，列数与头数和 head_dim 匹配，query_heads、kv_heads、head_dim 为正且 query_heads 能被 kv_heads 整除；mask 为 None 或 query token 行数 × key token 列数。违反这些前提时必须 raise ValueError。本地 stdin 格式是 T Hq Hkv D，后面依次是 Q 的 T 行、K 的 T 行、V 的 T 行；输出 T 行拼接结果，每个数 6 位小数。',
        supportsStdin: true,
        sampleInput: String.raw`2 4 2 1
0 0 0 0
0 0 0 0
0 0
0 0
1 10
3 30`,
        examples: [
          {
            input: String.raw`2 4 2 1
0 0 0 0
0 0 0 0
0 0
0 0
1 10
3 30`,
            expected: String.raw`2.000000 2.000000 20.000000 20.000000
2.000000 2.000000 20.000000 20.000000`,
          },
          {
            input: String.raw`1 2 1 1
0 0
0
7`,
            expected: '7.000000 7.000000（一个 KV 头被两个 Query 头复用）',
          },
        ],
        starter: String.raw`import math
import sys

def gqa(query, key, value, query_heads, kv_heads, head_dim, mask=None):
    # TODO: 按列拆头；h 对应 h // (query_heads // kv_heads)
    # TODO: 每个 query token 做稳定单头注意力；按头拼回
    pass

def solve_text(data):
    # TODO: 解析 T Hq Hkv D、Q/K/V 三个矩阵
    pass

# 把 sampleInput 粘贴到 Standard Input 后，Run 会走这条入口。
if __name__ == "__main__":
    data = sys.stdin.read()
    if data.strip():
        result = solve_text(data)
        if result is not None:
            print(result, end="")`,
        tests: String.raw`query = [[0, 0, 0, 0], [0, 0, 0, 0]]
key = [[0, 0], [0, 0]]
value = [[1, 10], [3, 30]]
result = gqa(query, key, value, 4, 2, 1)
expected = [[2.0, 2.0, 20.0, 20.0], [2.0, 2.0, 20.0, 20.0]]
assert result == expected, f"分组映射输入：期望 {expected}，实际 {result}"
masked = gqa(query, key, value, 4, 2, 1, [[True, False], [False, True]])
expected_masked = [[1.0, 1.0, 10.0, 10.0], [3.0, 3.0, 30.0, 30.0]]
assert masked == expected_masked, f"逐 token mask：期望 {expected_masked}，实际 {masked}"
sample = """2 4 2 1
0 0 0 0
0 0 0 0
0 0
0 0
1 10
3 30
"""
actual_text = solve_text(sample)
expected_text = """2.000000 2.000000 20.000000 20.000000
2.000000 2.000000 20.000000 20.000000
"""
assert actual_text == expected_text, f"stdin sample：期望输出 {expected_text!r}，实际 {actual_text!r}"

single_token = gqa([[0, 0]], [[0]], [[7]], 2, 1, 1)
assert single_token == [[7.0, 7.0]], f"一个 KV 头复用：期望 [[7.0, 7.0]]，实际 {single_token}"
for args, label in [
    (([[0, 0]], [[0]], [[1]], 3, 2, 1), "query_heads 不能整除 kv_heads"),
    (([[0, 0]], [[0]], [[1]], 2, 1, 1, [[True, False]]), "mask 行列形状错误"),
]:
    try:
        gqa(*args)
    except ValueError:
        pass
    else:
        raise AssertionError(f"输入 {label}：期望 ValueError，实际接受了非法 GQA 形状")`,
        hints: [
          '先写 split_heads(matrix, head_count, head_dim)，切片范围是 h*head_dim:(h+1)*head_dim。',
          '检查 query_heads 能被 kv_heads 整除；每个 query 头的 KV 编号是 h // group_size。',
          '输出按 token 外层、query 头内层拼接；不要把 head 维和 token 维弄反。',
        ],
        solution: String.raw`import math
import sys

def _split_heads(matrix, head_count, head_dim):
    width = head_count * head_dim
    if any(len(row) != width for row in matrix):
        raise ValueError("矩阵列数与头形状不匹配")
    return [
        [row[head * head_dim:(head + 1) * head_dim] for row in matrix]
        for head in range(head_count)
    ]

def _attention(q, keys, values, mask=None):
    if mask is None:
        mask = [True] * len(keys)
    allowed = [i for i, visible in enumerate(mask) if visible]
    if not allowed:
        return [0.0] * len(values[0])
    scale = math.sqrt(len(q))
    scores = [sum(x * y for x, y in zip(q, key)) / scale for key in keys]
    maximum = max(scores[i] for i in allowed)
    weights = [0.0] * len(keys)
    denominator = sum(math.exp(scores[i] - maximum) for i in allowed)
    for i in allowed:
        weights[i] = math.exp(scores[i] - maximum) / denominator
    return [sum(weights[i] * values[i][j] for i in allowed) for j in range(len(values[0]))]

def gqa(query, key, value, query_heads, kv_heads, head_dim, mask=None):
    if query_heads < 1 or kv_heads < 1 or query_heads % kv_heads != 0 or head_dim < 1:
        raise ValueError("头数必须为正，且 query_heads 是 kv_heads 的整数倍")
    if len(key) != len(value) or not query or not key:
        raise ValueError("Q/K/V 不能为空且 K/V token 数须一致")
    q_heads = _split_heads(query, query_heads, head_dim)
    k_heads = _split_heads(key, kv_heads, head_dim)
    v_heads = _split_heads(value, kv_heads, head_dim)
    if mask is not None and (len(mask) != len(query) or any(len(row) != len(key) for row in mask)):
        raise ValueError("mask 形状不匹配")
    group_size = query_heads // kv_heads
    output = []
    for token in range(len(query)):
        row = []
        for query_head in range(query_heads):
            kv_head = query_head // group_size
            row.extend(_attention(q_heads[query_head][token], k_heads[kv_head], v_heads[kv_head], None if mask is None else mask[token]))
        output.append(row)
    return output

def solve_text(data):
    tokens = data.split()
    if not tokens:
        return ""
    cursor = iter(tokens)
    token_count, query_heads, kv_heads, head_dim = (int(next(cursor)) for _ in range(4))
    query = [[float(next(cursor)) for _ in range(query_heads * head_dim)] for _ in range(token_count)]
    key = [[float(next(cursor)) for _ in range(kv_heads * head_dim)] for _ in range(token_count)]
    value = [[float(next(cursor)) for _ in range(kv_heads * head_dim)] for _ in range(token_count)]
    output = gqa(query, key, value, query_heads, kv_heads, head_dim)
    return "\n".join(" ".join(f"{number:.6f}" for number in row) for row in output) + "\n"

if __name__ == "__main__":
    data = sys.stdin.read()
    if data.strip():
        print(solve_text(data), end="")`,
        acceptance: [
          '按列拆头后的 Q/K/V 形状正确，query_heads 必须是 kv_heads 的整数倍。',
          'query 头 h 使用 KV 头 h // group_size，输出重新按 query 头顺序拼接。',
          'stdin sample_output 通过；mask 和极端分数仍沿用稳定 softmax 规则。',
        ],
      },
    ],
  },
  {
    id: 'day6',
    title: '查漏补缺：形状、SVD、学习方式、量化与推理阶段',
    goal: '把算法代码背后的形状和概念说清楚，避免会写局部函数却解释不了工程边界。',
    minutes: 50,
    steps: [
      {
        id: 'day6-attention-shapes',
        title: '用代码核对注意力形状',
        minutes: 20,
        lesson: '形状练习：输入是 [B, N, d_model]；Q 头为 [B, Hq, N, d_head]，GQA 的 K/V 为 [B, Hkv, N, d_head]，分数为 [B, Hq, N, N]，输出回到 [B, N, d_model]。概念复述时补上：SVD 将矩阵写成 UΣVᵀ，截断奇异值是低秩近似；量化需要 scale、舍入和误差边界；Prefill 并行处理提示词，Decode 通常一次生成一个 token 并复用 KV cache。学习闭环是先复写、再解释、再测边界。',
        task: '实现 attention_shapes，输入 batch、seq_len、d_model、query_heads、kv_heads，返回一个字典，列出 input/q/k/v/scores/output/kv_cache_per_token 的 tuple 形状。所有尺寸必须是正整数；d_model 可被 query_heads 整除，query_heads 可被 kv_heads 整除；违反这些前提时必须 raise ValueError。',
        examples: [
          {
            input: 'batch=2, seq_len=5, d_model=8, query_heads=4, kv_heads=2',
            expected: 'head_dim=2；q=(2,4,5,2)，scores=(2,4,5,5)，output=(2,5,8)',
          },
          {
            input: 'batch=1, seq_len=1, d_model=6, query_heads=3, kv_heads=1',
            expected: 'head_dim=2；k/v=(1,1,1,2)，kv_cache_per_token=(1,4)',
          },
        ],
        starter: String.raw`def attention_shapes(batch, seq_len, d_model, query_heads, kv_heads):
    # TODO: 校验整除关系并返回各张量形状
    pass`,
        tests: String.raw`shapes = attention_shapes(2, 5, 8, 4, 2)
expected = {
    "input": (2, 5, 8),
    "q": (2, 4, 5, 2),
    "k": (2, 2, 5, 2),
    "v": (2, 2, 5, 2),
    "scores": (2, 4, 5, 5),
    "output": (2, 5, 8),
    "kv_cache_per_token": (2, 4),
}
assert shapes == expected, f"输入 (2,5,8,4,2)：期望形状 {expected}，实际 {shapes}"
edge = attention_shapes(1, 1, 2, 1, 1)
assert edge["scores"] == (1, 1, 1, 1), f"单 token：期望 scores=(1,1,1,1)，实际 {edge['scores']}"
for bad in [(2, 5, 10, 4, 2), (2, 5, 8, 3, 2), (2, 5, 8, 4, 3)]:
    try:
        attention_shapes(*bad)
    except ValueError:
        pass
    else:
        raise AssertionError(f"输入形状 {bad}：期望 ValueError，实际接受了不合法头形状")
for bad in [(0, 1, 2, 1, 1), (1, 0, 2, 1, 1), (1, 1, 2, 0, 1)]:
    try:
        attention_shapes(*bad)
    except ValueError:
        pass
    else:
        raise AssertionError(f"输入尺寸 {bad}：期望 ValueError，实际接受了非正尺寸")`,
        hints: [
          '先检查所有尺寸为正，再算 head_dim = d_model // query_heads。',
          'GQA 的 K/V 仍用同一个 head_dim；kv_cache_per_token 把 K 与 V 的两份宽度相加。',
          'scores 的最后两维都是 seq_len；output 合并回 d_model。',
        ],
        solution: String.raw`def attention_shapes(batch, seq_len, d_model, query_heads, kv_heads):
    values = [batch, seq_len, d_model, query_heads, kv_heads]
    if any(not isinstance(value, int) or value < 1 for value in values):
        raise ValueError("所有形状尺寸必须为正整数")
    if d_model % query_heads != 0 or query_heads % kv_heads != 0:
        raise ValueError("头数与 d_model 不满足 GQA 整除关系")
    head_dim = d_model // query_heads
    return {
        "input": (batch, seq_len, d_model),
        "q": (batch, query_heads, seq_len, head_dim),
        "k": (batch, kv_heads, seq_len, head_dim),
        "v": (batch, kv_heads, seq_len, head_dim),
        "scores": (batch, query_heads, seq_len, seq_len),
        "output": (batch, seq_len, d_model),
        "kv_cache_per_token": (kv_heads, 2 * head_dim),
    }`,
        acceptance: [
          '能从函数返回值读出 Q/K/V、scores、output 的每一维含义。',
          '能口述 SVD、量化、Prefill/Decode 与 KV cache 的关系，而不是只背缩写。',
          '非法整除关系明确报错，不用广播掩盖形状错误。',
        ],
      },
      {
        id: 'day6-symmetric-quantization',
        title: '对称量化小练习',
        minutes: 15,
        lesson: '用一个 scale 将浮点值映射到有符号整数范围。8 bit 对称量化的 qmax 是 127；scale 取 max(abs(values))/qmax，零向量用 scale=1 避免除零。量化误差要通过反量化后的值观察，而不是声称“量化没有损失”。',
        task: '实现 quantize_symmetric(values, bits=8)，返回 (quantized, scale, dequantized)。本地规格：values 非空，bits 为 2 到 16 的整数；违反这些前提时必须 raise ValueError。本题只练逐元素缩放、截断与反量化；不调用 numpy。',
        examples: [
          { input: 'values=[-1,0,1], bits=8', expected: 'quantized=[-127,0,127]；scale=1/127；反量化回 [-1,0,1]' },
          { input: 'values=[0,0], bits=4', expected: 'quantized=[0,0]；scale=1；dequantized=[0,0]' },
        ],
        starter: String.raw`def quantize_symmetric(values, bits=8):
    # TODO
    pass`,
        tests: String.raw`quantized, scale, dequantized = quantize_symmetric([-1, 0, 1])
assert quantized == [-127, 0, 127], f"输入 [-1,0,1], bits=8：期望 [-127,0,127]，实际 {quantized}"
assert abs(scale - 1 / 127) < 1e-12, f"期望 scale=1/127，实际 {scale}"
expected_dequantized = [-1, 0, 1]
assert len(dequantized) == len(expected_dequantized), f"反量化长度：期望 {len(expected_dequantized)}，实际 {len(dequantized)}"
assert all(abs(a - b) < 1e-12 for a, b in zip(dequantized, expected_dequantized)), f"期望精确反量化 {expected_dequantized}，实际 {dequantized}"
zero_q, zero_scale, zero_dq = quantize_symmetric([0, 0], bits=4)
assert zero_q == [0, 0] and zero_scale == 1 and zero_dq == [0, 0], f"零向量 bits=4：期望 ([0,0],1,[0,0])，实际 {(zero_q, zero_scale, zero_dq)}"
clipped_q, clipped_scale, clipped_dq = quantize_symmetric([-10, 10], bits=2)
assert clipped_q == [-1, 1] and clipped_scale == 10, f"bits=2 截断：期望 q=[-1,1], scale=10，实际 {(clipped_q, clipped_scale)}"
assert clipped_dq == [-10, 10], f"bits=2 反量化：期望 [-10,10]，实际 {clipped_dq}"
try:
    quantize_symmetric([], bits=8)
except ValueError:
    pass
else:
    raise AssertionError("输入 []：期望 ValueError，实际没有拒绝空列表")
for bad_bits in [1, 17]:
    try:
        quantize_symmetric([1], bits=bad_bits)
    except ValueError:
        pass
    else:
        raise AssertionError(f"输入 bits={bad_bits}：期望 ValueError，实际接受了非法位宽")`,
        hints: [
          'qmax = 2 ** (bits - 1) - 1；先找 max_abs，再决定 scale。',
          'round(value / scale) 后限制到 [-qmax, qmax]，最后乘回 scale。',
          '全零输入单独用 scale=1，避免 0/0。',
        ],
        solution: String.raw`def quantize_symmetric(values, bits=8):
    if not values or not isinstance(bits, int) or not 2 <= bits <= 16:
        raise ValueError("values 非空，bits 取 2 到 16")
    qmax = 2 ** (bits - 1) - 1
    maximum = max(abs(value) for value in values)
    scale = maximum / qmax if maximum else 1
    quantized = [max(-qmax, min(qmax, int(round(value / scale)))) for value in values]
    dequantized = [value * scale for value in quantized]
    return quantized, scale, dequantized`,
        acceptance: [
          '能解释 qmax、scale、舍入、截断和反量化的各自作用。',
          '零向量不除零，位宽非法或输入为空时明确报错。',
          '知道量化误差取决于 scale/数据分布，不能把一个小样例当作普遍保证。',
        ],
      },
    ],
  },
  {
    id: 'day7',
    title: '限时自测：概念 10 分钟 + K-Median 25 分钟 + GQA 25 分钟',
    goal: '在不看课程答案的情况下完成一轮可计时模拟，记录卡点并为下一轮确定一个具体改进动作。',
    minutes: 60,
    steps: [
      {
        id: 'day7-concepts',
        title: '10 分钟：概念口述检查',
        minutes: 10,
        lesson: '用 10 分钟闭卷口述四件事：SVD 的 A=UΣVᵀ 与截断奇异值；Q/K/V 和 scores 的矩阵形状；scale、舍入、误差的量化链路；Prefill 并行处理提示词、Decode 逐 token 生成并复用 KV cache。把自己的解释写进复盘，再检查漏答项。',
        task: '实现 concept_check(answer)，输入你的口述文字，返回 svd、shapes、quantization、prefill_decode 四个布尔值。先计时 10 分钟写/说答案，再运行断言找缺口；答案中的关键词只是自检提示，不是考试评分器。',
        examples: [
          {
            input: '复盘提纲：1) 分解式与截断保留什么；2) Q/K/V/scores 形状；3) scale、舍入与误差；4) Prefill/Decode/KV cache',
            expected: '写出四段自己的解释，并标出仍不确定的术语；此样例不自动评分',
          },
          {
            input: '复盘提纲：已写第 1、2、3 段；第 4 段留空，准备补写阶段差异和缓存内容',
            expected: '补写第 4 段并记录一个待复习点；此样例不自动评分',
          },
        ],
        starter: String.raw`def concept_check(answer):
    # TODO: 让自检结果指出四个主题是否都被提到
    pass`,
        tests: String.raw`answer = """SVD writes A=U Sigma V^T and truncates singular values.
Q K V shapes include batch, sequence, heads and d_head; scores are attention shape.
Quantization chooses a scale, rounds values and measures error.
Prefill handles prompt tokens in parallel; decode generates one token and reuses KV cache."""
expected = {
    "svd": True,
    "shapes": True,
    "quantization": True,
    "prefill_decode": True,
}
actual = concept_check(answer)
assert actual == expected, f"完整概念输入：期望 {expected}，实际 {actual}"
partial = "SVD uses U Sigma V; Q K V shape; scale and error."
actual_partial = concept_check(partial)
assert actual_partial["prefill_decode"] is False, f"缺少 prefill/decode/kv：期望 False，实际 {actual_partial['prefill_decode']}"`,
        hints: [
          '先把答案统一成小写字符串，再为每个主题列出 2–4 个必须出现的关键词。',
          'SVD 至少检查 u、sigma、v；形状至少检查 q、k、v、shape。',
          '量化检查 scale/error，推理阶段检查 prefill/decode/kv；返回每项布尔值。',
        ],
        solution: String.raw`def concept_check(answer):
    text = answer.lower()
    required = {
        "svd": ["svd", "sigma", "u", "v"],
        "shapes": ["q", "k", "v", "shape"],
        "quantization": ["scale", "error"],
        "prefill_decode": ["prefill", "decode", "kv"],
    }
    return {topic: all(word in text for word in words) for topic, words in required.items()}`,
        acceptance: [
          '10 分钟内能用自己的话说出四个主题的定义、形状或阶段差异。',
          '自检结果能指出缺失主题，但不把关键词命中当作掌握证明。',
          '至少记录一个需要在下一轮重新推导的概念。',
        ],
      },

    ],
  },
]

// Reuse the full-program contracts for closed-book acceptance on day seven.
SPRINT_DAYS[6].steps[1] = {
  ...SPRINT_DAYS[2].steps[0], id: 'day7-kmedian-timed', minutes: 25,
  title: '25 分钟：闭卷 K-Median 整题',
  lesson: '闭卷完成第 3 天的完整程序：输入解析、迭代、停止条件、并列归属、空簇、inertia 与格式化输出。只有 30 分钟时，可先测这一题或 GQA 中更薄弱的一题。',
}
SPRINT_DAYS[6].steps[2] = {
  ...SPRINT_DAYS[4].steps[0], id: 'day7-gqa-timed', minutes: 25,
  title: '25 分钟：闭卷 GQA 整题',
  lesson: '闭卷完成第 5 天的完整程序：输入解析、按列拆头、Query 到 KV 映射、稳定 softmax、mask 与按头拼接输出。先跑通主路径，再补边界。',
}
SPRINT_DAYS[6].steps[0].kind = 'recall'
SPRINT_DAYS[6].steps[0].task = '在下方复盘框写出自己的回答：1. SVD 与截断 SVD 的区别是什么？2. Q、K、V 和 scores 的矩阵形状是什么？3. 量化的 scale、舍入和误差如何关联？4. Prefill 与 Decode 有何区别，KV cache 缓存什么？先闭卷回答，再对照参考。口述完成由你自行记录，不自动评分。'
SPRINT_DAYS[6].steps[0].reference = '1. SVD 将矩阵分解为 UΣVᵀ；截断 SVD 保留较大的奇异值，得到低秩近似。\n\n2. 每个头 Q 为 n_q×d，K 为 n_k×d，V 为 n_k×d_v；scores 为 n_q×n_k，输出为 n_q×d_v。\n\n3. 量化利用 scale 将浮点映射到整数，舍入和截断引入误差；应根据实际精度要求验证。\n\n4. Prefill 处理提示词，多个位置通常可以并行；Decode 逐 token 生成，复用已计算的 Key、Value，减少历史位置的重复计算。'
export default SPRINT_DAYS
