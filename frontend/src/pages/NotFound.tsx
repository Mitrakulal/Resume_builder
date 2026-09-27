import { Navbar, Footer } from "../components/layout.tsx";
import { ButtonLink } from "../components/ui.tsx";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink antialiased">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-5 pt-28 pb-20 sm:px-8">
        <div className="relative max-w-lg text-center">
          <div className="dot-grid absolute -top-10 left-1/2 h-40 w-40 -translate-x-1/2 opacity-50" aria-hidden />
          <p className="font-display relative text-[7rem] leading-none font-semibold sm:text-[9rem]" aria-label="Error 404">
            404
          </p>
          <h1 className="font-display mt-4 text-3xl font-semibold sm:text-4xl">This page wandered off.</h1>
          <p className="mx-auto mt-4 max-w-sm text-lg leading-relaxed text-inksoft">
            The link you followed doesn&apos;t exist — or moved while you weren&apos;t looking. Let&apos;s get you back
            on track.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink to="/" size="lg">
              Back home
            </ButtonLink>
            <ButtonLink to="/app" variant="outline" size="lg">
              Open demo
            </ButtonLink>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
