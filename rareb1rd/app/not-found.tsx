import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-4xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted">That page flew the coop.</p>
      <Link href="/" className="btn btn-brand mt-6">Back home</Link>
    </div>
  );
}
