// functions/api/contact.js
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function onRequestPost(ctx) {
  const req = ctx.request;
  const ip = req.headers.get("cf-connecting-ip") || "0.0.0.0";

  const ct = req.headers.get("content-type") || "";
  if (!ct.includes("application/x-www-form-urlencoded") && !ct.includes("multipart/form-data")) {
    return json({ error: "Invalid content-type" }, 400);
  }

  const form = await req.formData();

  // ✅ Honeypot：机器人会填，正常用户看不到
  const honeypot = String(form.get("website") || "").trim();
  if (honeypot) return json({ ok: true }, 200);

  // ✅ 表单字段
  const name = String(form.get("name") || "").trim();
  const email = String(form.get("email") || "").trim();
  const whatsapp = String(form.get("whatsapp") || "").trim();
  const country = String(form.get("country") || "").trim();
  const quantity = String(form.get("quantity") || "").trim();
  const product = String(form.get("product") || "").trim();
  const message = String(form.get("message") || "").trim();

  // ✅ 校验
  if (name.length < 2 || name.length > 50) return json({ error: "姓名长度不正确" }, 400);
  if (!isEmail(email)) return json({ error: "邮箱格式不正确" }, 400);
  if (message.length < 10 || message.length > 2000) return json({ error: "内容长度不正确" }, 400);

  // ✅ 限流：同 IP 60 秒最多 3 次
  const kv = ctx.env.CONTACT_KV;
  if (kv) {
    const key = `rate:${ip}`;
    const num = parseInt((await kv.get(key)) || "0", 10);
    if (num >= 3) return json({ error: "提交过于频繁，请稍后再试" }, 429);
    await kv.put(key, String(num + 1), { expirationTtl: 60 });
  }

  // ✅ Webhook（Make / 飞书 / 钉钉 / Telegram 等）
  const webhook = ctx.env.CONTACT_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          source: "yitumuglobal-contact",
          time: new Date().toISOString(),
          ip,
          ua: req.headers.get("user-agent") || "",
          name,
          email,
          whatsapp,
          country,
          product,
          quantity,
          message,
        }),
      });
    } catch (e) {
      // webhook 失败不影响提交成功，避免前端因为外部服务抖动报错
    }
  }

  return json({ ok: true }, 200);
}
