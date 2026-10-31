window.__ModuleLoader__.load({
  id: 'dsh-download-center',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    /** Locale namespace shared by every surface of this plugin. */
    const NS = 'downloadCenter';
    /** Panel id: the sidebar row and the main-panel key dispatch by this exact value. */
    const PANEL_ID = 'download-center';
    /** Bounded client-side history; nothing is persisted. */
    const HISTORY_LIMIT = 40;

    const zh = {
      panel: '下载中心',
      'page.title': '下载中心',
      'page.subtitle': '从右侧文件预览下载的文件会记录在这里，可以随时重新下载。',
      'page.clear': '清空记录',
      'page.empty.title': '还没有下载记录',
      'page.empty.body': '在右侧边栏打开任意文件，点击预览标题栏中的下载按钮，文件会立即保存到本地，并出现在这个列表里。',
      'page.redownload': '重新下载',
      'page.meta': '{size} · {time}',
      'button.download': '下载此文件',
      'button.busy': '正在下载',
      'toast.done': '已下载 {name}',
      'toast.failed': '下载失败：{reason}',
      'toast.dismiss': '关闭提示',
      'error.tooLarge': '文件超过 {limit} 的下载上限',
      'error.notFound': '文件不存在或已被移动',
      'error.notRegular': '目标不是普通文件',
      'error.generic': '无法读取该文件',
    };

    const en = {
      panel: 'Download Center',
      'page.title': 'Download Center',
      'page.subtitle': 'Files saved from the right-sidebar preview are listed here and can be downloaded again at any time.',
      'page.clear': 'Clear history',
      'page.empty.title': 'No downloads yet',
      'page.empty.body': 'Open a file in the right sidebar and press the download button in the preview header. The file is saved immediately and appears in this list.',
      'page.redownload': 'Download again',
      'page.meta': '{size} · {time}',
      'button.download': 'Download this file',
      'button.busy': 'Downloading',
      'toast.done': 'Downloaded {name}',
      'toast.failed': 'Download failed: {reason}',
      'toast.dismiss': 'Dismiss notification',
      'error.tooLarge': 'The file exceeds the {limit} download limit',
      'error.notFound': 'The file is missing or was moved',
      'error.notRegular': 'The target is not a regular file',
      'error.generic': 'The file could not be read',
    };

    const CSS = [
      '.dldc-page{box-sizing:border-box;width:100%;height:100%;min-height:0;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);font-size:14px;line-height:1.6;display:flex;flex-direction:column;align-items:center;overflow:auto;padding:0 clamp(24px,4vw,48px) 48px}',
      '.dldc-page>*{width:100%;max-width:960px}',
      '.dldc-head{box-sizing:border-box;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:16px;padding-top:28px}',
      'html[data-platform=darwin] .dldc-head{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px))}',
      '.dldc-headText{min-width:0;max-width:100%}',
      '.dldc-title{margin:0;font-size:20px;font-weight:500;line-height:28px}',
      '.dldc-intro{margin:4px 0 0;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px}',
      '.dldc-toolbar{flex:none;display:flex;align-items:center;gap:8px;white-space:nowrap}',
      '.dldc-ghost{box-sizing:border-box;appearance:none;font:inherit;font-size:13px;line-height:1;height:30px;padding:0 12px;border:1px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-md);background:0 0;color:var(--dsw-alias-label-secondary);cursor:pointer;white-space:nowrap}',
      '.dldc-ghost:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}',
      '.dldc-list{list-style:none;display:flex;flex-direction:column;gap:2px;margin:20px 0 0;padding:0}',
      '.dldc-row{box-sizing:border-box;display:flex;align-items:center;gap:14px;min-width:0;margin:0 -8px;padding:8px;border-radius:var(--dsw-radius-xl)}',
      '.dldc-row:hover{background:var(--dsw-alias-interactive-bg-hover)}',
      '.dldc-glyph{box-sizing:border-box;width:40px;height:40px;flex:none;display:inline-flex;align-items:center;justify-content:center;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-lg);color:var(--dsw-alias-label-secondary)}',
      '.dldc-rowMain{display:flex;flex-direction:column;gap:2px;flex:1;min-width:0}',
      '.dldc-name{font-size:14px;font-weight:500;line-height:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.dldc-path{font-size:13px;line-height:18px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.dldc-side{flex:none;display:flex;align-items:center;gap:12px}',
      '.dldc-meta{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;font-variant-numeric:tabular-nums;white-space:nowrap}',
      '.dldc-secondary{box-sizing:border-box;appearance:none;font:inherit;font-size:13px;line-height:1;height:28px;padding:0 10px;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm);background:0 0;color:var(--dsw-alias-label-secondary);cursor:pointer;white-space:nowrap}',
      '.dldc-secondary:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}',
      '.dldc-secondary:disabled{opacity:.6;cursor:default}',
      '.dldc-ghost:focus-visible,.dldc-secondary:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}',
      '.dldc-empty{box-sizing:border-box;display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px;margin-top:24px;padding:48px 24px;border:.5px dashed var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-xl)}',
      '.dldc-emptyGlyph{display:inline-flex;margin-bottom:4px;color:var(--dsw-alias-label-caption)}',
      '.dldc-emptyTitle{margin:0;font-size:15px;font-weight:500;line-height:22px}',
      '.dldc-emptyBody{margin:0;max-width:460px;font-size:13px;line-height:20px;color:var(--dsw-alias-label-tertiary)}',
      '.dldc-docButton{box-sizing:border-box;appearance:none;width:28px;height:28px;flex:none;display:inline-flex;align-items:center;justify-content:center;padding:6px;line-height:1;border:0;border-radius:var(--dsw-radius-sm);background:0 0;color:var(--dsw-alias-label-secondary);cursor:pointer}',
      '.dldc-docButton svg{width:15px;height:15px}',
      '.dldc-docButton:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}',
      '.dldc-docButton:disabled{cursor:progress;opacity:.7}',
      '.dldc-docButton:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}',
      '.dldc-spinner{width:15px;height:15px;box-sizing:border-box;border-radius:50%;border:1.5px solid color-mix(in srgb, currentColor 25%, transparent);border-top-color:currentColor;animation:dldc-spin .8s linear infinite}',
      '.dldc-toast{position:absolute;left:50%;bottom:24px;transform:translateX(-50%);box-sizing:border-box;display:inline-flex;align-items:center;gap:10px;max-width:min(560px,calc(100vw - 48px));padding:9px 9px 9px 14px;border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-toast-bg);color:var(--dsw-alias-toast-label);font-size:13px;line-height:18px;pointer-events:auto;animation:dldc-toast-in .18s ease-out}',
      '.dldc-toastIcon{display:inline-flex;flex:none;color:var(--dsw-alias-state-success-secondary)}',
      '.dldc-toast[data-tone=error] .dldc-toastIcon{color:var(--dsw-alias-state-error-secondary)}',
      '.dldc-toastText{min-width:0;overflow-wrap:anywhere}',
      '.dldc-toastClose{appearance:none;width:24px;height:24px;flex:none;display:inline-flex;align-items:center;justify-content:center;padding:0;border:0;border-radius:var(--dsw-radius-sm);background:0 0;color:inherit;opacity:.7;cursor:pointer}',
      '.dldc-toastClose:hover{opacity:1;background:color-mix(in srgb, currentColor 14%, transparent)}',
      '.dldc-toastClose:focus-visible{outline:2px solid currentColor;outline-offset:-1px}',
      '@keyframes dldc-toast-in{from{opacity:0;transform:translate(-50%,6px)}to{opacity:1;transform:translate(-50%,0)}}',
      '@keyframes dldc-spin{to{transform:rotate(360deg)}}',
      '@media (prefers-reduced-motion:reduce){.dldc-toast{animation:none}.dldc-spinner{animation-duration:2.4s}}',
    ].join('\n');

    /**
     * Draw the download glyph that both the sidebar row and the header button use.
     * @param props - rendered square edge in pixels.
     * @returns the current-color icon.
     */
    function DownloadGlyph({ size = 16 }) {
      return h('svg', {
        viewBox: '0 0 16 16',
        width: size,
        height: size,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.4,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
        focusable: false,
      },
        h('path', { d: 'M8 2.5v6.4' }),
        h('path', { d: 'M5.3 6.4 8 9.1l2.7-2.7' }),
        h('path', { d: 'M2.9 10.4v1.5c0 1 .8 1.8 1.8 1.8h6.6c1 0 1.8-.8 1.8-1.8v-1.5' }),
      );
    }

    /** Check glyph for the "saved" toast. */
    function CheckGlyph() {
      return h('svg', {
        viewBox: '0 0 16 16', width: 15, height: 15, fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': true, focusable: false,
      }, h('path', { d: 'm3.4 8.4 3 3 6.2-6.4' }));
    }

    /** Warning glyph for the failure toast. */
    function WarningGlyph() {
      return h('svg', {
        viewBox: '0 0 16 16', width: 15, height: 15, fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': true, focusable: false,
      },
        h('path', { d: 'M8 2.4 14 13H2L8 2.4Z' }),
        h('path', { d: 'M8 6.4v3' }),
        h('path', { d: 'M8 11.4v.1' }),
      );
    }

    /** Close glyph for the toast dismiss control. */
    function CloseGlyph() {
      return h('svg', {
        viewBox: '0 0 16 16', width: 13, height: 13, fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round',
        'aria-hidden': true, focusable: false,
      },
        h('path', { d: 'm4 4 8 8' }),
        h('path', { d: 'm12 4-8 8' }),
      );
    }

    /** Read a byte count the way a person reads a file size. */
    function formatSize(bytes) {
      if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes < 0) return '';
      if (bytes >= 1024 * 1024) {
        const mb = bytes / (1024 * 1024);
        return `${mb >= 10 ? Math.round(mb) : Math.round(mb * 10) / 10} MB`;
      }
      if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
      return `${bytes} B`;
    }

    /** Render the last path segment, tolerating either separator. */
    function baseName(path) {
      const trimmed = path.replace(/[/\\]+$/u, '');
      const cut = Math.max(trimmed.lastIndexOf('/'), trimmed.lastIndexOf('\\'));
      return cut === -1 ? trimmed : trimmed.slice(cut + 1);
    }

    /** Render everything before the last path segment. */
    function directoryOf(path) {
      const trimmed = path.replace(/[/\\]+$/u, '');
      const cut = Math.max(trimmed.lastIndexOf('/'), trimmed.lastIndexOf('\\'));
      return cut <= 0 ? trimmed.slice(0, cut + 1) : trimmed.slice(0, cut);
    }

    /** Hand a completed file to the browser's own download path. */
    function saveBytes(bytes, name) {
      const blob = new Blob([bytes], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      link.rel = 'noopener';
      link.style.position = 'fixed';
      link.style.left = '-1px';
      link.style.top = '0';
      link.style.opacity = '0';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30000);
    }

    /**
     * Page-lifetime record of saved files plus the one transient notice.
     * Nothing is persisted: closing the page forgets the history.
     */
    function createStore() {
      let records = [];
      let notice = null;
      let recordSeq = 0;
      let noticeSeq = 0;
      const listeners = new Set();
      const emit = () => {
        for (const listener of Array.from(listeners)) listener();
      };
      const subscribe = (listener) => {
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
        };
      };
      return {
        hooks: {
          downloads: { getSnapshot: () => records, subscribe },
          notice: { getSnapshot: () => notice, subscribe },
        },
        record(entry) {
          records = [{ id: ++recordSeq, ...entry }, ...records].slice(0, HISTORY_LIMIT);
          emit();
        },
        clear() {
          if (records.length === 0) return;
          records = [];
          emit();
        },
        notify(next) {
          notice = { ...next, seq: ++noticeSeq };
          emit();
        },
        dismiss() {
          if (notice === null) return;
          notice = null;
          emit();
        },
      };
    }

    /** Sidebar panel row: one icon whose edge the owner supplies. */
    function DownloadCenterIcon({ size }) {
      return h(DownloadGlyph, { size: size ?? 20 });
    }

    /** Header contribution acting on the previewed file. */
    function DownloadFileButton({ absolutePath, sessionId, download, t }) {
      const [busy, setBusy] = React.useState(false);
      const label = busy ? t('button.busy') : t('button.download');
      const onClick = () => {
        if (busy) return;
        setBusy(true);
        download(sessionId, absolutePath).finally(() => setBusy(false));
      };
      return h('button', {
        type: 'button',
        className: 'dldc-docButton',
        onClick,
        disabled: busy,
        title: label,
        'aria-label': label,
        'aria-busy': busy || undefined,
        'data-download-center-action': true,
      }, busy ? h('span', { className: 'dldc-spinner', 'aria-hidden': true }) : h(DownloadGlyph, { size: 15 }));
    }

    /** Main panel: the files saved through this plugin during the current page life. */
    function DownloadsPage({ useDownloads, onClear, onRedownload, t }) {
      const downloads = useDownloads((snapshot) => snapshot);
      const [busyId, setBusyId] = React.useState(null);
      const redownload = (record) => {
        if (busyId !== null) return;
        setBusyId(record.id);
        onRedownload(record).finally(() => setBusyId(null));
      };
      return h('section', {
        className: 'dldc-page',
        'aria-label': t('page.title'),
        'data-download-center-page': true,
      },
        h('header', { className: 'dldc-head' },
          h('div', { className: 'dldc-headText' },
            h('h1', { className: 'dldc-title' }, t('page.title')),
            h('p', { className: 'dldc-intro' }, t('page.subtitle')),
          ),
          downloads.length === 0 ? null : h('div', { className: 'dldc-toolbar' },
            h('button', { type: 'button', className: 'dldc-ghost', onClick: onClear }, t('page.clear')),
          ),
        ),
        downloads.length === 0
          ? h('div', { className: 'dldc-empty' },
            h('span', { className: 'dldc-emptyGlyph' }, h(DownloadGlyph, { size: 28 })),
            h('p', { className: 'dldc-emptyTitle' }, t('page.empty.title')),
            h('p', { className: 'dldc-emptyBody' }, t('page.empty.body')),
          )
          : h('ul', { className: 'dldc-list' },
            downloads.map((record) => h('li', { key: String(record.id), className: 'dldc-row' },
              h('span', { className: 'dldc-glyph' }, h(DownloadGlyph, { size: 20 })),
              h('div', { className: 'dldc-rowMain' },
                h('span', { className: 'dldc-name', title: record.name }, record.name),
                h('span', { className: 'dldc-path', title: record.path }, directoryOf(record.path)),
              ),
              h('div', { className: 'dldc-side' },
                h('span', { className: 'dldc-meta' }, t('page.meta', {
                  size: formatSize(record.bytes),
                  time: new Date(record.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                })),
                h('button', {
                  type: 'button',
                  className: 'dldc-secondary',
                  disabled: busyId !== null,
                  onClick: () => redownload(record),
                }, busyId === record.id ? t('button.busy') : t('page.redownload')),
              ),
            )),
          ),
      );
    }

    /** Frame-wide notice announcing one download outcome. */
    function DownloadToast({ useNotice, dismiss, t }) {
      const notice = useNotice((snapshot) => snapshot);
      React.useEffect(() => {
        if (notice === null) return undefined;
        const timer = window.setTimeout(dismiss, notice.tone === 'error' ? 6000 : 4000);
        return () => window.clearTimeout(timer);
      }, [notice, dismiss]);
      if (notice === null) return null;
      return h('div', {
        className: 'dldc-toast',
        'data-tone': notice.tone,
        role: notice.tone === 'error' ? 'alert' : 'status',
        'aria-live': notice.tone === 'error' ? 'assertive' : 'polite',
        'aria-atomic': true,
        'data-download-center-toast': true,
      },
        h('span', { className: 'dldc-toastIcon' },
          notice.tone === 'error' ? h(WarningGlyph) : h(CheckGlyph)),
        h('span', { className: 'dldc-toastText' }, notice.text),
        h('button', {
          type: 'button',
          className: 'dldc-toastClose',
          onClick: dismiss,
          title: t('toast.dismiss'),
          'aria-label': t('toast.dismiss'),
        }, h(CloseGlyph)),
      );
    }

    return {
      inject: ['slots', 'locale', 'remote', 'remote.workspaceFiles'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'download-center: dictionaries');
        ctx.effect(() => {
          const tag = document.createElement('style');
          tag.dataset.downloadCenter = 'styles';
          tag.textContent = CSS;
          document.head.appendChild(tag);
          return () => {
            tag.remove();
          };
        }, 'download-center: stylesheet');

        const t = ctx.locale.bind(NS);
        const store = createStore();

        /** Name one settled read failure in terms of the file. */
        const failureReason = (failure) => {
          switch (failure.code) {
            case 'workspace-file/too-large': {
              const limit = formatSize(failure.details?.limit);
              return limit === '' ? t('error.generic') : t('error.tooLarge', { limit });
            }
            case 'workspace-file/not-found':
              return t('error.notFound');
            case 'workspace-file/not-regular-file':
              return t('error.notRegular');
            default:
              return t('error.generic');
          }
        };

        /**
         * Read one Session file through the authorized workspace service and hand
         * the resulting bytes to the browser, recording the outcome for the UI.
         * @param sessionId - Session whose filesystem authorizes the read.
         * @param absolutePath - Host path reported for the previewed file.
         * @returns whether the file was handed to the browser.
         */
        const perform = async (sessionId, absolutePath) => {
          let result;
          try {
            result = await ctx.remote.workspaceFiles.readBytes(
              sessionId, absolutePath, {}, new AbortController().signal,
            );
          } catch (error) {
            store.notify({ tone: 'error', text: t('toast.failed', { reason: t('error.generic') }) });
            return false;
          }
          if (!result.ok) {
            store.notify({ tone: 'error', text: t('toast.failed', { reason: failureReason(result.error) }) });
            return false;
          }
          const value = result.value;
          const path = value.absolutePath || absolutePath;
          const name = baseName(path);
          try {
            saveBytes(value.data, name);
          } catch (error) {
            store.notify({ tone: 'error', text: t('toast.failed', { reason: t('error.generic') }) });
            return false;
          }
          store.record({ sessionId, path, name, bytes: value.data.byteLength, at: Date.now() });
          store.notify({ tone: 'ok', text: t('toast.done', { name }) });
          return true;
        };

        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: PANEL_ID,
          order: 20,
          locale: NS,
          label: () => t('panel'),
        }, DownloadCenterIcon));

        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: PANEL_ID,
          locale: NS,
          inject: () => ({
            hooks: { downloads: store.hooks.downloads },
            onClear: store.clear,
            onRedownload: (record) => perform(record.sessionId, record.path),
          }),
        }, DownloadsPage));

        ctx.slots.inject('sidebar.right.tab.document.actions', () => ctx.slots.register({
          name: 'sidebar.right.tab.document.actions',
          id: 'download',
          order: 0,
          locale: NS,
          inject: () => ({ download: perform }),
        }, DownloadFileButton));

        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'download-center.toast',
          locale: NS,
          inject: () => ({ hooks: { notice: store.hooks.notice }, dismiss: store.dismiss }),
        }, DownloadToast));
      },
    };
  },
});
