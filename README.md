# Drama Tavern MVP

演示目标：把“抖音短剧 URL → 剧情抽取 → 纯对话跑团”这条链路做成可展示 Demo。

这是从 TBird / Novelbox 抽出的独立静态演示库。仓库只保留 demo 页面和跑团所需的最小 domain/controller 依赖，方便私有演示和部署。

## 启动

线上演示：

```text
https://ccbili30-collab.github.io/drama-roleplay-demo/
```

二维码：

![演示二维码](assets/demo-qr.svg)

在仓库根目录运行：

```powershell
npm run serve
```

打开：

```text
http://127.0.0.1:8787/
```

如果直接用 Python：

```powershell
python -m http.server 8787 --bind 127.0.0.1
```

打开：

```text
http://127.0.0.1:8787/
```

## 当前能力

- 先展示竖屏短剧播放入口；播放结束后播放器轻微跳动，并显示“上滑进入跑团模式”。
- 上滑、滚轮或点击提示后进入付费通道；演示版用“模拟支付”代替真实支付。
- 支付后展示“读取短剧、抽出主线、生成对话跑团”的模拟流程。
- 生成一个短剧样例：内部角色卡、场景、剧情锚点，并转换成跑团 `sourceNovel`。
- 直接复用现有跑团 controller：`startRoleplayRunFromText`、`buildActiveRoleplayMessages`、`commitRoleplayOutput`、`addRoleplayDeviation`。
- 进入纯对话界面：剧情旁白、角色发言、玩家行动都以聊天气泡追加。
- 角色卡只作为内部数据存在，不再外露为左右面板。
- 输入栏旁提供“背包/状态”展开按钮，用于查看体力、信任、线索和当前可用物品。
- 装备支持勾选；提交行动时会把已携带工具一起写入本次跑团 userInstruction。
- 用户可以点击继续跟随原剧情，也可以输入一句行动并携带工具制造跑团 deviation。

## MVP 边界

- 当前不真实抓取抖音视频，URL 是演示入口。
- 当前不上传真实短视频素材，首页使用同剧情气质的竖屏模拟播放器演示交互。
- 当前不接真实支付，付费通道是演示弹层。
- 当前不调用真实 AI，GM 输出为本地演示逻辑，但 prompt/messages 由跑团上下文构建器生成。
- 重点验证产品形态：短剧剧情被转换成结构化文本后，复用小说跑团的锚点、偏移和游标推进。

## 下一步可接入

- 抖音 URL 下载/解析器。
- ASR/OCR/抽帧生成真实 `dramaSource.json`。
- 接入真实视频播放、播放结束事件和支付回调。
- 接入 OpenAI-compatible GM 生成。
- 将 `dramaSource.json` 自动映射为 `text + structurePlan`，替换当前本地样例。
