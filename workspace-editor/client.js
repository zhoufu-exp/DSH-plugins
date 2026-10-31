window.__ModuleLoader__.load({
  id: '@local/dsh-workspace-editor',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    /** Locale namespace owned by this plugin. */
    const NS = 'workspaceEditor';
    /** This implementation's identity in the tab system, and the key its body and title register under. */
    const EDITOR_ID = '@local/dsh-workspace-editor';
    /** The page kind opened explicitly from the preview header. */
    const EDITOR_KIND = 'workspace-editor';
    /** Read/save ceiling; the Host enforces the same text ceiling on the wire. */
    const MAX_BYTES = 2 * 1024 * 1024;
    /** Drafts above this size are not persisted, to stay inside localStorage quotas. */
    const DRAFT_LIMIT = 512 * 1024;
    /** The file-address prefix shared with the shipped workspace path helpers. */
    const FILE_PREFIX = 'dsh-resource://file/session/';
    /** Draft records are scoped to one session and one absolute path. */
    const DRAFT_PREFIX = 'dsh.workspace-editor.draft.v1:';

    const zh = {
      'button.edit': '编辑此文件',
      'button.save': '保存',
      'button.saving': '保存中…',
      'button.reload': '重新加载',
      'button.retry': '重试',
      'button.overwrite': '覆盖保存',
      'button.discardDraft': '丢弃草稿',
      'button.cancel': '取消',
      'button.dismiss': '关闭提示',
      'status.saved': '已保存',
      'status.unsaved': '未保存',
      'status.readOnly': '只读',
      'status.meta': '{lines} 行 · {chars} 字符',
      'status.mode': '权限：{mode}',
      loading: '正在读取…',
      'notice.draft': '已恢复未保存的草稿。',
      'notice.draftStale': '已恢复未保存的草稿（基于旧版本，保存会冲突）。',
      'notice.external': '文件已在磁盘上更新。',
      'conflict.title': '文件已被其他程序修改',
      'conflict.body': '直接保存会覆盖磁盘上的新内容。可以重新加载查看新版本，或显式覆盖保存。',
      'confirm.title': '有未保存的修改',
      'confirm.body': '重新加载会丢弃当前编辑内容。',
      'banner.readOnly': '当前会话是只读权限（read-only），不能保存修改。',
      'error.tooLarge': '文件超过 {limit}，无法在编辑器中打开。',
      'error.notText': '这不是 UTF-8 文本文件。',
      'error.notFound': '文件不存在或已被移动。',
      'error.notRegular': '目标不是普通文件。',
      'error.symlink': '不能通过符号链接保存。',
      'error.session': '会话不可用，请重新打开页面。',
      'error.stale': '文件已在磁盘上更改。',
      'error.sandbox': '当前会话不允许写这个文件（{mode}）。',
      'error.generic': '无法读取或保存文件。',
      'error.address': '无法识别文件地址。',
      'error.tooLargeDraft': '草稿超过本地存储上限，未保存到浏览器。',
    };

    const en = {
      'button.edit': 'Edit this file',
      'button.save': 'Save',
      'button.saving': 'Saving…',
      'button.reload': 'Reload',
      'button.retry': 'Retry',
      'button.overwrite': 'Overwrite',
      'button.discardDraft': 'Discard draft',
      'button.cancel': 'Cancel',
      'button.dismiss': 'Dismiss',
      'status.saved': 'Saved',
      'status.unsaved': 'Unsaved',
      'status.readOnly': 'Read-only',
      'status.meta': '{lines} lines · {chars} chars',
      'status.mode': 'Mode: {mode}',
      loading: 'Reading…',
      'notice.draft': 'Restored an unsaved draft.',
      'notice.draftStale': 'Restored an unsaved draft based on an older version; saving will conflict.',
      'notice.external': 'The file changed on disk.',
      'conflict.title': 'The file changed elsewhere',
      'conflict.body': 'Saving now would overwrite newer content. Reload to see it, or overwrite explicitly.',
      'confirm.title': 'Unsaved changes',
      'confirm.body': 'Reloading discards the current edits.',
      'banner.readOnly': 'This session is read-only; changes cannot be saved.',
      'error.tooLarge': 'The file exceeds {limit} and cannot be opened in the editor.',
      'error.notText': 'This is not a UTF-8 text file.',
      'error.notFound': 'The file is missing or was moved.',
      'error.notRegular': 'The target is not a regular file.',
      'error.symlink': 'Refusing to save through a symlink.',
      'error.session': 'The session is unavailable; reopen the page.',
      'error.stale': 'The file changed on disk.',
      'error.sandbox': 'This session does not allow writing this file ({mode}).',
      'error.generic': 'The file could not be read or saved.',
      'error.address': 'The file address is not recognized.',
      'error.tooLargeDraft': 'The draft exceeds local storage and was not persisted.',
    };

    const CSS = [
      '.dsh-we-root{box-sizing:border-box;display:flex;flex-direction:column;flex:1 1 auto;height:100%;min-height:0;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary)}',
      '.dsh-we-head{box-sizing:border-box;display:flex;align-items:center;gap:6px;flex:none;height:38px;padding:0 6px 0 14px;border-bottom:.5px solid var(--dsw-alias-border-l3)}',
      '.dsh-we-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:500;line-height:18px}',
      '.dsh-we-state{flex:none;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;white-space:nowrap}',
      '.dsh-we-state[data-tone=warn]{color:var(--dsw-alias-state-warn-primary)}',
      '.dsh-we-spacer{flex:1 1 auto;min-width:4px}',
      '.dsh-we-tool{box-sizing:border-box;width:28px;height:28px;flex:none;display:inline-flex;align-items:center;justify-content:center;padding:6px;border:0;border-radius:var(--dsw-radius-sm);background:0 0;color:var(--dsw-alias-label-secondary);cursor:pointer;line-height:1}',
      '.dsh-we-tool svg{width:15px;height:15px}',
      '.dsh-we-tool:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}',
      '.dsh-we-tool:disabled{opacity:.4;cursor:default}',
      '.dsh-we-tool[data-primary=true]{color:var(--dsw-alias-brand-primary)}',
      '.dsh-we-tool:focus-visible,.dsh-we-docButton:focus-visible,.dsh-we-action:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}',
      '.dsh-we-banners{flex:none;display:flex;flex-direction:column}',
      '.dsh-we-banner{box-sizing:border-box;display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:6px 10px;font-size:12px;line-height:18px;border-bottom:.5px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary)}',
      '.dsh-we-banner[data-tone=warn]{color:var(--dsw-alias-state-warn-primary)}',
      '.dsh-we-banner[data-tone=error]{color:var(--dsw-alias-state-error-primary)}',
      '.dsh-we-bannerText{flex:1 1 180px;min-width:0;overflow-wrap:anywhere}',
      '.dsh-we-bannerActions{display:flex;align-items:center;gap:6px;flex:none}',
      '.dsh-we-action{box-sizing:border-box;appearance:none;font:inherit;font-size:12px;line-height:1;height:24px;padding:0 9px;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm);background:0 0;color:var(--dsw-alias-label-primary);cursor:pointer;white-space:nowrap}',
      '.dsh-we-action:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}',
      '.dsh-we-action:disabled{opacity:.5;cursor:default}',
      '.dsh-we-body{position:relative;flex:1 1 auto;min-height:0;display:flex;flex-direction:column}',
      '.dsh-we-textarea{box-sizing:border-box;flex:1 1 auto;width:100%;min-height:0;margin:0;padding:10px 12px;border:0;outline:none;resize:none;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:var(--dsw-font-mono,ui-monospace,monospace);font-size:var(--dsh-content-font-size-secondary,13px);line-height:1.6;tab-size:2;white-space:pre-wrap;overflow:auto;overflow-wrap:normal}',
      '.dsh-we-textarea:read-only{color:var(--dsw-alias-label-secondary)}',
      '.dsh-we-textarea::-webkit-scrollbar-track{margin:2px}',
      '.dsh-we-foot{box-sizing:border-box;display:flex;align-items:center;gap:10px;flex:none;padding:3px 12px;border-top:.5px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;white-space:nowrap;overflow:hidden}',
      '.dsh-we-footText{overflow:hidden;text-overflow:ellipsis}',
      '.dsh-we-statePage{box-sizing:border-box;display:flex;flex:1 1 auto;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:24px 20px;text-align:center}',
      '.dsh-we-stateTitle{margin:0;font-size:13px;font-weight:500;line-height:20px}',
      '.dsh-we-stateBody{margin:0;max-width:420px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;overflow-wrap:anywhere}',
      '.dsh-we-spinner{box-sizing:border-box;width:18px;height:18px;border-radius:50%;border:1.5px solid color-mix(in srgb, currentColor 25%, transparent);border-top-color:currentColor;animation:dsh-we-spin .8s linear infinite}',
      '.dsh-we-docButton{box-sizing:border-box;appearance:none;order:-1;width:28px;height:28px;flex:none;display:inline-flex;align-items:center;justify-content:center;padding:6px;border:0;border-radius:var(--dsw-radius-sm);background:0 0;color:var(--dsw-alias-label-secondary);cursor:pointer;line-height:1}',
      '[data-textpreview-path]{order:-2}',
      '.dsh-we-docButton svg{width:15px;height:15px}',
      '.dsh-we-docButton:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}',
      '.dsh-we-titleDot{color:var(--dsw-alias-brand-primary)}',
      '@keyframes dsh-we-spin{to{transform:rotate(360deg)}}',
      '@media (prefers-reduced-motion:reduce){.dsh-we-spinner{animation-duration:2.4s}}',
    ].join('\n');

    /**
     * Read one JSON route and fold its typed failure into an Error with a stable code.
     * @param path - app-relative route path.
     * @param body - JSON request body.
     * @param signal - optional cancellation.
     * @returns the decoded response.
     */
    async function postJson(path, body, signal) {
      const response = await fetch(path, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        signal,
      });
      let payload;
      try {
        payload = await response.json();
      } catch {
        payload = undefined;
      }
      if (!response.ok || payload?.error !== undefined) {
        const error = new EditorError(
          payload?.error?.code ?? (response.status === 401 || response.status === 403 ? 'sandbox-denied' : 'http-error'),
          payload?.error?.message ?? `HTTP ${response.status}`,
          { mode: payload?.error?.mode, status: response.status },
        );
        throw error;
      }
      return payload;
    }

    /**
     * Read one file through the shipped workspace Remote: metadata first for the
     * size cap, then the complete bytes for strict UTF-8 decoding.
     * @param ctx - client plugin context.
     * @param sessionId - authorizing Session.
     * @param path - absolute or workspace-relative path.
     * @param signal - cancellation.
     * @returns the decoded text and the version the editor's save is based on.
     */
    async function readFile(ctx, sessionId, path, signal) {
      const meta = await ctx.remote.workspaceFiles.stat(sessionId, path, signal);
      if (!meta.ok) throw remoteFailure(meta.error);
      if (typeof meta.value.bytes === 'number' && meta.value.bytes > MAX_BYTES) {
        throw new EditorError('too-large');
      }

      const read = await ctx.remote.workspaceFiles.readBytes(sessionId, path, {}, signal);
      if (!read.ok) throw remoteFailure(read.error);
      if (read.value.data.byteLength > MAX_BYTES) throw new EditorError('too-large');

      let text;
      try {
        text = new TextDecoder('utf-8', { fatal: true }).decode(read.value.data);
      } catch {
        throw new EditorError('not-text');
      }
      if (text.includes('\u0000')) throw new EditorError('not-text');

      return {
        text,
        version: read.value.version,
        absolutePath: read.value.absolutePath,
      };
    }

    /** Fold one workspace Remote failure into the editor's error vocabulary. */
    function remoteFailure(error) {
      switch (error?.code) {
        case 'workspace-file/too-large':
          return new EditorError('too-large');
        case 'workspace-file/not-found':
          return new EditorError('not-found');
        case 'workspace-file/not-regular-file':
          return new EditorError('not-regular-file');
        case 'workspace-file/not-text':
          return new EditorError('not-text');
        case 'workspace-file/unknown-workspace':
          return new EditorError('session');
        default:
          return new EditorError('generic', error?.message);
      }
    }

    /** One typed editor failure; `code` is stable and localized by the view. */
    class EditorError extends Error {
      constructor(code, message, extra) {
        super(message ?? code);
        this.name = 'EditorError';
        this.code = code;
        this.mode = extra?.mode;
      }
    }

    /** Encode one id or path segment, keeping `:` literal for drive letters. */
    function encodeSegment(segment) {
      return encodeURIComponent(segment).replace(/%3A/gi, ':');
    }

    /** Encode one `/`-separated path segment by segment. */
    function encodePath(path) {
      return path.split('/').map(encodeSegment).join('/');
    }

    /** Whether a path is POSIX-absolute, a Windows drive path, or a UNC path. */
    function isAbsolutePath(path) {
      return path.startsWith('/') || /^[A-Za-z]:[\\/]/.test(path) || path.startsWith('//');
    }

    /** Build one Session-scoped file address, preserving absolute spelling. */
    function sessionFileAddress(sessionId, path) {
      const normalized = String(path).replace(/\\/g, '/').replace(/^(?:\.\/)+/, '');
      return `${FILE_PREFIX}${encodeSegment(sessionId)}/${encodePath(normalized)}`;
    }

    /** Build the address of a file as the preview reports it: relative inside the workspace. */
    function fileAddressFor(sessionId, cwd, path) {
      const normalized = String(path).replace(/\\/g, '/');
      if (!isAbsolutePath(normalized)) return sessionFileAddress(sessionId, normalized);
      const root = cwd === undefined || cwd === null ? '' : String(cwd).replace(/\\/g, '/').replace(/\/+$/, '');
      if (root !== '' && normalized === root) return sessionFileAddress(sessionId, '');
      if (root !== '' && normalized.startsWith(`${root}/`)) {
        return sessionFileAddress(sessionId, normalized.slice(root.length + 1));
      }
      return sessionFileAddress(sessionId, normalized);
    }

    /** Parse the Session and path out of a file address. */
    function parseFileAddress(address) {
      if (typeof address !== 'string' || !address.startsWith(FILE_PREFIX)) return undefined;
      const rest = address.slice(FILE_PREFIX.length);
      const slash = rest.indexOf('/');
      if (slash <= 0) return undefined;
      let sessionId;
      let path;
      try {
        sessionId = decodeURIComponent(rest.slice(0, slash));
        path = rest.slice(slash + 1).split('/').map(decodeURIComponent).join('/');
      } catch {
        return undefined;
      }
      if (sessionId.length === 0 || path.length === 0) return undefined;
      return { sessionId, path };
    }

    /** The decoded last segment of a file address. */
    function basenameOf(address) {
      const segment = String(address).split('/').pop() ?? String(address);
      try {
        return decodeURIComponent(segment) || segment;
      } catch {
        return segment;
      }
    }

    /** Format a byte count for the size-limit message. */
    function formatSize(bytes) {
      if (bytes >= 1024 * 1024) return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MiB`;
      return `${Math.round(bytes / 1024)} KiB`;
    }

    /** Extensions that should not offer an editor at all. */
    const BINARY_EXTENSIONS = new Set([
      'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'tif', 'tiff', 'avif',
      'pdf', 'zip', 'gz', 'tgz', 'bz2', 'xz', '7z', 'rar', 'tar',
      'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'odt', 'ods', 'odp',
      'mp3', 'wav', 'ogg', 'flac', 'mp4', 'mov', 'avi', 'mkv', 'webm',
      'woff', 'woff2', 'ttf', 'otf', 'eot',
      'exe', 'dll', 'so', 'dylib', 'wasm', 'class', 'jar', 'bin', 'dat', 'db', 'sqlite',
    ]);

    /** Whether the preview should show the Edit button for this path. */
    function isTextLike(path) {
      const name = String(path).split(/[\\/]/).pop() ?? '';
      const dot = name.lastIndexOf('.');
      if (dot <= 0) return true;
      return !BINARY_EXTENSIONS.has(name.slice(dot + 1).toLowerCase());
    }

    /** Draft storage key for one file. */
    function draftKey(sessionId, absolutePath) {
      return `${DRAFT_PREFIX}${sessionId}:${absolutePath}`;
    }

    /** Read one draft, dropping records older than a month. */
    function readDraft(key) {
      try {
        const raw = window.localStorage.getItem(key);
        if (raw === null) return undefined;
        const value = JSON.parse(raw);
        if (typeof value?.text !== 'string' || typeof value?.at !== 'number') return undefined;
        if (Date.now() - value.at > 30 * 24 * 60 * 60 * 1000) {
          window.localStorage.removeItem(key);
          return undefined;
        }
        return value;
      } catch {
        return undefined;
      }
    }

    /** Persist one draft without ever failing the edit. */
    function writeDraft(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* Storage is full or unavailable; the editor remains usable. */
      }
    }

    /** Remove one draft. */
    function removeDraft(key) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* Nothing to clean up. */
      }
    }

    /** Per-tab dirty flags shared by the body and the tab chip title. */
    const dirtyTabs = new Map();
    const dirtyListeners = new Set();

    /** Publish one tab's dirty flag. */
    function setTabDirty(tabId, value) {
      if (value) dirtyTabs.set(tabId, true);
      else dirtyTabs.delete(tabId);
      for (const listener of dirtyListeners) listener();
    }

    /** Subscribe a component to one tab's dirty flag. */
    function useTabDirty(tabId) {
      return React.useSyncExternalStore(
        (listener) => {
          dirtyListeners.add(listener);
          return () => dirtyListeners.delete(listener);
        },
        () => dirtyTabs.has(tabId),
        () => false,
      );
    }

    /** The pencil shown by the preview header action. */
    function PencilIcon({ size = 15 }) {
      return h('svg', {
        viewBox: '0 0 16 16', width: size, height: size, fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': true, focusable: false,
      },
      h('path', { d: 'M9.6 2.9 13.1 6.4 6.1 13.4 2.6 13.4 2.6 9.9Z' }),
      h('path', { d: 'M8.2 4.3 11.7 7.8' }));
    }

    /** The save glyph. */
    function SaveIcon({ size = 15 }) {
      return h('svg', {
        viewBox: '0 0 16 16', width: size, height: size, fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': true, focusable: false,
      },
      h('path', { d: 'M3 2.6h8.2L13.4 4.8v8.6H3Z' }),
      h('path', { d: 'M5.2 2.6v3.6h5.2V2.6' }),
      h('path', { d: 'M5.2 13.4V9.2h5.6v4.2' }));
    }

    /** The reload glyph. */
    function ReloadIcon({ size = 15 }) {
      return h('svg', {
        viewBox: '0 0 16 16', width: size, height: size, fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': true, focusable: false,
      },
      h('path', { d: 'M13 8a5 5 0 1 1-1.5-3.6' }),
      h('path', { d: 'M13.2 2.8v3.4H9.8' }));
    }

    /** One small header tool button. */
    function ToolButton({ label, onClick, disabled, primary, children }) {
      return h('button', {
        type: 'button',
        className: 'dsh-we-tool',
        title: label,
        'aria-label': label,
        onClick,
        disabled: disabled === true,
        'data-primary': primary === true ? 'true' : undefined,
      }, children);
    }

    /** One banner row with optional actions. */
    function Banner({ tone, text, actions }) {
      return h('div', { className: 'dsh-we-banner', 'data-tone': tone, role: tone === 'error' ? 'alert' : 'status' },
        h('span', { className: 'dsh-we-bannerText' }, text),
        actions === undefined ? null : h('span', { className: 'dsh-we-bannerActions' }, actions));
    }

    /** One small banner action. */
    function BannerAction({ label, onClick, disabled }) {
      return h('button', {
        type: 'button', className: 'dsh-we-action', onClick, disabled: disabled === true,
      }, label);
    }

    /** The editor tab body. */
    function EditorBody({ useTabInfo, useResource, read, readContext, t }) {
      const { tab } = useTabInfo();
      const target = React.useMemo(() => parseFileAddress(tab.contentId), [tab.contentId]);
      const textareaRef = React.useRef(null);
      const textRef = React.useRef('');
      const baseVersionRef = React.useRef('');
      const absolutePathRef = React.useRef('');
      const dirtyRef = React.useRef(false);
      const loadIdRef = React.useRef(0);
      const seenVersionRef = React.useRef(undefined);

      const [status, setStatus] = React.useState('loading');
      const [text, setText] = React.useState('');
      const [baseText, setBaseText] = React.useState('');
      const [absolutePath, setAbsolutePath] = React.useState('');
      const [mode, setMode] = React.useState('');
      const [loadError, setLoadError] = React.useState(undefined);
      const [saveError, setSaveError] = React.useState(undefined);
      const [saving, setSaving] = React.useState(false);
      const [conflict, setConflict] = React.useState(false);
      const [external, setExternal] = React.useState(false);
      const [draftNotice, setDraftNotice] = React.useState(undefined);
      const [confirmReload, setConfirmReload] = React.useState(false);
      const [notice, setNotice] = React.useState(undefined);
      const [reloadToken, setReloadToken] = React.useState(0);

      const dirty = status === 'ready' && text !== baseText;
      const readOnly = mode === 'read-only';

      textRef.current = text;
      dirtyRef.current = dirty;
      absolutePathRef.current = absolutePath;

      const meta = useResource(tab.contentId);
      const diskVersion = meta?.value?.version;

      React.useEffect(() => {
        setTabDirty(tab.id, dirty);
        return () => setTabDirty(tab.id, false);
      }, [tab.id, dirty]);

      React.useEffect(() => {
        if (typeof diskVersion !== 'string') return;
        const previous = seenVersionRef.current;
        seenVersionRef.current = diskVersion;
        if (previous !== undefined && diskVersion !== previous && diskVersion !== baseVersionRef.current) {
          setExternal(true);
        }
      }, [diskVersion]);

      React.useEffect(() => {
        if (target === undefined) {
          setStatus('error');
          setLoadError(new EditorError('address'));
          return undefined;
        }

        const loadId = loadIdRef.current + 1;
        loadIdRef.current = loadId;
        const controller = new AbortController();
        const onAbort = () => controller.abort();
        if (tab.signal.aborted) controller.abort();
        else tab.signal.addEventListener('abort', onAbort, { once: true });

        setStatus('loading');
        setLoadError(undefined);
        setSaveError(undefined);
        setConflict(false);
        setExternal(false);
        setConfirmReload(false);
        setNotice(undefined);
        setDraftNotice(undefined);

        (async () => {
          try {
            const [file, context] = await Promise.all([
              read(target.sessionId, target.path, controller.signal),
              readContext(target.sessionId, controller.signal).catch(() => undefined),
            ]);
            if (loadIdRef.current !== loadId || controller.signal.aborted) return;

            const draft = readDraft(draftKey(target.sessionId, file.absolutePath));
            const restored = draft !== undefined && draft.text !== file.text;

            setText(restored ? draft.text : file.text);
            setBaseText(file.text);
            setAbsolutePath(file.absolutePath);
            setMode(typeof context?.mode === 'string' ? context.mode : '');
            setDraftNotice(restored
              ? (draft.baseVersion !== file.version ? 'stale' : 'fresh')
              : undefined);
            baseVersionRef.current = file.version;
            absolutePathRef.current = file.absolutePath;
            seenVersionRef.current = file.version;
            setStatus('ready');
          } catch (error) {
            if (loadIdRef.current !== loadId || controller.signal.aborted) return;
            setStatus('error');
            setLoadError(error instanceof EditorError ? error : new EditorError('generic', error?.message));
          }
        })();

        return () => {
          tab.signal.removeEventListener('abort', onAbort);
          controller.abort();
        };
      }, [tab.contentId, reloadToken]);

      React.useEffect(() => {
        if (status !== 'ready' || !dirty || absolutePath === '' || text.length > DRAFT_LIMIT) return undefined;
        const key = draftKey(target.sessionId, absolutePath);
        const timer = window.setTimeout(() => {
          writeDraft(key, { text, baseVersion: baseVersionRef.current, at: Date.now() });
        }, 500);
        return () => window.clearTimeout(timer);
      }, [status, dirty, text, absolutePath, target]);

      React.useEffect(() => {
        if (status !== 'ready' || dirty || absolutePath === '') return;
        removeDraft(draftKey(target.sessionId, absolutePath));
      }, [status, dirty, absolutePath, target]);

      React.useEffect(() => {
        const flush = () => {
          if (!dirtyRef.current || absolutePathRef.current === '') return;
          if (textRef.current.length > DRAFT_LIMIT) return;
          if (target === undefined) return;
          writeDraft(draftKey(target.sessionId, absolutePathRef.current), {
            text: textRef.current,
            baseVersion: baseVersionRef.current,
            at: Date.now(),
          });
        };
        window.addEventListener('beforeunload', flush);
        return () => {
          window.removeEventListener('beforeunload', flush);
          flush();
        };
      }, [target]);

      React.useEffect(() => {
        if (status !== 'ready' || !tab.visible) return;
        textareaRef.current?.focus();
      }, [status, tab.visible, reloadToken]);

      const save = React.useCallback(async (force) => {
        if (status !== 'ready' || saving || readOnly || absolutePath === '') return;
        const content = textRef.current;
        const expected = baseVersionRef.current;
        if (!force && content === baseText) return;

        setSaving(true);
        setSaveError(undefined);
        try {
          const payload = await postJson('api/workspace-editor/save', {
            sessionId: target.sessionId,
            path: absolutePath,
            text: content,
            baseVersion: expected,
            force: force === true,
          });
          baseVersionRef.current = payload.version;
          seenVersionRef.current = payload.version;
          setBaseText(content);
          setConflict(false);
          setExternal(false);
          setDraftNotice(undefined);
          setNotice('saved');
          if (textRef.current === content) removeDraft(draftKey(target.sessionId, absolutePath));
          window.setTimeout(() => {
            setNotice((current) => (current === 'saved' ? undefined : current));
          }, 2000);
        } catch (error) {
          const failure = error instanceof EditorError ? error : new EditorError('generic', error?.message);
          if (failure.code === 'stale-version') setConflict(true);
          else setSaveError(failure);
        } finally {
          setSaving(false);
        }
      }, [status, saving, readOnly, absolutePath, baseText, target]);

      const reloadNow = React.useCallback(() => {
        if (absolutePath !== '') removeDraft(draftKey(target.sessionId, absolutePath));
        setConfirmReload(false);
        setReloadToken((value) => value + 1);
      }, [absolutePath, target]);

      const requestReload = React.useCallback(() => {
        if (dirty) setConfirmReload(true);
        else reloadNow();
      }, [dirty, reloadNow]);

      const discardDraft = React.useCallback(() => {
        if (absolutePath !== '') removeDraft(draftKey(target.sessionId, absolutePath));
        setText(baseText);
        setDraftNotice(undefined);
        setNotice(undefined);
      }, [absolutePath, baseText, target]);

      if (status === 'loading') {
        return h('div', { className: 'dsh-we-root', 'data-workspace-editor': 'body', 'aria-busy': true },
          h('div', { className: 'dsh-we-statePage' },
            h('span', { className: 'dsh-we-spinner', 'aria-hidden': true }),
            h('p', { className: 'dsh-we-stateBody' }, t('loading'))));
      }

      if (status === 'error') {
        const error = loadError ?? new EditorError('generic');
        return h('div', { className: 'dsh-we-root', 'data-workspace-editor': 'body' },
          h('div', { className: 'dsh-we-statePage' },
            h('p', { className: 'dsh-we-stateTitle' }, t('error.' + errorKey(error))),
            error.message !== error.code ? h('p', { className: 'dsh-we-stateBody' }, error.message) : null,
            h(BannerAction, {
              label: t('button.retry'),
              onClick: () => setReloadToken((value) => value + 1),
            })));
      }

      const lines = countLines(text);
      const stateText = saving
        ? t('button.saving')
        : dirty
          ? t('status.unsaved')
          : notice === 'saved'
            ? t('status.saved')
            : readOnly
              ? t('status.readOnly')
              : '';

      const banners = [];
      if (readOnly) banners.push(h(Banner, { key: 'readonly', tone: 'warn', text: t('banner.readOnly') }));
      if (draftNotice !== undefined) {
        banners.push(h(Banner, {
          key: 'draft',
          tone: 'warn',
          text: t(draftNotice === 'stale' ? 'notice.draftStale' : 'notice.draft'),
          actions: h(BannerAction, { label: t('button.discardDraft'), onClick: discardDraft }),
        }));
      }
      if (external && !conflict) {
        banners.push(h(Banner, {
          key: 'external',
          tone: 'warn',
          text: t('notice.external'),
          actions: h(BannerAction, { label: t('button.reload'), onClick: requestReload }),
        }));
      }
      if (confirmReload) {
        banners.push(h(Banner, {
          key: 'confirm',
          tone: 'warn',
          text: `${t('confirm.title')} — ${t('confirm.body')}`,
          actions: h('span', { className: 'dsh-we-bannerActions' },
            h(BannerAction, { label: t('button.reload'), onClick: reloadNow }),
            h(BannerAction, { label: t('button.cancel'), onClick: () => setConfirmReload(false) })),
        }));
      }
      if (conflict) {
        banners.push(h(Banner, {
          key: 'conflict',
          tone: 'error',
          text: `${t('conflict.title')} — ${t('conflict.body')}`,
          actions: h('span', { className: 'dsh-we-bannerActions' },
            h(BannerAction, { label: t('button.reload'), onClick: reloadNow }),
            h(BannerAction, { label: t('button.overwrite'), onClick: () => save(true), disabled: saving })),
        }));
      }
      if (saveError !== undefined) {
        banners.push(h(Banner, {
          key: 'save-error',
          tone: 'error',
          text: describeError(saveError, t),
          actions: h(BannerAction, { label: t('button.dismiss'), onClick: () => setSaveError(undefined) }),
        }));
      }

      return h('div', {
        className: 'dsh-we-root',
        'data-workspace-editor': 'body',
        'aria-busy': saving || undefined,
      },
      h('div', { className: 'dsh-we-head' },
        h('div', { className: 'dsh-we-name', title: absolutePath || tab.contentId }, basenameOf(tab.contentId)),
        stateText === '' ? null : h('span', {
          className: 'dsh-we-state',
          'data-tone': dirty && !saving ? 'warn' : undefined,
          'aria-live': 'polite',
        }, stateText),
        h('span', { className: 'dsh-we-spacer' }),
        h(ToolButton, {
          label: saving ? t('button.saving') : t('button.save'),
          onClick: () => save(false),
          disabled: !dirty || saving || readOnly,
          primary: true,
        }, h(SaveIcon, { size: 15 })),
        h(ToolButton, {
          label: t('button.reload'),
          onClick: requestReload,
          disabled: saving,
        }, h(ReloadIcon, { size: 15 }))),
      banners.length === 0 ? null : h('div', { className: 'dsh-we-banners' }, banners),
      h('div', { className: 'dsh-we-body' },
        h('textarea', {
          ref: textareaRef,
          className: 'dsh-we-textarea',
          value: text,
          readOnly: readOnly,
          spellCheck: false,
          autoCapitalize: 'off',
          autoCorrect: 'off',
          wrap: 'soft',
          'aria-label': basenameOf(tab.contentId),
          onChange: (event) => setText(event.target.value),
          onKeyDown: (event) => {
            if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === 's') {
              event.preventDefault();
              save(false);
              return;
            }
            if (event.key === 'Tab' && !readOnly) {
              event.preventDefault();
              const element = event.currentTarget;
              element.setRangeText('  ', element.selectionStart, element.selectionEnd, 'end');
              setText(element.value);
            }
          },
        })),
      h('div', { className: 'dsh-we-foot' },
        h('span', { className: 'dsh-we-footText' },
          t('status.meta', { lines, chars: text.length })),
        mode === '' ? null : h('span', { className: 'dsh-we-footText' }, t('status.mode', { mode }))));
    }

    /** The tab chip title, with the dirty dot shared by the body. */
    function EditorTitle({ useTabInfo }) {
      const { tab } = useTabInfo();
      const dirty = useTabDirty(tab.id);
      const name = basenameOf(tab.contentId);
      return h('span', { className: 'dsh-we-title', title: name },
        name,
        dirty ? h('span', { className: 'dsh-we-titleDot', 'aria-hidden': true }, ' \u2022') : null);
    }

    /** The preview header action that opens the editor for the previewed file. */
    function EditAction({ absolutePath, sessionId, useSessions, openEditor, t }) {
      const cwd = useSessions((state) => state.byId[sessionId]?.cwd);
      if (typeof absolutePath !== 'string' || absolutePath.length === 0 || !isTextLike(absolutePath)) return null;
      const label = t('button.edit');
      return h('button', {
        type: 'button',
        className: 'dsh-we-docButton',
        title: label,
        'aria-label': label,
        'data-workspace-editor-action': 'edit',
        onClick: () => openEditor(sessionId, fileAddressFor(sessionId, cwd, absolutePath)),
      }, h(PencilIcon, { size: 15 }));
    }

    /** Count lines without allocating an array. */
    function countLines(text) {
      if (text.length === 0) return 1;
      let lines = 1;
      for (let index = 0; index < text.length; index += 1) {
        if (text.charCodeAt(index) === 10) lines += 1;
      }
      return lines;
    }

    /** Map one error code to its dictionary key. */
    function errorKey(error) {
      switch (error.code) {
        case 'too-large':
          return 'tooLarge';
        case 'not-text':
          return 'notText';
        case 'not-found':
          return 'notFound';
        case 'not-regular-file':
          return 'notRegular';
        case 'symlink':
          return 'symlink';
        case 'session':
          return 'session';
        case 'stale-version':
          return 'stale';
        case 'sandbox-denied':
          return 'sandbox';
        case 'address':
          return 'address';
        default:
          return 'generic';
      }
    }

    /** Render one error with its limit/mode arguments. */
    function describeError(error, t) {
      switch (error.code) {
        case 'too-large':
          return t('error.tooLarge', { limit: formatSize(MAX_BYTES) });
        case 'sandbox-denied':
          return t('error.sandbox', { mode: error.mode ?? 'read-only' });
        case 'stale-version':
          return t('error.stale');
        default:
          return t('error.' + errorKey(error));
      }
    }

    return {
      inject: ['slots', 'locale', 'sidebarRight', 'sidebarRightTabs', 'remote', 'remote.workspaceFiles'],
      apply(ctx) {
        const t = ctx.locale.bind(NS);

        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'workspace-editor: dictionaries');

        ctx.effect(() => {
          const tag = document.createElement('style');
          tag.dataset.workspaceEditor = 'styles';
          tag.textContent = CSS;
          document.head.appendChild(tag);
          return () => {
            tag.remove();
          };
        }, 'workspace-editor: stylesheet');

        ctx.effect(() => ctx.sidebarRightTabs.register({
          id: EDITOR_ID,
          kind: EDITOR_KIND,
          patterns: [],
          keepMounted: true,
          title: (address) => basenameOf(address),
        }), 'workspace-editor: tab type');

        ctx.effect(() => ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({
          name: 'sidebar.right.pane.tab',
          key: EDITOR_ID,
          locale: NS,
          inject: () => ({
            read: (sessionId, path, signal) => readFile(ctx, sessionId, path, signal),
            readContext: (sessionId, signal) => postJson('api/workspace-editor/context', { sessionId }, signal),
          }),
        }, EditorBody)), 'workspace-editor: tab body');

        ctx.effect(() => ctx.slots.inject('sidebar.right.pane.tab.title', () => ctx.slots.register({
          name: 'sidebar.right.pane.tab.title',
          key: EDITOR_ID,
          locale: NS,
        }, EditorTitle)), 'workspace-editor: tab title');

        ctx.effect(() => ctx.slots.inject('sidebar.right.tab.document.actions', () => ctx.slots.register({
          name: 'sidebar.right.tab.document.actions',
          id: 'workspace-editor',
          order: 20,
          locale: NS,
          inject: () => ({
            openEditor: (sessionId, address) => {
              const controller = ctx.sidebarRight;
              if (controller?.tabDomain?.openResourceIn !== undefined) {
                controller.tabDomain.openResourceIn(sessionId, address, { kind: EDITOR_KIND });
              } else {
                controller.openResource(address, { kind: EDITOR_KIND });
              }
            },
          }),
        }, EditAction)), 'workspace-editor: preview action');
      },
    };
  },
});
