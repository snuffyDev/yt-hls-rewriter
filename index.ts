import { serve } from "https://deno.land/std@0.123.0/http/server.ts";

const port = 3000;

const handler = async (request: Request): Promise<Response> => {
	const { pathname, searchParams, origin } = new URL(request.url);

	if (pathname.startsWith("/api")) {
		const _api = "manifest.googlevideo.com";

		request = new Request(request.url.replace(origin, 'https://' + _api), request);
		request.headers.set('Origin', new URL(request.url).origin);

		let response = await fetch(request);

		response = new Response(response.body, response);
		response.headers.set('Access-Control-Allow-Origin', new URL(request.url).origin);
		response.headers.append('Vary', 'Origin');

		let body = await (await response.clone()).text();
		body = body.replace(/https:\/\/(.*?)\//gm, new URL(request.url).origin);

		const regex = /(\/(?:api|videoplayback)(?:.*?))(?=\n|")/gm;

		body = body.replace(regex, "$1?host=" + searchParams.get('host'));
		if (body.match(/(#EXT-X-MAP:URI=".*?)/gm)) {

			body = body.replace(/(#EXT-X-MAP:URI=".*?)(?:\?)(host=.*")/gm, "$1&$2");
		}
		response = new Response(body, response);
		response.headers.set('Access-Control-Allow-Origin', new URL(request.url).origin);
		response.headers.append('Vary', 'Origin');

		return response;

	}


	const _api = searchParams.get("host") as string;

	request = new Request(request.url.replace(origin, 'https://' + _api), request);
	request.headers.set('Origin', new URL(request.url).origin);

	let response = await fetch(request);
	response = new Response(response.body, response);

	response.headers.set('Access-Control-Allow-Origin', new URL(request.url).origin);
	response.headers.append('Vary', 'Origin');

	return response;
};

console.log(`HTTP webserver running on port ${port}.`);
await serve(handler, { hostname: "0.0.0.0", port: port, });
