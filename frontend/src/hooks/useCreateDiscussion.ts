import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDiscussion, type CreateDiscussionInput } from '@/lib/leadsApi';

export function useCreateDiscussion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      leadId,
      input,
    }: {
      leadId: string;
      input: CreateDiscussionInput;
    }) => createDiscussion(leadId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.leadId] });
    },
  });
}
