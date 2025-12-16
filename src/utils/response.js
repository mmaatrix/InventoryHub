export function ok(data, meta = undefined) {
  return { success: true, data, error: null, meta };
}

export function fail(message, code = 'BAD_REQUEST', details = undefined) {
  return { success: false, data: null, error: { message, code, details }, meta: null };
}
