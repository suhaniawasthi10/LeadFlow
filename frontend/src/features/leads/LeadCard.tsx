import { formatDistanceToNow } from 'date-fns';
import { StatusBadge } from './StatusBadge';
import type { Lead } from '@/types/lead';
import { cn } from '@/lib/utils';
import { isOverdue } from '@/lib/leadFilters';

interface LeadCardProps {
  lead: Lead;
  onClick?: (lead: Lead) => void;
}

export function LeadCard({ lead, onClick }: LeadCardProps) {
  const overdue = isOverdue(lead);
  return (
    <button
      type="button"
      onClick={() => onClick?.(lead)}
      className={cn(
        'block w-full rounded-lg border border-gray-200 bg-white p-4 text-left',
        'transition-colors duration-100 hover:bg-gray-50/50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 cursor-pointer',
        overdue && 'border-l-4 border-l-red-500',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{lead.name}</span>
            <StatusBadge status={lead.status} />
          </div>
          {lead.company && (
            <p className="mt-0.5 text-xs text-gray-500">{lead.company}</p>
          )}
          <p
            className={cn(
              'mt-2 line-clamp-1 text-sm',
              lead.lastDiscussionNote ? 'text-gray-700' : 'text-gray-400',
            )}
          >
            {lead.lastDiscussionNote ?? 'No discussions yet'}
          </p>
        </div>
        <span className="shrink-0 text-xs text-gray-400">
          {formatDistanceToNow(lead.updatedAt, { addSuffix: true })}
        </span>
      </div>
    </button>
  );
}
