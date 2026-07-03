import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

/**
 * ActionMenu
 * 
 * @param {Object} props
 * @param {Array} props.actions - Array of action objects: { label, icon: Icon, onClick, isDanger }
 */
export function ActionMenu({ actions = [] }) {
  const validActions = actions.filter(Boolean);
  if (validActions.length === 0) return null;

  const normalActions = validActions.filter(a => !a.isDanger);
  const dangerActions = validActions.filter(a => a.isDanger);

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-900 rounded-lg">
            <MoreHorizontal size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {normalActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <DropdownMenuItem 
                key={`normal-${idx}`} 
                onClick={action.onClick}
                disabled={action.disabled}
                className="cursor-pointer gap-2"
              >
                {Icon && <Icon size={14} />}
                {action.label}
              </DropdownMenuItem>
            );
          })}

          {normalActions.length > 0 && dangerActions.length > 0 && (
            <DropdownMenuSeparator />
          )}

          {dangerActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <DropdownMenuItem 
                key={`danger-${idx}`} 
                onClick={action.onClick}
                disabled={action.disabled}
                className="cursor-pointer gap-2 text-red-600 focus:text-red-700 focus:bg-red-50"
              >
                {Icon && <Icon size={14} />}
                {action.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
