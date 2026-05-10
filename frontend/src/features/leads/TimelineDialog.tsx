import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { format, formatDistanceToNow, startOfDay } from 'date-fns';
import { Building, Calendar as CalendarIcon, Clock, Phone } from 'lucide-react';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useLead } from '@/hooks/useLead';
import { useUpdateLead } from '@/hooks/useUpdateLead';
import { useCreateDiscussion } from '@/hooks/useCreateDiscussion';
import { LEAD_STATUSES, type LeadStatus } from '@/types/lead';

const noteSchema = z
  .object({
    note: z.string().trim().min(1, 'Note is required'),
    setFollowUp: z.boolean(),
    followUpDate: z.date().optional(),
    followUpTime: z.string(),
  })
  .refine((data) => !data.setFollowUp || data.followUpDate !== undefined, {
    message: 'Pick a follow-up date',
    path: ['followUpDate'],
  });

type NoteFormInput = z.infer<typeof noteSchema>;

interface TimelineDialogProps {
  leadId: string | null;
  onClose: () => void;
}

export function TimelineDialog({ leadId, onClose }: TimelineDialogProps) {
  const open = leadId !== null;
  const { data } = useLead(leadId);
  const updateLead = useUpdateLead();
  const createDiscussion = useCreateDiscussion();

  // Optimistic status so the Select doesn't flash back to the old value
  // while the PATCH is in flight.
  const [localStatus, setLocalStatus] = useState<LeadStatus | undefined>();
  useEffect(() => {
    if (data?.lead.status) setLocalStatus(data.lead.status);
  }, [data?.lead.status]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<NoteFormInput>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      note: '',
      setFollowUp: false,
      followUpDate: undefined,
      followUpTime: '09:00',
    },
  });

  const setFollowUp = watch('setFollowUp');
  const followUpDate = watch('followUpDate');

  const handleStatusChange = (next: string | null) => {
    if (!leadId || !next) return;
    const previous = localStatus;
    setLocalStatus(next as LeadStatus);
    updateLead.mutate(
      { id: leadId, input: { status: next as LeadStatus } },
      {
        onSuccess: () => toast.success(`Status set to ${next}`),
        onError: () => {
          if (previous) setLocalStatus(previous);
          toast.error('Failed to update status');
        },
      },
    );
  };

  const onSubmitNote = (input: NoteFormInput) => {
    if (!leadId) return;
    let followUpAt: Date | undefined;
    if (input.setFollowUp && input.followUpDate) {
      const [h, m] = input.followUpTime.split(':').map(Number);
      followUpAt = new Date(input.followUpDate);
      followUpAt.setHours(h ?? 9, m ?? 0, 0, 0);
    }
    createDiscussion.mutate(
      { leadId, input: { note: input.note, followUpAt } },
      {
        onSuccess: () => {
          toast.success('Note added');
          reset();
          onClose();
        },
        onError: () => toast.error('Failed to add note'),
      },
    );
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        {/* Always render DialogTitle for a11y, fall back during load */}
        {!data ? (
          <>
            <DialogTitle className="sr-only">Lead details</DialogTitle>
            <div className="flex items-center justify-center px-6 py-16 text-sm text-gray-500">
              Loading…
            </div>
          </>
        ) : (
          <>
            {/* Header (pr-12 leaves space for the close X in the corner) */}
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4 pl-6 pr-12 pt-6">
              <div className="min-w-0 flex-1">
                <DialogTitle className="truncate text-lg font-semibold text-gray-900">
                  {data.lead.name}
                </DialogTitle>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  {data.lead.company && (
                    <span className="inline-flex items-center gap-1">
                      <Building className="size-3.5" />
                      {data.lead.company}
                    </span>
                  )}
                  {data.lead.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="size-3.5" />
                      {data.lead.phone}
                    </span>
                  )}
                </div>
              </div>

              <Select value={localStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-9 min-w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Timeline body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {data.discussions.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No discussions yet. Start the conversation below.
                </p>
              ) : (
                <div className="relative">
                  <div className="absolute bottom-2 left-1.5 top-2 w-px bg-gray-200" />
                  <ul className="space-y-5">
                    {data.discussions.map((d) => (
                      <li key={d._id} className="relative pl-8">
                        <span className="absolute left-0 top-1.5 size-3 rounded-full bg-indigo-500 ring-4 ring-white" />
                        <div>
                          <p className="text-xs text-gray-500">
                            {format(d.createdAt, 'MMM d, h:mm a')}
                            <span className="mx-1.5 text-gray-300">·</span>
                            {formatDistanceToNow(d.createdAt, { addSuffix: true })}
                          </p>
                          <p className="mt-1 text-sm text-gray-700">{d.note}</p>
                          {d.followUpAt && (
                            <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                              <Clock className="size-3" />
                              Follow-up {format(d.followUpAt, 'MMM d, h:mm a')}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer form */}
            <form
              onSubmit={handleSubmit(onSubmitNote)}
              className="border-t border-gray-100 px-6 py-4"
            >
              <Textarea
                placeholder="Log a new discussion…"
                rows={3}
                className="resize-none rounded-md text-sm"
                {...register('note')}
              />
              {errors.note && (
                <p className="mt-1 text-xs text-red-600">{errors.note.message}</p>
              )}

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <label
                    htmlFor="set-followup"
                    className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700"
                  >
                    <Checkbox
                      id="set-followup"
                      checked={setFollowUp}
                      onCheckedChange={(checked) =>
                        setValue('setFollowUp', checked === true, {
                          shouldValidate: true,
                        })
                      }
                    />
                    Set follow-up
                  </label>

                  {setFollowUp && (
                    <div className="flex items-center gap-2">
                      <Popover>
                        <PopoverTrigger
                          render={
                            <Button
                              type="button"
                              variant="outline"
                              className="h-9 gap-2 px-3 text-sm font-normal"
                            >
                              <CalendarIcon className="size-4" />
                              {followUpDate
                                ? format(followUpDate, 'MMM d, yyyy')
                                : 'Pick date'}
                            </Button>
                          }
                        />
                        <PopoverContent
                          className="w-auto p-0"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={followUpDate}
                            onSelect={(d) =>
                              setValue('followUpDate', d ?? undefined, {
                                shouldValidate: true,
                              })
                            }
                            disabled={(date) => date < startOfDay(new Date())}
                          />
                        </PopoverContent>
                      </Popover>
                      <Input
                        type="time"
                        className="h-9 w-[110px] rounded-md px-3 text-sm"
                        {...register('followUpTime')}
                      />
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={createDiscussion.isPending}
                  className="h-9 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
                >
                  {createDiscussion.isPending ? 'Saving…' : 'Save Note'}
                </Button>
              </div>
              {errors.followUpDate && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.followUpDate.message}
                </p>
              )}
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
