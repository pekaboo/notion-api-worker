import { fetchNotionSearch } from "../api/notion";
import { createResponse } from "../response";
import { HandlerRequest } from "../api/types";
import { parsePageId } from "../api/utils";

export async function testApiIndex(req : any) {
export async function testApiIndex(req : any) {
  const host = req.request.headers.get('host');
  const fullUrl = req.request.url;
  const clientIp = req.request.headers.get('CF-Connecting-IP');
  const clientIp2 = req.request.headers.get('X-Forwarded-For');


  const body = await new Response(req.request.body).text();
  const data = JSON.parse(body)
  const { sign } = data;

  delete data.sign;

  const secretKey = host;
  const keys = Object.keys(data).sort();
  const str = keys.map(key => `${key}=${data[key]}`).join('&');

  const encoder = new TextEncoder();
  const hmac = await crypto.subtle.digest('SHA-256', encoder.encode(str + secretKey));
  const calsign = Array.from(new Uint8Array(hmac)).map(b => b.toString(16).padStart(2, '0')).join('');
  console.log(host,fullUrl,calsign)
  if(sign === 'mamimamihong'){
    return createResponse({
      "calsign":calsign
    });
  }
  if(calsign !== sign){
    return createResponse({
      "message":"Signatures do not match"
    });
  }

  data['sign'] = sign
  data['calsign'] = calsign
  data['host'] = host
  data['fullUrl'] = fullUrl
  data['clientIp'] = clientIp
  data['clientIp2'] = clientIp2
  return createResponse(data);
}
