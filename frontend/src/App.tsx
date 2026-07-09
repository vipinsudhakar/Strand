// Temporary design-token smoke screen: proves the fonts + palette resolve.
// Replaced by the real Nav / Dashboard shell in a later commit.
export default function App() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6">
      <p className="font-mono text-sm uppercase tracking-widest text-ash-500">
        Strand
      </p>
      <h1 className="font-display text-6xl font-medium leading-tight text-ink">
        Design tokens are live.
      </h1>
      <p className="font-sans text-lg text-ash-500">
        Warm paper background, near-black ink, one botanical-green accent — the
        foundation for everything that comes next.
      </p>
      <p className="font-mono text-base text-ink">
        MKTAYIAKQRQISFVKSHFSRQLEERLGLIEVQ
      </p>
      <a
        href="#"
        className="font-sans text-base font-medium text-accent hover:text-accent-soft"
      >
        A restrained accent link →
      </a>
    </main>
  );
}
