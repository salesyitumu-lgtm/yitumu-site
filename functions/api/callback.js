/**
 * Cloudflare Pages Function: /api/callback
 * 简化版：直接发送 Token，不等待握手，解决白屏卡顿问题
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const origin = url.origin; // 获取网站域名 (https://www.yitumuglobal.com)

  // 1. 如果没有 Code，报错
  if (!code) {
    return new Response('Error: Missing code', { status: 400 });
  }

  // 2. 向 GitHub 换取 Token
  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'accept': 'application/json',
        'user-agent': 'yitumu-cms-auth',
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code: code,
      }),
    });

    const result = await response.json();

    if (result.error) {
      return new Response(`GitHub Error: ${result.error}`, { status: 500 });
    }

    const token = result.access_token;
    const provider = 'github';

    // 3. 生成 HTML：直接把 Token 发送给主窗口，然后自我关闭
    // 注意：这里去掉了复杂的 receiveMessage 监听，改为直接发送 (Fire and Forget)
    const html = `
      <!doctype html>
      <html>
      <body>
        <script>
          (function() {
            var origin = "${origin}";
            var data = { token: "${token}", provider: "${provider}" };
            try {
              // 格式必须是 authorization:provider:status:json_string
              window.opener.postMessage(
                "authorization:github:success:" + JSON.stringify(data),
                origin
              );
            } catch (err) {
              console.error(err);
            }
            // 发送完立刻关闭窗口
            window.close();
          })();
        </script>
        <p>Signing in... do not close this window.</p>
      </body>
      </html>
    `;

    return new Response(html, {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });

  } catch (err) {
    return new Response(`Server Error: ${err.message}`, { status: 500 });
  }
}
