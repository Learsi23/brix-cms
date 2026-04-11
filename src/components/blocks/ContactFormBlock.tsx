'use client';

import { useState } from 'react';
import { getFieldValue } from '@/lib/blocks/types';
import type { BlockData } from '@/lib/blocks/types';

export default function ContactFormBlock({ data }: { data: BlockData }) {
  const title = getFieldValue(data, 'Title', 'Contact Us');
  const recipientEmail = getFieldValue(data, 'RecipientEmail');
  const buttonText = getFieldValue(data, 'ButtonText', 'Send Message');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, recipientEmail }),
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="max-w-lg mx-auto py-12 px-6 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Message sent!</h3>
        <p className="text-slate-500 text-sm">We will get back to you shortly.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-12 px-6">
      {title && <h2 className="text-2xl font-bold text-slate-800 mb-6">{title}</h2>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">Message</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
            rows={5}
            className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
            placeholder="Write your message..."
          />
        </div>
        {status === 'error' && (
          <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>
        )}
        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-colors disabled:opacity-60 text-sm"
        >
          {status === 'sending' ? 'Sending...' : buttonText}
        </button>
      </form>
    </div>
  );
}
