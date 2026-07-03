import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmptyState({ icon: Icon = FolderOpen, title = 'Belum Ada Data', description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl border-dashed">
      <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 mb-4">
        <Icon size={32} />
      </div>
      <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-sm mb-6">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
