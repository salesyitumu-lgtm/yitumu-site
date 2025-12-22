/**
 * Cloudflare Pages Function: /api/auth
 * Implements Decap CMS external OAuth entrypoint for GitHub.
 *
 * Required environment variables (Cloudflare Pages -> Settings -> Environment variables):
 * - GITHUB_CLIENT_ID
 * - GITHUB_CLIENT_SECRET (used in /api/callback)
 */

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function makeState(len = 24) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  // base64url
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const clientId = env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return jsonResponse(
      {
        error: 'Missing env var GITHUB_CLIENT_ID',
        how_to_fix:
          'Cloudflare Pages -> Settings -> Environment variables -> add GITHUB_CLIENT_ID and redeploy.',
      },
      500,
    );
  }

  // Decap will pass `repo` and `branch` etc. We only need the `origin` of the CMS site.
  // When Decap opens the popup, it will include `site_id`, `collection`, etc. We'll keep them
  // and send back via callback unchanged using the `state` payload.
  const state = makeState();

  // Persist state in a cookie to validate in callback.
  const cookie = `decap_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`;

  // Build redirect_uri to our callback.
  const callbackUrl = new URL('/api/callback', url.origin);

  // Minimum scopes for Decap CMS to write to repo.
  // - public repo: `repo` is still fine; GitHub will reduce if not needed.
  const scope = url.searchParams.get('scope') || 'repo';

  const gh = new URL('https://github.com/login/oauth/authorize');
  gh.searchParams.set('client_id', clientId);
  gh.searchParams.set('redirect_uri', callbackUrl.toString());
  gh.searchParams.set('scope', scope);
  gh.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: {
      location: gh.toString(),
      'set-cookie': cookie,
      'cache-control': 'no-store',
    },
  });
}
