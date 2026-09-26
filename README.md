# ikaleio-homepage

Ikaleio 的个人主页：React Router 7（SSR）+ Tailwind + framer-motion，部署在 Vercel。

## 开发

```bash
bun install
GITHUB_TOKEN=$(gh auth token) bun run dev   # http://localhost:3000
bun run typecheck
bun run build                               # 产出 .vercel/output（Vercel Build Output API）
```

## 项目列表

「项目」区自动展示 GitHub 主页上**置顶（pinned）**的仓库，最多 6 个。想换展示内容，去 GitHub 主页调整置顶即可，不用改代码。

数据通过 GitHub GraphQL API 获取，服务端需要环境变量 `GITHUB_TOKEN`：

- 在 GitHub 创建一个 classic token，不勾选任何 scope，过期时间选 No expiration；
- 在 Vercel 项目 Settings → Environment Variables 中添加 `GITHUB_TOKEN`。

未配置 token 或请求失败时，「项目」区会隐藏，页面其他部分不受影响。结果在每个服务端实例内缓存 1 小时。
