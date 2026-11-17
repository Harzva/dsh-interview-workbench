# DSH 面试与笔试工作台

在 DeepSeek Harness 侧栏打开「面试训练」，按 AI 算法或 Agent 工程方向浏览题目，进行教练练习或模拟面试。答题记录和复盘保存在本机的 DSH 数据目录。

预置题库只含两道新写的合成示例，分别演示 AI 算法和 Agent 工程方向。Harzva 保留原作品权利并允许公开阅读源码。复制、修改、分发等其他使用须另获授权。授权条款见 [LICENSE](LICENSE)，第三方组件及其许可见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

## 本地构建

以下步骤供已获授权的构建者使用。需要 Node.js 22.19 或更新版本。插件清单面向 DeepSeek Harness 0.2.0-rc.2 的 Web 客户端，构建时生成客户端和预设文件。

```sh
npm ci
npm run build
npm run check
npm run pack:dsh
```

`check` 在合成题库上验证选题、计入练习、模拟答题期间隐藏参考答案、结束后自评和重新打开练习。这个检查无需模型或平台账号。打包命令将安装包及 SHA-256 清单写入 `.local/releases/`。
