import { json, readJson, safeText, hashPassword, randomBytes, sha256Hex, sessionCookie, sameOrigin } from "../_lib/auth.js";

export async function onRequestPost({request, env}) {
  if (!sameOrigin(request)) return json({error:"Request origin not allowed"},403);
  if (!env.DB || !env.SETUP_SECRET) return json({error:"Setup is not configured. Ask the site administrator to configure D1 and SETUP_SECRET."},503);
  const count=await env.DB.prepare("SELECT COUNT(*) AS n FROM admins").first();
  if (Number(count?.n || 0)>0) return json({error:"Initial setup has already been completed."},409);
  const body=await readJson(request);
  const secret=safeText(body?.setupSecret,300);
  const email=safeText(body?.email,200).toLowerCase();
  const password=String(body?.password || "");
  if (secret !== env.SETUP_SECRET) return json({error:"Setup secret is incorrect."},403);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({error:"Enter a valid admin email."},400);
  if (password.length<12 || password.length>200) return json({error:"Use a password between 12 and 200 characters."},400);
  const salt=randomBytes(16);
  const hash=await hashPassword(password,salt);
  await env.DB.prepare("INSERT INTO admins (email,password_salt,password_hash) VALUES (?,?,?)")
    .bind(email,btoa(String.fromCharCode(...salt)),hash).run();
  const token=[...randomBytes(32)].map(x=>x.toString(16).padStart(2,"0")).join("");
  const tokenHash=await sha256Hex(token);
  const expires=Math.floor(Date.now()/1000)+60*60*24*7;
  const admin=await env.DB.prepare("SELECT id,email FROM admins WHERE email=?").bind(email).first();
  await env.DB.prepare("INSERT INTO sessions (token_hash,admin_id,expires_at) VALUES (?,?,?)").bind(tokenHash,admin.id,expires).run();
  return json({ok:true,admin:{email}},200,{"set-cookie":sessionCookie(token)});
}
