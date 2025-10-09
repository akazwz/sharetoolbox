import { env } from "cloudflare:workers";
import { Hono } from "hono";
import { customAlphabet } from "nanoid";
import { z } from "zod";

const app = new Hono();

app.get("/s/:id", async (c) => {
	const id = c.req.param("id");
	const key = `share:${id}`;
	const content = await env.KV.getWithMetadata(key, {
		cacheTtl: 60 * 60,
		type: "arrayBuffer",
	});
	const indexUrl = new URL("/", c.req.url);
	if (!content?.value) {
		return Response.redirect(indexUrl.toString());
	}
	const data = content.value;
	const metadata = content.metadata as {
		type: "text" | "link" | "image";
		mimeType: string;
	};

	switch (metadata.type) {
		case "text": {
			const text = new TextDecoder().decode(data);
			return new Response(text, {
				headers: {
					"Content-Type": "text/plain; charset=utf-8",
					"Content-Length": text.length.toString(),
				},
			});
		}
		case "link": {
			const urlString = new TextDecoder().decode(data);
			console.log("url string: ", urlString);
			const url = new URL(urlString);
			return Response.redirect(url.toString());
		}
		case "image": {
			return new Response(data, {
				headers: {
					"Content-Type": metadata.mimeType,
					"Content-Length": data.byteLength.toString(),
				},
			});
		}
	}
	return Response.redirect(indexUrl.toString());
});

app.post("/api/share", async (c) => {
	let limitKey = c.req.header("CF-Connecting-IP");
	if (!limitKey) {
		if (c.req.raw.cf?.latitude && c.req.raw.cf?.longitude) {
			limitKey = `${c.req.raw.cf?.latitude},${c.req.raw.cf?.longitude}`;
		}
	}
	if (!limitKey) {
		return Response.json({ error: "invalid request" }, { status: 400 });
	}
	const { success } = await env.API_RATE_LIMITER.limit({
		key: limitKey,
	});
	if (!success) {
		return Response.json({ error: "rate limit exceeded" }, { status: 429 });
	}
	const schema = z.object({
		type: z.enum(["text", "link", "image"]),
		content: z.any(),
	});
	const data = schema.parse(await c.req.json());
	const id = customAlphabet(
		"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
		7,
	)();
	const key = `share:${id}`;
	switch (data.type) {
		case "text":
		case "link": {
			await env.KV.put(key, data.content, {
				expirationTtl: 60 * 60 * 24,
				metadata: {
					type: data.type,
				},
			});
			break;
		}
		case "image": {
			const buf = new Uint8Array(data.content).buffer
			const info = await env.IMAGES.info(buf);
			if (!info) {
				return Response.json({ error: "invalid image" }, { status: 400 });
			}
			await env.KV.put(key, buf, {
				expirationTtl: 60 * 60 * 24,
				metadata: {
					type: data.type,
					mimeType: info.format,
				},
			});
			break;
		}
	}
	return Response.json({ id });
});

export default {
	async fetch(request, env, ctx): Promise<Response> {
		return app.fetch(request, env, ctx);
	},
} satisfies ExportedHandler<Env>;
