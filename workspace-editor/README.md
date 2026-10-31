# Workspace Text Editor

DSH Web 插件：在右侧栏文件浏览器中直接编辑 UTF-8 文本文件，保存带版本校验，并保留本地草稿。

[English](#english) · [返回插件列表](../README.md)

## 功能

- **预览标题栏「编辑」按钮**：在右侧边栏打开文本文件后，点标题栏中的铅笔图标（位于文件路径与「Markdown」渲染器选择器之间）即可进入编辑。
- **独立编辑器页签**：在右侧栏内新开一个编辑器页签，与预览页签并排；页签的内容地址就是文件地址，刷新页面后可恢复。
- **版本守卫保存**：保存时携带打开/上次保存时的文件版本；文件被其他程序改过会弹冲突条，可选择「重新加载」或显式「覆盖保存」，不会静默覆盖新内容。
- **外部变更提示**：编辑期间文件在磁盘上变化时给出提示；未保存时提示保存会冲突。
- **只读会话保护**：会话权限为 `read-only` 时，打开即提示并禁止编辑/保存；`workspace-write` 下只能保存到会话工作区内。
- **本地草稿**：未保存内容按 500ms 防抖写入 `localStorage`；关闭页签、刷新页面或重新打开文件后提示「已恢复未保存的草稿」，可一键丢弃。
- **明确的上限与错误**：超过 2 MiB、非 UTF-8、二进制、文件不存在、符号链接、权限不足等情况都有对应提示。
- **中英文文案**，跟随 DSH 的语言偏好。

## 安装

前置条件：DSH `0.2.1-rc.5` 上验证通过，`pnpm` 在 PATH 中。

```bash
dsh plugin --profile web add dsh-workspace-editor
```

安装后需要**重启 DSH**（`dsh web`）再刷新页面：Web 客户端的插件清单在启动时生成。

卸载：

```bash
dsh plugin --profile web remove dsh-workspace-editor
```

## 使用

1. 右侧栏打开「文件」页签，点一个文本文件进入预览。
2. 点预览标题栏的铅笔按钮，打开编辑器页签。
3. 直接修改；按 `Ctrl/Cmd+S` 或点保存图标写回磁盘。
4. 页签标题出现 `•` 表示有未保存修改；保存成功后显示「已保存」。
5. 如果文件被外部修改，按提示重新加载或覆盖保存。

## 限制

- 纯文本编辑，没有语法高亮、文件内搜索替换或行号。
- 仅支持 UTF-8 文本，单文件上限 2 MiB；CRLF 文件在 textarea 中可能被规范化为 LF。
- 暂不支持新建、重命名、删除文件；这些操作请用文件树之外的方式完成。
- UI 编辑不会写入会话日志，模型下次读取文件时才能看到变化。
- 只读会话、工作区之外的文件（`workspace-write` 模式下）不能保存。
- 草稿存放在浏览器 `localStorage`，不会同步到其他设备；清理浏览器数据会丢失草稿。

## 实现说明

- 插件以 DSH bundle 形态分发：`package.json` 的 `dsh.bundle.patch` 指向 `cordis.patch.yml`，`dsh.client` 声明 Web 平台与加载顺序。
- **Host 半边** `index.js` 通过 `ctx.connection.fetch.register` 注册两条仅 owner 可用的 `/api` 路由：
  - `POST /api/workspace-editor/context`：返回会话的工作区根与当前沙箱模式；
  - `POST /api/workspace-editor/save`：用 `ctx.fs.writeText(..., { kind: 'replaceIfVersion', version }, ..., sandboxPolicy)` 做原子、带版本守卫的保存。
  会话根优先取 `ctx.sessions`，冷会话回退 `sessionPersistence`，权限通过 `ctx.sandboxPolicy.resolve({ session })` 解析。
- **Client 半边** `client.js`：
  - 注册资源页签类型 `workspace-editor`，`patterns: []`，因此普通点击文件仍进预览，只有显式 `openResource(address, { kind: 'workspace-editor' })` 才进编辑器；文件地址作为 `contentId`，刷新可恢复；
  - 注册 `sidebar.right.pane.tab`（编辑器主体）与 `sidebar.right.pane.tab.title`（页签标题 + 脏标记）；
  - 注册 `sidebar.right.tab.document.actions` 的铅笔按钮，使用 `order` 让它排在文件路径之后、渲染器选择器之前；
  - 读取走 `remote.workspaceFiles.stat/readBytes`，保存走上面的 Host 路由；
  - 草稿存 `localStorage`，键包含会话与绝对路径。
- 无构建步骤，`client.js` 直接由 Web 宿主下发。

## 兼容性

- DSH `0.2.1-rc.5` 的 `web` profile 上验证通过；
- 依赖的插槽：`sidebar.right.tab.document.actions`、`sidebar.right.pane.tab`、`sidebar.right.pane.tab.title`；
- 依赖的服务/接口：`ctx.connection.fetch`、`ctx.fs`、`ctx.sandboxPolicy`、`ctx.sessions`、`remote.workspaceFiles`、`ctx.sidebarRightTabs`。

## 许可证

[MIT](../LICENSE)

## English

A DSH Web plugin that edits UTF-8 text files directly from the right-sidebar file browser, with version-guarded saving and local drafts.

Features:

- An **Edit** pencil in the preview header, placed between the file path and the renderer selector (left of “Markdown”).
- A dedicated editor tab in the right sidebar; the file address is the tab's content id, so it restores after a reload.
- Saves carry the version the editor opened or last saved; an external change raises a conflict bar with **Reload** or **Overwrite**, never a silent overwrite.
- A read-only session disables editing and saving; `workspace-write` confines saves to the session workspace.
- Unsaved text is debounced into `localStorage`; reopening the tab or page offers to restore the draft.
- Clear errors for files over 2 MiB, non-UTF-8 or binary content, missing files, symlinks, and permission denials.
- Chinese and English copy following the DSH locale.

Install (DSH `0.2.1-rc.5` verified, `pnpm` on `PATH`):

```bash
dsh plugin --profile web add dsh-workspace-editor
```

Restart DSH and reload the page. Uninstall with:

```bash
dsh plugin --profile web remove dsh-workspace-editor
```

Limitations: plain text only (no highlighting, in-file search, or line numbers), 2 MiB / UTF-8 only, CRLF may be normalized to LF, no create/rename/delete, UI edits are not written to the session log, and read-only sessions cannot save.

The Host half registers owner-only `/api/workspace-editor/context` and `/api/workspace-editor/save` routes; saves use `ctx.fs.writeText` with `{ kind: 'replaceIfVersion' }` under the session sandbox policy. The Client half registers a resource tab type (`workspace-editor`, no globs, explicit open only), the editor body/title seats, and the preview pencil action; reads use `remote.workspaceFiles.stat/readBytes`.

[MIT](../LICENSE)
