# DSH Plugins

[中文](#中文) · [English](#english)

DeepSeek Harness（DSH）插件集合。每个子目录是一个独立、可单独安装的插件包。

## 中文

### 插件列表

| 插件 | 说明 | 平台 |
| --- | --- | --- |
| [download-center](./download-center/) | 左侧栏「下载中心」面板 + 右侧文件预览标题栏的下载按钮，并记录本次页面内保存过的文件 | Web |

### 安装

前置条件：

- DSH `0.2.1-rc.2` 或更高版本；
- `pnpm` 在 PATH 中（DSH 通过 pnpm 安装插件；缺失时会报 `spawn pnpm ENOENT`）；
- 将本仓库克隆到本地任意目录（插件以本地目录形式安装）。

```bash
git clone https://github.com/zhoufu-exp/DSH-plugins.git
dsh plugin --profile web add ./DSH-plugins/download-center
```

安装完成后需要**重启 DSH**（`dsh web`）才能加载新插件：Web 客户端在启动时生成插件清单，新插件不会热插入。重启后刷新页面即可看到左侧边栏入口。

卸载：

```bash
dsh plugin --profile web remove @local/download-center
```

升级：`git pull` 后重新执行一次 `dsh plugin --profile web add ./DSH-plugins/download-center`，再重启 DSH。

### 目录结构

```
DSH-plugins/
├── LICENSE
├── README.md
└── download-center/            # 一个完整的 DSH 插件包
    ├── package.json            # dsh.bundle.patch / dsh.client 声明
    ├── cordis.patch.yml        # 插件自带的配置层（insert 入口）
    ├── index.js                # Host 半边
    ├── client.js               # Client 半边（Web 平台）
    ├── icon.svg
    └── locale/
        ├── en.json
        └── zh.json
```

### 开发

插件使用 DSH 的「bundle」形态：包内 `package.json` 的 `dsh.bundle.patch` 指向自带的 `cordis.patch.yml`，安装到 profile 后会被加入 `dsh.profile.bundles`。Host 半边与 Client 半边都是普通 ES 模块，无需构建步骤；`client.js` 通过 `window.__ModuleLoader__.load(...)` 注册，由 Web 宿主按需下发。

调试时可用：

```bash
dsh --profile web --dump-config | grep -A2 download-center
```

确认插件已进入合成后的配置树。

### 许可证

[MIT](./LICENSE)

## English

### Plugins

| Plugin | Description | Platform |
| --- | --- | --- |
| [download-center](./download-center/) | A Download Center panel in the left sidebar plus a download button in the right-sidebar file preview header, with an in-page history of saved files | Web |

### Install

Requirements:

- DSH `0.2.1-rc.2` or newer;
- `pnpm` on `PATH` (DSH installs plugins through pnpm; without it you get `spawn pnpm ENOENT`);
- This repository cloned somewhere locally (plugins are installed from a local directory).

```bash
git clone https://github.com/zhoufu-exp/DSH-plugins.git
dsh plugin --profile web add ./DSH-plugins/download-center
```

Restart DSH afterwards: the Web client builds its plugin manifest at startup, so a freshly installed bundle is not hot-inserted. Reload the page after the restart.

Uninstall:

```bash
dsh plugin --profile web remove @local/download-center
```

### Layout

Each top-level directory is a self-contained plugin package: `package.json` declares `dsh.bundle.patch` and `dsh.client`, `cordis.patch.yml` carries the package's own configuration layer, `index.js` is the host half and `client.js` the Web client half.

### License

[MIT](./LICENSE)
