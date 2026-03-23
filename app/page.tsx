"use client";

import Link from "next/link";

export default function Home() {
  const featureCards = [
    {
      title: "唯一关系绑定",
      summary: "每个用户只对应一个聊天对象。",
      description:
        "关系一旦建立，产品的核心路径就围绕这段专属连接展开，不再被多余社交关系稀释。",
      frontClassName: "border-rose-100/50 bg-white/50",
      backClassName:
        "border-rose-200/70 bg-gradient-to-br from-rose-100 to-rose-50",
    },
    {
      title: "单一会话模型",
      summary: "打开应用就进入你们唯一的对话空间。",
      description:
        "没有群聊和复杂会话列表，信息层级被压到最简单，沟通路径也更直接。",
      frontClassName: "border-orange-100/50 bg-white/50",
      backClassName:
        "border-orange-200/70 bg-gradient-to-br from-orange-100 to-amber-50",
    },
    {
      title: "实时沟通体验",
      summary: "聚焦文本消息、状态同步和即时反馈。",
      description:
        "首期先把实时文本聊天、消息状态和已读体验做稳，再往更丰富的表达能力扩展。",
      frontClassName: "border-amber-100/50 bg-white/50",
      backClassName:
        "border-violet-200/70 bg-gradient-to-br from-violet-100 to-fuchsia-50",
    },
  ];

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 px-6 py-16 selection:bg-rose-200 selection:text-rose-900">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,241,242,0.92)_0%,rgba(255,247,237,0.88)_22%,rgba(255,251,235,0.86)_40%,rgba(239,246,255,0.82)_58%,rgba(250,245,255,0.86)_76%,rgba(254,242,242,0.92)_100%)] bg-[length:220%_220%] animate-hero-gradient" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[20%] h-[50%] w-[50%] rounded-full bg-rose-200/30 blur-3xl" />
        <div className="absolute -right-[10%] top-[60%] h-[40%] w-[40%] rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute right-[10%] top-[20%] h-[30%] w-[30%] rounded-full bg-pink-200/20 blur-3xl" />
      </div>

      <main className="relative z-10 flex w-full max-w-5xl flex-col gap-12 rounded-[2.5rem] border border-white/60 bg-white/60 p-10 shadow-2xl shadow-rose-900/5 backdrop-blur-2xl sm:p-14">
        <div className="flex flex-col items-center space-y-8 text-center">
          <div className="relative flex items-center justify-center px-6 py-2">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-400 to-orange-400 text-white shadow-xl shadow-rose-500/30">
              <svg
                aria-hidden="true"
                className="h-10 w-10 text-white/90"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35 10.55 20C5.4 15.24 2 12.09 2 8.25 2 5.1 4.42 2.75 7.5 2.75c1.74 0 3.41.81 4.5 2.09 1.09-1.28 2.76-2.09 4.5-2.09 3.08 0 5.5 2.35 5.5 5.5 0 3.84-3.4 6.99-8.55 11.76L12 21.35Z" />
              </svg>
            </div>

            <div className="ml-40 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-300 to-cyan-200 text-white shadow-xl shadow-sky-400/30">
              <svg
                aria-hidden="true"
                className="h-10 w-10 text-white/90"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35 10.55 20C5.4 15.24 2 12.09 2 8.25 2 5.1 4.42 2.75 7.5 2.75c1.74 0 3.41.81 4.5 2.09 1.09-1.28 2.76-2.09 4.5-2.09 3.08 0 5.5 2.35 5.5 5.5 0 3.84-3.4 6.99-8.55 11.76L12 21.35Z" />
              </svg>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-rose-500/80">
              Only Two
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.15] tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
              一个只属于两个人的
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
                私密聊天空间
              </span>
            </h1>
          </div>

          <div className="mt-4 flex flex-col gap-4 text-base font-medium sm:flex-row">
            <Link
              className="flex h-12 w-full items-center justify-center rounded-full border border-rose-200/80 bg-rose-200 px-6 text-rose-950 shadow-[0_0_0_rgba(251,113,133,0.0),0_0_24px_rgba(251,113,133,0.45)] transition-[background-color,box-shadow,transform] duration-300 animate-pulse-rose hover:-translate-y-0.5 hover:bg-rose-300 hover:shadow-[0_0_0_rgba(251,113,133,0.0),0_0_38px_rgba(244,114,182,0.65)] md:w-[158px]"
              href="/signup"
            >
              注册
            </Link>
            <Link
              className="flex h-12 w-full items-center justify-center rounded-full border border-amber-100/90 bg-amber-50 px-6 text-amber-950 shadow-[0_0_0_rgba(255,251,235,0.0),0_0_24px_rgba(254,243,199,0.78)] transition-[background-color,box-shadow,transform] duration-300 animate-pulse-ivory hover:-translate-y-0.5 hover:bg-yellow-50 hover:shadow-[0_0_0_rgba(255,251,235,0.0),0_0_38px_rgba(253,230,138,0.92)] md:w-[158px]"
              href="/login"
            >
              登录
            </Link>
          </div>

          <div className="mt-6 grid w-full gap-5 sm:grid-cols-3">
            {featureCards.map((card) => (
              <div
                className="group h-52 [perspective:1400px]"
                key={card.title}
              >
                <div className="relative h-full w-full rounded-3xl transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                  <div
                    className={`absolute inset-0 flex h-full flex-col justify-between rounded-3xl border p-6 text-left shadow-[0_18px_50px_rgba(15,23,42,0.08)] ring-1 ring-white/40 [backface-visibility:hidden] before:pointer-events-none before:absolute before:inset-[1px] before:rounded-[1.35rem] before:border before:border-white/50 before:content-[''] ${card.frontClassName}`}
                  >
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-zinc-900">
                        {card.title}
                      </p>
                      <p className="text-base leading-7 text-zinc-600">
                        {card.summary}
                      </p>
                    </div>
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                      Hover To Flip
                    </p>
                  </div>

                  <div
                    className={`absolute inset-0 flex h-full rounded-3xl border p-6 text-left shadow-[0_24px_60px_rgba(15,23,42,0.14)] ring-1 ring-white/35 [backface-visibility:hidden] [transform:rotateY(180deg)] before:pointer-events-none before:absolute before:inset-[1px] before:rounded-[1.35rem] before:border before:border-white/55 before:content-[''] ${card.backClassName}`}
                  >
                    <div className="flex flex-col justify-between">
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-zinc-950">
                          {card.title}
                        </p>
                        <p className="text-sm leading-7 text-zinc-700">
                          {card.description}
                        </p>
                      </div>
                      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                        Only Two
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
