# Only Two Deployment Guide

## 1. 部署前准备

需要准备：

- 一个 Vercel 账号
- 一个线上 Supabase 项目
- 代码仓库已推送到 GitHub、GitLab 或 Bitbucket

当前仓库本地已链接过一个 Supabase 项目，project ref 为：

```text
yssgzjwnragopkpduuxn
```

如果你就是部署到这个项目，后面的 `PROJECT_REF` 可以直接使用这个值。否则请替换成你的线上项目 ref。

## 2. 必需环境变量

Vercel 中必须配置以下环境变量：

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

说明：

- `NEXT_PUBLIC_SUPABASE_URL`：Supabase 项目地址
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`：前端和普通服务端请求使用
- `SUPABASE_SERVICE_ROLE_KEY`：服务端管理操作使用，不能暴露给客户端

建议至少在以下环境中都配置：

- `Production`
- `Preview`

否则 Vercel 预览环境中的登录、注册、邀请接受等流程会失败。

## 3. 先部署数据库，再部署前端

不要先上 Vercel 再补数据库。

这个仓库的数据库结构和权限规则依赖以下目录：

- `supabase/schema.sql`
- `supabase/migrations/`

如果 migration 没有先推到线上，应用即使部署成功，也会在以下功能上出问题：

- 注册后资料初始化
- 邀请创建 / 接受
- 会话读取
- 消息写入
- Realtime 订阅

## 4. 推送 Supabase migrations

### 方式 A：使用 Supabase CLI

如果你本地已经安装 Supabase CLI，可以这样做：

```bash
supabase login
supabase link --project-ref PROJECT_REF
supabase db push
```

如果你要部署到当前本地已链接项目，可用：

```bash
supabase link --project-ref yssgzjwnragopkpduuxn
supabase db push
```

执行后，去 Supabase Studio 确认这些表和对象已经存在：

- `profiles`
- `relationships`
- `relationship_invites`
- `conversations`
- `conversation_members`
- `messages`

### 方式 B：在 Supabase SQL Editor 手动执行

如果你暂时不用 CLI，可以按顺序执行：

1. `supabase/schema.sql`
2. `supabase/migrations/` 下所有 migration，按文件名时间顺序执行

这种方式更容易漏步骤，只建议临时使用。

## 5. 配置 Supabase Auth

进入 Supabase 控制台：

- `Authentication`
- `URL Configuration`

按下面配置。

### Site URL

正式环境填你的生产域名，例如：

```text
https://onlytwo.example.com
```

### Additional Redirect URLs

至少添加这些：

```text
http://localhost:3000/**
https://*-<your-team-or-account-slug>.vercel.app/**
```

如果你已经有正式域名，建议再加精确生产回调地址：

```text
https://onlytwo.example.com/callback
```

原因：

- 本项目注册时会把邮箱验证回调地址设置为 `当前域名 + /callback`
- Vercel Preview 每次分支部署都会生成新域名
- 如果这些域名不在 Supabase allow list 中，邮箱验证和其他跳转会失败

本项目当前认证回调路径固定为：

```text
/callback
```

## 6. 在 Vercel 创建项目

### 方式 A：通过 Dashboard

1. 打开 Vercel 控制台
2. 选择 `Add New Project`
3. 导入本仓库
4. 等 Vercel 自动识别为 Next.js 项目
5. 在项目设置中填入环境变量
6. 点击部署

这个仓库目前不需要额外的 `vercel.json`。

### 方式 B：通过 CLI

```bash
pnpm dlx vercel
```

首次执行时按提示：

1. 登录 Vercel
2. 关联当前目录到一个项目
3. 填写环境变量
4. 完成首次部署

生产部署：

```bash
pnpm dlx vercel --prod
```

## 7. 推荐的 Vercel 配置

项目导入后检查以下设置：

### Framework Preset

保持为：

```text
Next.js
```

### Root Directory

保持仓库根目录，不需要改到子目录。

### Build Command

默认即可。通常不需要手改。

### Install Command

Vercel 会自动识别包管理器。

仓库里存在 `pnpm-lock.yaml`，建议保持使用 pnpm。

## 8. 自定义域名

如果你要用正式域名：

1. 在 Vercel 项目中添加自定义域名
2. 按 Vercel 提示完成 DNS 配置
3. 确认域名已经生效
4. 回到 Supabase，把 `Site URL` 改成这个正式域名
5. 确认 `Additional Redirect URLs` 中也包含对应回调地址

顺序不要反。

如果域名还没在 Vercel 生效，先把 Supabase `Site URL` 指向正式域名，邮件跳转会落空。

## 9. 部署后验收清单

上线后至少走一遍完整链路：

1. 新用户注册
2. 收到验证邮件
3. 点击邮件链接后回到 `/callback`
4. 跳回登录页
5. 成功登录
6. 完成资料初始化
7. 创建邀请
8. 另一位用户接受邀请
9. 自动创建 relationship、conversation、conversation_members
10. 双方进入同一个私密会话
11. 一方发送消息，另一方实时收到
12. 已读状态正常更新

重点检查是否违反业务约束：

- 同一用户不能绑定多个伴侣
- 不能自己绑定自己
- 非成员不能读取聊天数据

## 10. 常见问题

### 1. 注册成功但邮箱验证跳转失败

通常是 Supabase `Redirect URLs` 没配对。

优先检查：

- `Site URL`
- `Additional Redirect URLs`
- Vercel Preview 域名是否被加入 allow list

### 2. 页面能打开，但聊天或邀请接口报权限错误

通常是线上数据库 migration 没同步完整。

优先检查：

- `supabase db push` 是否执行成功
- 所有 migration 是否已应用
- 线上项目是否就是当前环境变量指向的那个项目

### 3. 注册 / 登录异常，服务端报缺少 key

通常是 Vercel 漏配环境变量。

必须检查：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

修改环境变量后，要重新部署一次，新值才会生效。

### 4. 构建阶段卡在字体下载

当前项目在 `app/layout.tsx` 使用了 `next/font/google` 的 `Geist` 和 `Geist_Mono`。

在 Vercel 上通常可以正常构建；如果你所处网络环境限制访问 Google Fonts，本地构建可能失败。那是构建环境问题，不是业务代码逻辑问题。

## 11. 最小上线顺序

如果你只想尽快上线，按这个顺序做：

1. 创建 Supabase 生产项目
2. 推送本仓库 `supabase/migrations`
3. 配置 Supabase Auth 的 `Site URL` 和 `Redirect URLs`
4. 在 Vercel 导入仓库
5. 配置 3 个环境变量
6. 部署
7. 绑定正式域名
8. 回到 Supabase 更新正式域名
9. 做完整验收

## 12. 不要做的事

- 不要把 `SUPABASE_SERVICE_ROLE_KEY` 提交到仓库
- 不要跳过 migration 直接部署前端
- 不要只配 Production，不配 Preview
- 不要把 Supabase `Site URL` 留在 localhost
- 不要在未验证权限规则的情况下上线邀请和聊天功能
