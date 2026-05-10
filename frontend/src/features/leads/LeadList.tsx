import { useLeads } from '@/hooks/useLeads';
import { LeadCard } from './LeadCard';
import type { Lead } from '@/types/lead';

interface LeadListProps {
  onLeadClick?: (lead: Lead) => void;
}

export function LeadList({ onLeadClick }: LeadListProps) {
  const { data: leads, isLoading, isError } = useLeads();

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

  if (!leads || leads.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center">
        <p className="text-sm text-gray-500">No leads yet</p>
        <p className="mt-1 text-xs text-gray-400">Add your first lead to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => (
        <LeadCard key={lead._id} lead={lead} onClick={onLeadClick} />
      ))}
    </div>
  );
}
