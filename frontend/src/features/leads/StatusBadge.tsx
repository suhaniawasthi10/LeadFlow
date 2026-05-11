import { cn } from '@/lib/utils';
import type { LeadStatus } from '@/types/lead';

const STATUS_STYLES: Record<LeadStatus, string> = {
  New: 'bg-blue-50 text-blue-700',
  Contacted: 'bg-amber-50 text-amber-700',
  Qualified: 'bg-violet-50 text-violet-700',
  'Proposal Sent': 'bg-pink-50 text-pink-700',
  Won: 'bg-emerald-50 text-emerald-700',
  Lost: 'bg-gray-100 text-gray-600',
};

// Saturated dot colors for use in dropdowns / lists where the soft pastel
// badge backgrounds don't have enough contrast against the popover surface.
// eslint-disable-next-line react-refresh/only-export-components
export const STATUS_DOT_STYLES: Record<LeadStatus, string> = {
  New: 'bg-blue-500',
  Contacted: 'bg-amber-500',
  Qualified: 'bg-violet-500',
  'Proposal Sent': 'bg-pink-500',
  Won: 'bg-emerald-500',
  Lost: 'bg-gray-400',
};

interface StatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors',
        STATUS_STYLES[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
