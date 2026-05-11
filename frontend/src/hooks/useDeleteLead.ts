import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteLead } from '@/lib/leadsApi';

export function useDeleteLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.removeQueries({ queryKey: ['lead', id] });
    },
  });
}
