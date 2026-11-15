import { json, cookieToken, sha256Hex, sameOrigin } from "../_lib/auth.js";
export async function onRequestPost({request, env}) {
  if (!sameOrigin(request)) return json({error:"Request origin not allowed"},403);
  const token=cookieToken(request);
  if (token) await env.DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(await sha256Hex(token)).run();
  return json({ok:true},200,{"set-cookie":"sb_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0"});
}
