import { useQuery } from '@tanstack/react-query';
import { fetchLead } from '@/lib/leadsApi';

export function useLead(id: string | null) {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => fetchLead(id as string),
    enabled: id != null,
  });
}
