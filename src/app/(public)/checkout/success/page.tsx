'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderRef = searchParams.get('orderRef') || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">¡Pedido confirmado!</h1>
        <p className="text-gray-600 mb-6">
          Gracias por tu compra. Tu pedido ha sido procesado exitosamente.
        </p>

        {orderRef && (
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">Número de pedido</p>
            <p className="text-xl font-mono font-bold text-gray-800">#{orderRef}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link 
            href="/" 
            className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
          >
            Volver al inicio
          </Link>
          <Link 
            href="/cart" 
            className="w-full py-3 px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            Ver más productos
          </Link>
        </div>
      </div>
    </div>
  );
}