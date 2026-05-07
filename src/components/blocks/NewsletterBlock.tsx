'use client';

import { useState } from 'react';
import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

interface NewsletterBlockProps {
  data: BlockData;
}

export default function NewsletterBlock({ data }: NewsletterBlockProps) {
  const heading = getFieldValue(data, 'heading', 'Subscribe to our newsletter');
  const subtitle = getFieldValue(data, 'subtitle', 'Get the latest news and offers directly in your inbox.');
  const buttonLabel = getFieldValue(data, 'buttonLabel', 'Subscribe');
  const successMessage = getFieldValue(data, 'successMessage', 'Thanks for subscribing!');
  const bgColor = getFieldValue(data, 'backgroundColor', '#f9fafb');
  const buttonColor = getFieldValue(data, 'buttonColor', '#111827');
  const buttonTextColor = getFieldValue(data, 'buttonTextColor', '#ffffff');

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'newsletter' }),
      });
    } catch {}
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <section style={{ backgroundColor: bgColor, padding: '4rem 0' }}>
      <div className="max-w-2xl mx-auto px-6 text-center">
        {heading && (
          <h2 className="text-2xl font-black text-gray-900 mb-2">{heading}</h2>
        )}
        {subtitle && (
          <p className="text-gray-500 mb-6">{subtitle}</p>
        )}
        {submitted ? (
          <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold">
            <i className="fas fa-check-circle" />
            <span>{successMessage}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
            />
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: buttonColor, color: buttonTextColor }}
              className="px-5 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 transition-opacity hover:opacity-90"
            >
              {loading ? '...' : buttonLabel}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
