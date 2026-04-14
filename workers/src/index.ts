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
			const byteLength = new TextEncoder().encode(text).byteLength;
			return new Response(text, {
				headers: {
					"Content-Type": "text/plain; charset=utf-8",
					"Content-Length": byteLength.toString(),
				},
			});
		}
		case "link": {
			const urlString = new TextDecoder().decode(data);
			try {
				const url = new URL(urlString);
				return Response.redirect(url.toString());
			} catch {
				return Response.redirect(indexUrl.toString());
			}
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

	let formData: FormData;
	try {
		formData = await c.req.formData();
	} catch {
		return Response.json({ error: "invalid request body" }, { status: 400 });
	}

	const typeRaw = formData.get("type");
	const content = formData.get("content");

	const typeResult = z.enum(["text", "link", "image"]).safeParse(typeRaw);
	if (!typeResult.success) {
		return Response.json({ error: "invalid type" }, { status: 400 });
	}
	if (content === null) {
		return Response.json({ error: "content is required" }, { status: 400 });
	}

	const type = typeResult.data;
	const id = customAlphabet(
		"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
		7,
	)();
	const key = `share:${id}`;

	switch (type) {
		case "text": {
			const text = content as string;
			if (typeof text !== "string" || text.trim() === "") {
				return Response.json({ error: "text is required" }, { status: 400 });
			}
			if (text.length > 50000) {
				return Response.json({ error: "text is too long" }, { status: 400 });
			}
			await env.KV.put(key, text, {
				expirationTtl: 60 * 60 * 24,
				metadata: { type },
			});
			break;
		}
		case "link": {
			const urlString = content as string;
			if (typeof urlString !== "string" || urlString.trim() === "") {
				return Response.json({ error: "link is required" }, { status: 400 });
			}
			try {
				const url = new URL(urlString);
				if (!url.protocol.startsWith("http")) {
					return Response.json({ error: "invalid URL" }, { status: 400 });
				}
			} catch {
				return Response.json({ error: "invalid URL" }, { status: 400 });
			}
			if (urlString.length > 2048) {
				return Response.json({ error: "URL is too long" }, { status: 400 });
			}
			await env.KV.put(key, urlString, {
				expirationTtl: 60 * 60 * 24,
				metadata: { type },
			});
			break;
		}
		case "image": {
			const file = content as File;
			if (!(file instanceof File)) {
				return Response.json({ error: "invalid image" }, { status: 400 });
			}
			if (file.size > 5 * 1024 * 1024) {
				return Response.json({ error: "image must be less than 5MB" }, { status: 400 });
			}
			const buf = await file.arrayBuffer();
			const stream = new ReadableStream<Uint8Array>({
				start(controller) {
					controller.enqueue(new Uint8Array(buf));
					controller.close();
				},
			});
			const info = await env.IMAGES.info(stream);
			if (!info) {
				return Response.json({ error: "invalid image" }, { status: 400 });
			}
			await env.KV.put(key, buf, {
				expirationTtl: 60 * 60 * 24,
				metadata: {
					type,
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
