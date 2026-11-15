import { json } from "../../_lib/auth.js";
export async function onRequestGet({env, params}) {
  const card=await env.DB.prepare("SELECT slug,business_name,owner_name,logo_url,services,whatsapp,instagram,facebook FROM cards WHERE slug=?").bind(params.slug).first();
  return card ? json({card}) : json({error:"Card not found."},404);
}
