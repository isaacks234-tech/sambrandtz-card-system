const enc = new TextEncoder();

export function json(data, status=200, headers={}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers }
  });
}
export async function readJson(request) {
  try { return await request.json(); } catch { return null; }
}
export function safeText(value, max=500) {
  return String(value ?? "").trim().slice(0, max);
}
export function slugify(value) {
  const s = String(value || "business").normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
    .toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,42);
  return s || "business";
}
function b64(bytes) {
  let s=""; for (const b of new Uint8Array(bytes)) s+=String.fromCharCode(b);
  return btoa(s);
}
function unb64(s) {
  return Uint8Array.from(atob(s), c=>c.charCodeAt(0));
}
export async function hashPassword(password, saltBytes) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({name:"PBKDF2", salt:saltBytes, iterations:310000, hash:"SHA-256"}, key, 256);
  return b64(bits);
}
export function randomBytes(n=32) {
  const a=new Uint8Array(n); crypto.getRandomValues(a); return a;
}
export async function sha256Hex(value) {
  const d=await crypto.subtle.digest("SHA-256", enc.encode(value));
  return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
export function cookieToken(request) {
  const raw=request.headers.get("Cookie") || "";
  const m=raw.match(/(?:^|;\s*)sb_session=([A-Za-z0-9_-]+)/);
  return m ? m[1] : "";
}
export async function currentAdmin(request, env) {
  const token=cookieToken(request);
  if (!token) return null;
  const h=await sha256Hex(token);
  const row=await env.DB.prepare(
    "SELECT admins.id, admins.email FROM sessions JOIN admins ON admins.id=sessions.admin_id WHERE sessions.token_hash=? AND sessions.expires_at>?"
  ).bind(h, Math.floor(Date.now()/1000)).first();
  return row || null;
}
export function sameOrigin(request) {
  const origin=request.headers.get("Origin");
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}
export function sessionCookie(token, maxAge=60*60*24*7) {
  return `sb_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}
