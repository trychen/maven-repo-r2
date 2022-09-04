/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { auth, Permission, User, users } from "./auth";
import { deleteFile, findFile, getFile, uploadFile } from "./repo";

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	MY_BUCKET: R2Bucket;

	USERNAME: string;
	PASSWORD: string;
}

function getPath(request: Request): string {
	const url = new URL(request.url);
    const key = url.pathname.slice(1);
	return key
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		users.push(new User(env.USERNAME, env.PASSWORD, Permission.ReadWrite));

		let user = auth(request);
		
		let path = getPath(request);

		if(path.length == 0) {
			return new Response("path is empty", { status: 404 });
		}

		switch(request.method) {
			case "HEAD":
				return findFile(env, path, user);
			case "GET":
				return getFile(env, path, user);
			case "PUT":
				return uploadFile(env, path, user, request);
			case "DELETE":
				return deleteFile(env, path, user);
			default:
				return new Response("Method Not Allowed", { status: 405 });
		}
	},
};
