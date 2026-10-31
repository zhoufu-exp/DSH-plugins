# Download Center

DSH Web 插件：在左侧栏加入「下载中心」面板，并在右侧文件预览的标题栏加入下载按钮。

[English](#english) · [返回插件列表](../README.md)

## 功能

- **预览标题栏下载按钮**：在右侧边栏打开文件后，点标题栏的下载图标，即可把当前文件交给浏览器保存到本地。
- **下载中心面板**：左侧栏新增入口，按时间倒序列出本次页面生命周期内保存过的文件（文件名、所在目录、大小、保存时间），最多保留 40 条。
- **重新下载**：每条记录都可再次保存，无需重新打开文件。
- **结果提示**：成功或失败都会弹出浮层提示；失败会区分「超出大小上限」「文件不存在或已被移动」「不是普通文件」等原因。
- **中英文文案**：跟随 DSH 的语言偏好切换。

## 安装

前置条件：DSH `0.2.1-rc.2` 或更高版本，`pnpm` 在 PATH 中。

```bash
dsh plugin --profile web add dsh-export-center
```

安装后需要**重启 DSH**（`dsh web`）再刷新页面：Web 客户端的插件清单在启动时生成，新插件不会被热插入。

卸载：

```bash
dsh plugin --profile web remove dsh-export-center
```

## 使用

1. 在右侧边栏打开任意文件。
2. 点击预览标题栏中的下载按钮。
3. 文件立即保存到本地，同时出现在左侧栏「下载中心」的列表里，可随时「重新下载」。

## 限制

- 下载记录只保存在页面内存里，最多 40 条；刷新或关闭页面后清空，不写入磁盘。
- 文件内容通过当前会话的 workspace 文件服务读取，受宿主的字节上限约束，超限时提示失败。
- 仅处理普通文件；目录、符号链接解析失败等情况会给出对应提示。

## 实现说明

- 插件以 DSH bundle 形态分发：`package.json` 的 `dsh.bundle.patch` 指向 `cordis.patch.yml`，安装后其入口被插入 profile 配置树。
- Host 半边 `index.js` 为空（所有界面都在 Client）。
- Client 半边 `client.js` 注册四个插槽：`sidebar.panellist`（面板入口）、`main`（面板内容）、`sidebar.right.tab.document.actions`（预览标题栏按钮）、`shell.overlay`（结果提示），并通过 `remote.workspaceFiles.readBytes` 读取文件字节。
- 无构建步骤，`client.js` 直接由 Web 宿主下发。

## 兼容性

- DSH `0.2.1-rc.2` 的 `web` profile 上验证通过；
- 依赖的插槽与 Remote 接口：`sidebar.panellist`、`main`、`sidebar.right.tab.document.actions`、`shell.overlay`、`remote.workspaceFiles.readBytes`。

## 许可证

[MIT](../LICENSE)

## English

A DSH Web plugin that adds a **Download Center** panel to the left sidebar and a download button to the right-sidebar file preview header.

- Downloads the currently previewed file through the browser.
- Keeps an in-memory list (max 40 entries) of the files saved during this page's lifetime, with re-download, clear, and toast feedback (size limit, missing file, not a regular file).
- Localized in Chinese and English, following the DSH locale preference.

Install (DSH `0.2.1-rc.2`+, `pnpm` on `PATH`):

```bash
dsh plugin --profile web add dsh-export-center
```

Restart DSH, then reload the page. Uninstall with `dsh plugin --profile web remove dsh-export-center`.

The history is page-lifetime only and is not persisted. File reads go through the session's workspace file service, so the host's byte limit applies.

[MIT](../LICENSE)
