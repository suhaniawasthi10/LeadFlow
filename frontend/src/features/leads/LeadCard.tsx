import { formatDistanceToNow } from 'date-fns';
import { StatusBadge } from './StatusBadge';
import type { Lead } from '@/types/lead';
import { cn } from '@/lib/utils';

interface LeadCardProps {
  lead: Lead;
  onClick?: (lead: Lead) => void;
}

export function LeadCard({ lead, onClick }: LeadCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(lead)}
      className={cn(
        'block w-full rounded-lg border border-gray-200 bg-white p-4 text-left',
        'transition-all duration-150 hover:shadow-sm hover:scale-[1.005]',
        'focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer',
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
          {lead.lastDiscussionNote && (
            <p className="mt-2 line-clamp-1 text-sm text-gray-700">{lead.lastDiscussionNote}</p>
          )}
        </div>
        {lead.lastDiscussionAt && (
          <span className="shrink-0 text-xs text-gray-400">
            {formatDistanceToNow(lead.lastDiscussionAt, { addSuffix: true })}
          </span>
        )}
      </div>
    </button>
  );
}
