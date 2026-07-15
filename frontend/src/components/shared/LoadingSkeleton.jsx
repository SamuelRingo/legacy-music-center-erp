import React from 'react';

export default function LoadingSkeleton({ type = 'table', rows = 5, columns = 3 }) {
  if (type === 'table') {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded-md w-1/4 animate-pulse"></div>
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              {Array.from({ length: columns }).map((_, j) => (
                <div key={j} className={`h-4 bg-zinc-200 dark:bg-zinc-700 rounded-md animate-pulse ${j === columns - 1 ? 'w-1/6 ml-auto' : 'flex-1'}`}></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
            <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-lg animate-pulse mb-3"></div>
            <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded-md w-1/2 animate-pulse mb-4"></div>
            <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded-md w-3/4 animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  // default / generic
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse w-full"></div>
      ))}
    </div>
  );
}
