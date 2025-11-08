/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
const CORS_HEADERS = {
	"Access-Control-Allow-Origin": "*", // 或者你的 Pages 域名
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
};

interface insetReq {
	url: string
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url)
		switch (request.method) {
			case "OPTIONS":
				return new Response(null, { headers: CORS_HEADERS });

			case "POST":
				const json = await request.json();
				const counter = Number(await env.shortChains.get("counter") || -1)
				const notation = (counter + 1).toString(36)
				await env.shortChains.put("counter", counter + 1)
				await env.shortChains.put("/" + notation, (json as insetReq).url)
				return new Response(notation, { headers: CORS_HEADERS });

			case "GET":
				let url = await env.shortChains.get((new URL(request.url)).pathname)
				if (url) return Response.redirect(url, 302);
				else return new Response('NOT FOUND', { status: 404, headers: CORS_HEADERS });

			default:
				return new Response(null);
		}
	},
} satisfies ExportedHandler<Env>;
