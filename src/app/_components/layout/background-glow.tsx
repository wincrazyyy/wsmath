export function BackgroundGlow() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* top-center: indigo → violet → sky */}
      <div className="absolute left-1/2 top-[-12%] h-[48rem] w-[48rem] -translate-x-1/2 rounded-full
                      bg-gradient-to-tr from-indigo-500/25 via-violet-500/25 to-sky-400/25 blur-[120px]" />
      {/* soft white halo to brighten the hero */}
      <div className="absolute left-1/2 top-[6%] h-[26rem] w-[26rem] -translate-x-1/2 rounded-full
                      bg-white/30 blur-3xl mix-blend-screen" />
      {/* balance: bottom-right tint */}
      <div className="absolute bottom-[-25%] right-[-10%] h-[36rem] w-[36rem] rounded-full
                      bg-gradient-to-tr from-sky-400/20 to-violet-500/20 blur-[120px]" />
    </div>
  );
}
