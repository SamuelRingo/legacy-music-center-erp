import React from 'react';
import { AlertTriangle, Trash2, Info } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  variant = 'default',
  onConfirm,
  onCancel,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  isProcessing = false,
  children
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          titleClass: 'text-red-600',
          buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
          Icon: Trash2,
          iconClass: 'text-red-600'
        };
      case 'warning':
        return {
          titleClass: 'text-amber-600',
          buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
          Icon: AlertTriangle,
          iconClass: 'text-amber-600'
        };
      case 'default':
      default:
        return {
          titleClass: 'text-blue-600',
          buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
          Icon: Info,
          iconClass: 'text-blue-600'
        };
    }
  };

  const { titleClass, buttonClass, Icon, iconClass } = getVariantStyles();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 duration-150 shadow-2xl border-zinc-200 dark:border-zinc-800">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full ${iconClass}`}>
              <Icon size={24} />
            </div>
            <AlertDialogTitle className={titleClass}>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2 text-zinc-600 dark:text-zinc-400">
            {description}
          </AlertDialogDescription>
          {children && (
            <div className="mt-4 text-sm">
              {children}
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel 
            disabled={isProcessing} 
            onClick={onCancel}
            className="mr-auto sm:mr-0"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isProcessing}
            className={buttonClass}
          >
            {isProcessing ? 'Memproses...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
