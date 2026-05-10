import { useState } from 'react';
import { isToday } from 'date-fns';
import { Flag } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { LeadCard } from './LeadCard';
import { LEAD_STATUSES, type Lead, type LeadStatus } from '@/types/lead';
import { cn } from '@/lib/utils';

type FilterValue = LeadStatus | 'all';

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  ...LEAD_STATUSES.map((s) => ({ value: s, label: s })),
];

interface LeadListProps {
  onLeadClick?: (lead: Lead) => void;
}

export function LeadList({ onLeadClick }: LeadListProps) {
  const { data: leads, isLoading, isError } = useLeads();
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-lg border border-gray-200 bg-gray-50"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load leads. Is the backend running?
      </div>
    );
  }

  const allLeads = leads ?? [];

  if (allLeads.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center">
        <p className="text-sm text-gray-500">No leads yet</p>
        <p className="mt-1 text-xs text-gray-400">Add your first lead to get started.</p>
      </div>
    );
  }

  const todayFollowUps = allLeads.filter(
    (l) => l.followUpAt && isToday(l.followUpAt),
  );
  const filteredLeads =
    activeFilter === 'all'
      ? allLeads
      : allLeads.filter((l) => l.status === activeFilter);

  return (
    <div>
      {/* Status filter pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setActiveFilter(opt.value)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              activeFilter === opt.value
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Today's follow-ups — always-on widget, ignores the status filter */}
      {todayFollowUps.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">
            <Flag className="size-3.5" />
            Today's Follow-ups
          </h2>
          <div className="space-y-3">
            {todayFollowUps.map((lead) => (
              <LeadCard key={lead._id} lead={lead} onClick={onLeadClick} />
            ))}
          </div>
        </section>
      )}

      {/* Main filtered list */}
      <div className="space-y-3">
        {filteredLeads.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-500">No leads match this filter</p>
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <LeadCard key={lead._id} lead={lead} onClick={onLeadClick} />
          ))
        )}
      </div>
    </div>
  );
}
