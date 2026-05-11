import { useState } from 'react';
import { isToday } from 'date-fns';
import { ArrowUpDown, Calendar, Flag, Plus, Search, UserPlus, X } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { LeadCard } from './LeadCard';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LEAD_STATUSES, type Lead, type LeadStatus } from '@/types/lead';
import { cn } from '@/lib/utils';
import {
  hasNoFollowUp,
  isFollowUpThisWeek,
  isFollowUpToday,
  isOverdue,
} from '@/lib/leadFilters';

type FilterValue = LeadStatus | 'all';
type FollowUpFilter = 'any' | 'today' | 'overdue' | 'thisWeek' | 'noFollowUp';
type SortKey = 'recent' | 'name' | 'followUp';

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  ...LEAD_STATUSES.map((s) => ({ value: s, label: s })),
];

const FOLLOWUP_LABELS: Record<FollowUpFilter, string> = {
  any: 'Any follow-up',
  today: 'Today',
  overdue: 'Overdue',
  thisWeek: 'This week',
  noFollowUp: 'No follow-up',
};

const SORT_LABELS: Record<SortKey, string> = {
  recent: 'Recent activity',
  name: 'Name A–Z',
  followUp: 'Follow-up date',
};

function sortLeads(list: Lead[], sortBy: SortKey): Lead[] {
  const copy = [...list];
  switch (sortBy) {
    case 'name':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case 'followUp':
      // Leads without a follow-up date go to the end; otherwise ascending.
      return copy.sort((a, b) => {
        if (!a.followUpAt && !b.followUpAt) return 0;
        if (!a.followUpAt) return 1;
        if (!b.followUpAt) return -1;
        return a.followUpAt.getTime() - b.followUpAt.getTime();
      });
    case 'recent':
    default:
      return copy.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }
}

interface LeadListProps {
  onLeadClick?: (lead: Lead) => void;
  onAddLead?: () => void;
}

const SKELETON_WIDTHS = [
  { name: 'w-32', company: 'w-20', note: 'w-72' },
  { name: 'w-28', company: 'w-24', note: 'w-56' },
  { name: 'w-36', company: 'w-16', note: 'w-64' },
  { name: 'w-24', company: 'w-28', note: 'w-80' },
  { name: 'w-40', company: 'w-20', note: 'w-60' },
];

