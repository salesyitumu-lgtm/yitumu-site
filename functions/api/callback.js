/**
 * Cloudflare Pages Function: /api/callback
 * Exchanges GitHub OAuth `code` for an access token and returns an HTML page
 * that posts the token back to the opener window in the exact format Decap expects.
 */

function html(body, status = 200, headers = {}) {
  return new Response(body, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      ...headers,
    },
  });
}

async function exchangeCode({ code, clientId, clientSecret, redirectUri }) {
  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'decap-cms-cloudflare-pages-function',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GitHub token exchange failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  if (data.error) {
    throw new Error(`GitHub token exchange error: ${data.error_description || data.error}`);
  }
  return data.access_token;
}

function renderPostMessagePage({ status, content, origin }) {
  // Decap expects the popup to send:
  // 1) "authorizing:github"
  // 2) "authorization:github:<status>:<json>"
  // ...via postMessage after a handshake.
  // Embed the payload as a JS string literal safely.
  const payload = JSON.stringify(content);

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Authorization</title>
  </head>
  <body>
    <script>
      (function () {
        var targetOrigin = ${JSON.stringify(origin)};
        var content = ${JSON.stringify(payload)};

        function receiveMessage(message) {
          try {
            window.opener.postMessage(
              'authorization:github:${status}:' + JSON.stringify(JSON.parse(content)),
              targetOrigin
            );
          } catch (e) {
            // If parsing fails, still notify with raw content
            window.opener.postMessage(
              'authorization:github:${status}:' + content,
              targetOrigin
            );
          }
          window.removeEventListener('message', receiveMessage, false);
          window.close();
        }

        window.addEventListener('message', receiveMessage, false);
        window.opener.postMessage('authorizing:github', targetOrigin);
      })();
    </script>
  </body>
</html>`;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  const origin = url.origin; // same site as CMS

  // Validate state with cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const cookieMatch = cookieHeader.match(/(?:^|;\s*)decap_oauth_state=([^;]+)/);
  const cookieState = cookieMatch ? cookieMatch[1] : null;

  if (!clientId || !clientSecret) {
    const page = renderPostMessagePage({
      status: 'error',
      content: {
        error: 'Missing env vars',
        details:
          'Cloudflare Pages -> Settings -> Environment variables: set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET, then redeploy.',
      },
      origin,
    });
    return html(page, 500);
  }

  if (!code) {
    const page = renderPostMessagePage({
      status: 'error',
      content: { error: 'Missing OAuth code' },
      origin,
    });
    return html(page, 400);
  }

  if (!state || !cookieState || state !== cookieState) {
    const page = renderPostMessagePage({
      status: 'error',
      content: {
        error: 'Invalid state',
        details: 'State mismatch. Please retry login; do not block cookies for this site.',
      },
      origin,
    });
    return html(page, 400, {
      'set-cookie': 'decap_oauth_state=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Lax',
    });
  }

  try {
    const redirectUri = new URL('/api/callback', origin).toString();
    const token = await exchangeCode({ code, clientId, clientSecret, redirectUri });

    const page = renderPostMessagePage({
      status: 'success',
      content: { token, provider: 'github' },
      origin,
    });

    // Clear state cookie
    return html(page, 200, {
      'set-cookie': 'decap_oauth_state=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Lax',
    });
  } catch (err) {
    const page = renderPostMessagePage({
      status: 'error',
      content: { error: 'OAuth exchange failed', details: String(err && err.message ? err.message : err) },
      origin,
    });
    return html(page, 500, {
      'set-cookie': 'decap_oauth_state=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Lax',
    });
  }
}
