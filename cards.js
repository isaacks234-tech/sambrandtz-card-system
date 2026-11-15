import { json, readJson, safeText, slugify, currentAdmin, sameOrigin } from "../_lib/auth.js";

export async function onRequestGet({request, env}) {
  const admin=await currentAdmin(request,env);
  if (!admin) return json({error:"Sign in required."},401);
  const {results=[]}=await env.DB.prepare("SELECT id,slug,business_name,owner_name,logo_url,services,whatsapp,instagram,facebook,created_at FROM cards ORDER BY id DESC").all();
  return json({cards:results});
}
export async function onRequestPost({request, env}) {
  if (!sameOrigin(request)) return json({error:"Request origin not allowed"},403);
  const admin=await currentAdmin(request,env);
  if (!admin) return json({error:"Sign in required."},401);
  const b=await readJson(request);
  const business=safeText(b?.businessName,120);
  if (!business) return json({error:"Business name is required."},400);
  const owner=safeText(b?.ownerName,120);
  let slug=slugify(business);
  const suffix=crypto.randomUUID().slice(0,6);
  slug=`${slug}-${suffix}`;
  await env.DB.prepare(`INSERT INTO cards (slug,business_name,owner_name,logo_url,services,whatsapp,instagram,facebook)
    VALUES (?,?,?,?,?,?,?,?)`).bind(
      slug,business,owner,safeText(b?.logoUrl,500),safeText(b?.services,1000),
      safeText(b?.whatsapp,40).replace(/[^\d+]/g,""),safeText(b?.instagram,200),
      safeText(b?.facebook,200)
    ).run();
  const card=await env.DB.prepare("SELECT * FROM cards WHERE slug=?").bind(slug).first();
  return json({card},201);
}
