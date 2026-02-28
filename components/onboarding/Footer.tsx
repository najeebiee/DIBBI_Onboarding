export default function Footer() {
  return (
    <footer className="relative left-1/2 right-1/2 -mx-[50vw] mt-6 w-screen bg-slate-950 px-4 py-8 text-slate-200">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-lg font-semibold tracking-wide">DIBBI</p>
        <p className="text-sm text-slate-300">
          DIBBI Copyright 2026 | Privacy Policy | Terms
        </p>
      </div>
    </footer>
  );
}