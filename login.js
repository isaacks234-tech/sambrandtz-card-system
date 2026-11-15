import { json, readJson, safeText, hashPassword, sha256Hex, randomBytes, sessionCookie, sameOrigin } from "../_lib/auth.js";

export async function onRequestPost({request, env}) {
  if (!sameOrigin(request)) return json({error:"Request origin not allowed"},403);
  const body=await readJson(request);
  const email=safeText(body?.email,200).toLowerCase();
  const password=String(body?.password || "");
  const admin=await env.DB.prepare("SELECT id,email,password_salt,password_hash FROM admins WHERE email=?").bind(email).first();
  if (!admin) return json({error:"Email or password is incorrect."},401);
  const salt=Uint8Array.from(atob(admin.password_salt),c=>c.charCodeAt(0));
  const hash=await hashPassword(password,salt);
  if (hash !== admin.password_hash) return json({error:"Email or password is incorrect."},401);
  const token=[...randomBytes(32)].map(x=>x.toString(16).padStart(2,"0")).join("");
  const tokenHash=await sha256Hex(token);
  const expires=Math.floor(Date.now()/1000)+60*60*24*7;
  await env.DB.prepare("INSERT INTO sessions (token_hash,admin_id,expires_at) VALUES (?,?,?)").bind(tokenHash,admin.id,expires).run();
  return json({ok:true,admin:{email}},200,{"set-cookie":sessionCookie(token)});
}
