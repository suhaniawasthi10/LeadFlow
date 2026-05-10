import { useQuery } from '@tanstack/react-query';
import { fetchLeads } from '@/lib/leadsApi';

export function useLeads() {
  return useQuery({
    queryKey: ['leads'],
    queryFn: fetchLeads,
  });
}
