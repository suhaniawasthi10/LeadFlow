import { useState } from 'react';
import { isToday } from 'date-fns';
import { Flag, Search, X } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { LeadCard } from './LeadCard';
import { Input } from '@/components/ui/input';
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
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const searchQuery = debouncedSearch.trim().toLowerCase();

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

  // Search and status filter both narrow the entire view (today's section + main).
  // Then today's gets extracted out of the main list so leads don't appear twice.
  const searchedLeads = searchQuery
    ? allLeads.filter((l) => l.name.toLowerCase().includes(searchQuery))
    : allLeads;

  const filteredLeads =
    activeFilter === 'all'
      ? searchedLeads
      : searchedLeads.filter((l) => l.status === activeFilter);

  const todayFollowUps = filteredLeads.filter(
    (l) => l.followUpAt && isToday(l.followUpAt),
  );
  const todayIds = new Set(todayFollowUps.map((l) => l._id));
  const mainListLeads = filteredLeads.filter((l) => !todayIds.has(l._id));

  const rawSearch = searchInput.trim();
  const emptyMessage =
    rawSearch && activeFilter !== 'all'
      ? `No leads match "${rawSearch}" in ${activeFilter}`
      : rawSearch
        ? `No leads match "${rawSearch}"`
        : activeFilter !== 'all'
          ? `No ${activeFilter} leads`
          : 'No leads match';

  return (
    <div>
      {/* Search input */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search leads by name…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-9 rounded-md pl-9 pr-9 text-sm"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

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

      {/* Today's follow-ups */}
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

      {/* Main filtered list (today's leads already extracted into the section above) */}
      {todayFollowUps.length === 0 && mainListLeads.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-500">{emptyMessage}</p>
          <p className="mt-1 text-xs text-gray-400">
            Try clearing the search or picking a different filter.
          </p>
        </div>
      ) : (
        <section>
          {/* Only show header when today's section is also visible — avoids
              a redundant label when there's only one block. */}
          {todayFollowUps.length > 0 && mainListLeads.length > 0 && (
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
              {activeFilter === 'all' ? 'All Leads' : activeFilter}
            </h2>
          )}
          <div className="space-y-3">
            {mainListLeads.map((lead) => (
              <LeadCard key={lead._id} lead={lead} onClick={onLeadClick} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
