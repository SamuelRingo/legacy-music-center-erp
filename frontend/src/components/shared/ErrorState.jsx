import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
        <AlertCircle size={24} />
      </div>
      <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Terjadi Kesalahan</h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-sm mb-6">
        {message || 'Gagal memuat data. Silakan coba beberapa saat lagi.'}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Coba Lagi
        </Button>
      )}
    </div>
  );
}
