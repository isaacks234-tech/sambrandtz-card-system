import { json, currentAdmin } from "../_lib/auth.js";
export async function onRequestGet({request, env}) {
  const admin=await currentAdmin(request,env);
  return admin ? json({authenticated:true,admin:{email:admin.email}}) : json({authenticated:false},401);
}
