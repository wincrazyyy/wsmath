export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200">
      <div className="container mx-auto max-w-5xl px-4 py-8 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} XiniDev. Built with Next.js + Tailwind.
      </div>
    </footer>
  );
}
