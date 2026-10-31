/**
 * Host half of the Workspace Text Editor bundle.
 *
 * The shipped `workspaceFiles` service is deliberately read-only, so the editor
 * adds the one capability it needs: an authenticated, atomic, version-guarded
 * text write. Reads still travel through `remote.workspaceFiles` from the
 * browser; this module owns the session sandbox policy, the regular-file checks,
 * the save conflict check, and the owner-only transport routes.
 *
 * @module @local/dsh-workspace-editor
 */

/** Routes sit inside the `/api` bridge, so they inherit its trust and cookie checks. */
const CONTEXT_PATH = '/api/workspace-editor/context'
const SAVE_PATH = '/api/workspace-editor/save'

/** A textarea cap, also enforced on the wire so a crafted body cannot exceed it. */
const MAX_TEXT_BYTES = 2 * 1024 * 1024

/** JSON envelope headroom over the text payload, including escape expansion. */
const MAX_BODY_BYTES = 16 * 1024 * 1024

/** The transport carrier, the filesystem seam, session headers, and the shared policy. */
export const inject = ['connection', 'fs', 'sessions', 'sandboxPolicy']

/**
 * Register the editor's two routes on the authenticated `/api` bridge.
 * @param ctx - Host context carrying Connection, the filesystem, and session services.
 */
export function apply(ctx) {
  ctx.effect(() => ctx.connection.fetch.register({
    path: CONTEXT_PATH,
    methods: ['POST'],
    requestBody: 'buffered',
    fetch: (request) => guarded(() => contextRoute(ctx, request)),
  }), 'workspace-editor: context route')

  ctx.effect(() => ctx.connection.fetch.register({
    path: SAVE_PATH,
    methods: ['POST'],
    requestBody: 'buffered',
    fetch: (request) => guarded(() => saveRoute(ctx, request)),
  }), 'workspace-editor: save route')
}

/**
 * Resolve the readable policy facts for a session: its workspace root and the
 * effective sandbox mode used by a save.
 * @param ctx - Host context.
 * @param request - the buffered HTTP request.
 * @returns the mode and workspace root.
 */
async function contextRoute(ctx, request) {
  const body = await readJson(request)
  const { policy, cwd } = await resolveSession(ctx, body.sessionId)
  return json({ mode: policy.mode, cwd })
}

/**
 * Save one UTF-8 text file for a session under its current sandbox policy.
 * @param ctx - Host context.
 * @param request - the buffered HTTP request.
 * @returns the canonical path, the new version, and whether the file was created or updated.
 */
async function saveRoute(ctx, request) {
  const body = await readJson(request)
  const { policy, cwd } = await resolveSession(ctx, body.sessionId)

  const path = body.path
  if (typeof path !== 'string' || path.length === 0 || path.includes('\0')) {
    throw new HttpError(400, 'bad-request', 'path must be a non-empty string')
  }

  const text = body.text
  if (typeof text !== 'string') throw new HttpError(400, 'bad-request', 'text must be a string')
  if (new TextEncoder().encode(text).byteLength > MAX_TEXT_BYTES) {
    throw new HttpError(413, 'too-large', 'text exceeds the editor limit')
  }

  const entry = await ctx.fs.lstat(path, { cwd }, request.signal)
  if (entry !== undefined && entry.type === 'symlink') {
    throw new HttpError(400, 'symlink', 'refusing to write through a symlink')
  }
  if (entry !== undefined && entry.type !== 'file') {
    throw new HttpError(400, 'not-regular-file', 'target is not a regular file')
  }

  const target = await ctx.fs.resolve(path, { cwd, signal: request.signal })

  let intent
  if (body.force === true) {
    const current = await ctx.fs.stat(target, request.signal)
    if (current === undefined) throw new HttpError(404, 'not-found', 'the file no longer exists')
    if (current.type !== 'file') throw new HttpError(400, 'not-regular-file', 'target is not a regular file')
    intent = { kind: 'replaceIfVersion', version: current.version }
  } else {
    const expected = body.baseVersion
    if (typeof expected !== 'string' || expected.length === 0) {
      throw new HttpError(400, 'bad-request', 'baseVersion must be a non-empty string')
    }
    intent = { kind: 'replaceIfVersion', version: expected }
  }

  let outcome
  try {
    outcome = await ctx.fs.writeText(target, text, intent, request.signal, policy)
  } catch (error) {
    throw mapFsError(error, policy)
  }

  return json({
    absolutePath: target.displayPath,
    version: outcome.version,
    operation: outcome.operation,
  })
}

