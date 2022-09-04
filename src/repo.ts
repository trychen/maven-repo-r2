import { Env } from ".";
import { User, Permission } from "./auth";

export async function findFile(env: Env, path: string, user: User): Promise<Response> {
    if (user.permission == Permission.None) {
        return new Response("Permission denied", { status: 403 });
    }
    
    const object = await env.MY_BUCKET.head(path);
    if (object === null) {
      return new Response('Object Not Found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    return new Response(null, { headers });
}

export async function getFile(env: Env, path: string, user: User): Promise<Response> {
    if (user.permission == Permission.None) {
        return new Response("Permission denied", { status: 403 });
    }
    
    const objectBody = await env.MY_BUCKET.get(path);

    if (objectBody === null) {
      return new Response('Object Not Found', { status: 404 });
    }

    const headers = new Headers();
    objectBody.writeHttpMetadata(headers);
    headers.set('etag', objectBody.httpEtag);

    return new Response(objectBody.body, {
      headers,
    });
}

export async function uploadFile(env: Env, path: string, user: User, request: Request): Promise<Response> {
    if (user.permission != Permission.ReadWrite) {
        return new Response("Permission denied", { status: 403 });
    }

    if (!acceptFile(path)) {
        return new Response(`Invalid file path: ${path}`, { status: 405 });
    }

    await env.MY_BUCKET.put(path, request.body);
    return new Response(`Upload ${path} successfully!`);
}

function acceptFile(path: string) {
    return (
      !path.startsWith(".") &&
      !path.startsWith(" ") &&
      !path.endsWith(" ")
    );
  }

export async function deleteFile(env: Env, path: string, user: User): Promise<Response> {
    if (user.permission != Permission.ReadWrite) {
        return new Response("Permission denied", { status: 403 });
    }
    
    await env.MY_BUCKET.delete(path);
    return new Response('Deleted!');
}