export function LeadList({ onLeadClick, onAddLead }: LeadListProps) {
  const { data: leads, isLoading, isError } = useLeads();
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
  const [followUpFilter, setFollowUpFilter] = useState<FollowUpFilter>('any');
  const [sortBy, setSortBy] = useState<SortKey>('recent');
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const searchQuery = debouncedSearch.trim().toLowerCase();

  const clearFilters = () => {
    setSearchInput('');
    setActiveFilter('all');
    setFollowUpFilter('any');
    setSortBy('recent');
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {SKELETON_WIDTHS.map((w, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="flex items-center gap-2">
              <div className={cn('h-3 rounded bg-gray-200', w.name)} />
              <div className="h-3 w-14 rounded-md bg-gray-100" />
            </div>
            <div className={cn('mt-2 h-2.5 rounded bg-gray-100', w.company)} />
            <div className={cn('mt-3 h-3 rounded bg-gray-100', w.note)} />
          </div>
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
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-200 py-16 text-center">
        <UserPlus className="size-8 text-gray-300" />
        <div>
          <p className="text-sm font-medium text-gray-900">No leads yet</p>
          <p className="mt-1 text-xs text-gray-500">
            Add your first lead to get started.
          </p>
        </div>
        {onAddLead && (
          <button
            type="button"
            onClick={onAddLead}
            className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-gray-900"
          >
            <Plus className="size-3.5" />
            Add new lead
          </button>
        )}
      </div>
    );
  }

  // Pipeline: allLeads → search → follow-up filter → status filter → extract today's
  const searchedLeads = searchQuery
    ? allLeads.filter((l) => l.name.toLowerCase().includes(searchQuery))
    : allLeads;

  const followUpFilteredLeads = searchedLeads.filter((l) => {
    switch (followUpFilter) {
      case 'today':
        return isFollowUpToday(l);
      case 'overdue':
        return isOverdue(l);
      case 'thisWeek':
        return isFollowUpThisWeek(l);
      case 'noFollowUp':
        return hasNoFollowUp(l);
      case 'any':
      default:
        return true;
    }
  });

  const filteredLeads =
    activeFilter === 'all'
      ? followUpFilteredLeads
      : followUpFilteredLeads.filter((l) => l.status === activeFilter);

  const sortedLeads = sortLeads(filteredLeads, sortBy);
  const todayFollowUps = sortedLeads.filter(
    (l) => l.followUpAt && isToday(l.followUpAt),
  );
  const todayIds = new Set(todayFollowUps.map((l) => l._id));
  const mainListLeads = sortedLeads.filter((l) => !todayIds.has(l._id));

  // Build a specific empty-state message describing the active filters
  const rawSearch = searchInput.trim();
  const conditions: string[] = [];
  if (rawSearch) conditions.push(`"${rawSearch}"`);
  if (activeFilter !== 'all') conditions.push(activeFilter);
  if (followUpFilter !== 'any') conditions.push(FOLLOWUP_LABELS[followUpFilter]);
  const emptyMessage =
    conditions.length > 0 ? `No leads match ${conditions.join(' · ')}` : 'No leads match';

  return (
    <div>
      {/* Search (left) + Sort (right) */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
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

        <Select
          value={sortBy}
          onValueChange={(v) => v && setSortBy(v as SortKey)}
        >
          <SelectTrigger className="h-9 gap-2 rounded-md px-3 text-sm">
            <ArrowUpDown className="size-3.5 text-gray-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(SORT_LABELS) as SortKey[]).map((value) => (
              <SelectItem key={value} value={value}>
                {SORT_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status pills (left) + Follow-up dropdown (right) */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
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

        <Select
          value={followUpFilter}
          onValueChange={(v) => v && setFollowUpFilter(v as FollowUpFilter)}
        >
          <SelectTrigger
            className={cn(
              'h-7 gap-1.5 rounded-full border-transparent px-3 text-xs font-medium transition-colors',
              followUpFilter === 'any'
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-gray-900 text-white hover:bg-gray-800',
            )}
          >
            <Calendar className="size-3.5" />
            <span>Follow-up: {FOLLOWUP_LABELS[followUpFilter]}</span>
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(FOLLOWUP_LABELS) as FollowUpFilter[]).map((value) => (
              <SelectItem key={value} value={value}>
                {FOLLOWUP_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Today's follow-ups */}
      {todayFollowUps.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.08em] text-gray-500">
            <Flag className="size-3.5" />
            Today's Follow-ups
          </h2>
          <div className="space-y-2">
            {todayFollowUps.map((lead) => (
              <LeadCard key={lead._id} lead={lead} onClick={onLeadClick} />
            ))}
          </div>
        </section>
      )}

      {/* Main filtered list (today's leads already extracted into the section above) */}
      {todayFollowUps.length === 0 && mainListLeads.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-200 py-16 text-center">
          <Search className="size-8 text-gray-300" />
          <div>
            <p className="text-sm font-medium text-gray-900">{emptyMessage}</p>
            <p className="mt-1 text-xs text-gray-500">
              Try adjusting your search or filter.
            </p>
          </div>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-1 text-xs font-medium text-gray-900 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <section>
          {/* Only show header when today's section is also visible — avoids
              a redundant label when there's only one block. */}
          {todayFollowUps.length > 0 && mainListLeads.length > 0 && (
            <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.08em] text-gray-500">
              {activeFilter === 'all' ? 'All Leads' : activeFilter}
            </h2>
          )}
          <div className="space-y-2">
            {mainListLeads.map((lead) => (
              <LeadCard key={lead._id} lead={lead} onClick={onLeadClick} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
