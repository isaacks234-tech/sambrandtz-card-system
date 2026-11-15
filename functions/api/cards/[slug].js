import { json, readJson, safeText, currentAdmin, sameOrigin } from "../../_lib/auth.js";
export async function onRequestPut({request, env, params}) {
  if (!sameOrigin(request)) return json({error:"Request origin not allowed"},403);
  const admin=await currentAdmin(request,env);
  if (!admin) return json({error:"Sign in required."},401);
  const b=await readJson(request);
  const business=safeText(b?.businessName,120);
  if (!business) return json({error:"Business name is required."},400);
  await env.DB.prepare(`UPDATE cards SET business_name=?,owner_name=?,logo_url=?,services=?,whatsapp=?,instagram=?,facebook=?,updated_at=CURRENT_TIMESTAMP WHERE slug=?`)
    .bind(business,safeText(b?.ownerName,120),safeText(b?.logoUrl,500),safeText(b?.services,1000),
      safeText(b?.whatsapp,40).replace(/[^\d+]/g,""),safeText(b?.instagram,200),safeText(b?.facebook,200),params.slug).run();
  const card=await env.DB.prepare("SELECT * FROM cards WHERE slug=?").bind(params.slug).first();
  return card ? json({card}) : json({error:"Card not found."},404);
}
export async function onRequestDelete({request, env, params}) {
  if (!sameOrigin(request)) return json({error:"Request origin not allowed"},403);
  const admin=await currentAdmin(request,env);
  if (!admin) return json({error:"Sign in required."},401);
  await env.DB.prepare("DELETE FROM cards WHERE slug=?").bind(params.slug).run();
  return json({ok:true});
}
