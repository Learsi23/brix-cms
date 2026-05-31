import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: '#0A0A0B' }}>
      <div className="text-center max-w-md">
        <div
          className="font-black leading-none mb-6 select-none"
          style={{ fontSize: 'clamp(6rem, 20vw, 10rem)', color: '#5B6EF5', letterSpacing: '-0.05em' }}
        >
          404
        </div>

        <h1 className="text-2xl font-bold mb-3" style={{ color: '#F0F0F5' }}>
          Page not found
        </h1>
        <p className="mb-8 leading-relaxed" style={{ color: '#9696A6' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/"
            className="inline-block font-bold rounded-xl transition-opacity hover:opacity-80"
            style={{ backgroundColor: '#5B6EF5', color: '#fff', padding: '0.75rem 1.75rem', fontSize: '0.9rem' }}
          >
            ← Home
          </Link>
          <Link
            href="/admin"
            className="inline-block font-bold rounded-xl transition-colors hover:opacity-80"
            style={{ border: '1px solid #2A2A30', color: '#9696A6', padding: '0.75rem 1.75rem', fontSize: '0.9rem' }}
          >
            Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