/**
 * Resolve one session's header without activating its Agent.
 * @param ctx - Host context.
 * @param sessionId - the wire session identity.
 * @returns the live session when present, its workspace root, and the effective policy.
 */
async function resolveSession(ctx, sessionId) {
  if (typeof sessionId !== 'string' || sessionId.length === 0) {
    throw new HttpError(400, 'bad-request', 'sessionId must be a non-empty string')
  }

  const live = ctx.sessions.get(sessionId)
  let header = live?.header
  if (header === undefined) {
    const stored = await ctx.get('sessionPersistence')?.stat(sessionId)
    header = stored?.header
  }
  if (header === undefined) throw new HttpError(404, 'session-not-found', 'session not found')

  const cwd = header.cwd ?? ctx.sandboxPolicy.workspaceRoot
  const policy = live !== undefined
    ? ctx.sandboxPolicy.resolve({ session: live })
    : { ...ctx.sandboxPolicy.resolve({}), workspaceRoot: cwd }

  return { live, cwd, policy }
}

/**
 * Wrap one route so every expected failure becomes a typed JSON response.
 * @param run - the route body.
 * @returns the HTTP response.
 */
async function guarded(run) {
  try {
    return await run()
  } catch (error) {
    if (error instanceof HttpError) {
      return failure(error.status, error.code, error.message, error.extra)
    }
    return failure(500, 'internal', 'unexpected workspace editor failure')
  }
}

/**
 * Read one small JSON body after checking its media type and declared size.
 * @param request - the buffered HTTP request.
 * @returns the decoded object.
 */
async function readJson(request) {
  const media = (request.headers.get('content-type') ?? '').toLowerCase()
  if (!media.startsWith('application/json')) {
    throw new HttpError(415, 'unsupported-media-type', 'expected application/json')
  }

  const declared = Number(request.headers.get('content-length') ?? '0')
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    throw new HttpError(413, 'too-large', 'request body is too large')
  }

  let body
  try {
    body = await request.json()
  } catch {
    throw new HttpError(400, 'bad-request', 'invalid JSON body')
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new HttpError(400, 'bad-request', 'body must be an object')
  }
  return body
}

/**
 * Translate a filesystem failure into the editor's wire vocabulary.
 * @param error - the thrown value.
 * @param policy - the policy used for this write, for the read-only hint.
 * @returns the typed HTTP failure.
 */
function mapFsError(error, policy) {
  switch (error?.code) {
    case 'FS_STALE_VERSION':
    case 'FS_NOT_OBSERVED':
      return new HttpError(409, 'stale-version', 'the file changed since it was opened')
    case 'FS_SANDBOX_DENIED':
      return new HttpError(403, 'sandbox-denied', 'file access denied by the session sandbox policy', { mode: policy.mode })
    case 'FS_NOT_FOUND':
      return new HttpError(404, 'not-found', 'the file no longer exists')
    case 'FS_TOO_LARGE':
      return new HttpError(413, 'too-large', 'the file is too large')
    case 'FS_NOT_REGULAR_FILE':
      return new HttpError(400, 'not-regular-file', 'target is not a regular file')
    case 'FS_PERMISSION_DENIED':
      return new HttpError(403, 'permission-denied', 'permission denied')
    case 'FS_ABORTED':
      return new HttpError(499, 'aborted', 'the save was cancelled')
    default:
      return new HttpError(500, 'internal', 'unexpected filesystem failure')
  }
}

/**
 * Build one JSON response that clients never cache.
 * @param payload - the JSON body.
 * @param status - HTTP status.
 * @returns the response.
 */
function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}

/**
 * Build one typed error response.
 * @param status - HTTP status.
 * @param code - stable editor error code.
 * @param message - diagnostic text.
 * @param extra - additional JSON fields.
 * @returns the response.
 */
function failure(status, code, message, extra) {
  return json({ error: { code, message, ...(extra ?? {}) } }, status)
}

/** One route failure that maps directly to an HTTP response. */
class HttpError extends Error {
  /**
   * @param status - HTTP status.
   * @param code - stable editor error code.
   * @param message - diagnostic text.
   * @param extra - additional JSON fields.
   */
  constructor(status, code, message, extra) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.code = code
    this.extra = extra
  }
}
