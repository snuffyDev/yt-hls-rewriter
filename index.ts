import { serve } from "https://deno.land/std@0.123.0/http/server.ts";

const port = 10000;

const handler = async (request: Request): Response => {
  const { pathname, searchParams, host } = new URL(request.url);
  
  if (pathname.startsWith("/api")) {
    const _api = "manifest.googlevideo.com";
    console.log(request.url.replace(host, _api))
    request = new Request(request.url.replace(host, _api), request);
    request.headers.set('Origin',"https://"+ _api);
  
    let response = await fetch(request);
    response = new Response(response.body, response);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.append('Vary', 'Origin');
   
    let body = await(await response.clone()).text();
    body = body.replace(/https:\/\/(.*?)\//gm,'/')
    const regex = /(\/(?:api|videoplayback)(?:.*?))(?=\n|")/gm;
    body = body.replace(regex, "$1?host="+searchParams.get('host')); 
    response = new Response(body, response)
    return response;
  
  }

  if (pathname.startsWith("/videoplayback")) {
    const _api = searchParams.get("host");
    
    request = new Request(request.url.replace(host, _api), request);
    request.headers.set('Origin',"https://"+ _api);
  
    let response = await fetch(request);
    response = new Response(response.body, response);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.append('Vary', 'Origin');
    response = new Response(response.body, response)
    return response;
  }
};

console.log(`HTTP webserver running on port ${port}.`);
await serve(await handler, { hostname: "0.0.0.0", port: port });
