import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center text-center px-4">
      <p className="text-brand-primary text-sm font-semibold uppercase tracking-widest mb-4">
        404
      </p>
      <h1 className="text-4xl font-bold text-white mb-4">Page not found</h1>
      <p className="text-white/50 mb-8">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="bg-brand-primary text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-brand-primary/90 transition-colors"
      >
        Go home
      </Link>
    </div>
  );
}
