# YITUMU Global 外贸站（A+C + 5语 + 后台CMS）

## 目标
- 顶部菜单直接显示 4 个类目（可后台排序/开关/改名）
- 产品与文章可在 /admin 后台维护
- 前端 5 个语言：EN/ES/FR/DE/IT，URL 结构 /en/…
- Contact 支持询盘表单（2A：第三方表单服务），并且 WhatsApp / 邮箱可后台修改
- 产品/文章支持视频（YouTube / Cloudflare Stream 可选）

## 快速部署（Cloudflare Pages）
- Build command: `npm run build`
- Output directory: `dist`

访问：
- 网站：`https://www.yitumuglobal.com/en/`
- 后台：`https://www.yitumuglobal.com/admin/`

## 重要：CMS 登录
本模板使用 Decap CMS 的 GitHub 后端（不依赖服务器），**需要你创建 GitHub OAuth App** 并把 Client ID 填到 `public/admin/config.yml` 的 `app_id`。
