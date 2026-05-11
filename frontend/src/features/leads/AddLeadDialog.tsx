import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useCreateLead } from '@/hooks/useCreateLead';

const addLeadSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  company: z.string().trim().optional(),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!val) return true;
        if (!/^[\d\s+()-]+$/.test(val)) return false;
        const digits = val.replace(/\D/g, '').length;
        return digits >= 7 && digits <= 15;
      },
      { message: 'Enter a valid phone number (7–15 digits)' },
    )
    .optional(),
});

type AddLeadInput = z.infer<typeof addLeadSchema>;

interface AddLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLeadDialog({ open, onOpenChange }: AddLeadDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddLeadInput>({
    resolver: zodResolver(addLeadSchema),
    defaultValues: { name: '', company: '', phone: '' },
    mode: 'onTouched',
  });

  const createLead = useCreateLead();

  const onSubmit = (input: AddLeadInput) => {
    createLead.mutate(input, {
      onSuccess: () => {
        toast.success(`Added ${input.name}`);
        reset();
        onOpenChange(false);
      },
      onError: () => {
        toast.error('Could not add lead — please try again');
      },
    });
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 pb-2 pt-6">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Add New Lead
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-sm text-gray-500">
              Create a new lead. You can add discussions and follow-ups later.
            </DialogDescription>
          </div>

          <div className="flex flex-col gap-5 px-6 py-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lead-name" className="text-sm font-medium text-gray-900">
                Full Name
                <span className="ml-1 text-red-500">*</span>
              </Label>
              <Input
                id="lead-name"
                autoFocus
                placeholder="Sarah Connor"
                className="h-10 rounded-md px-3 text-sm"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lead-company" className="text-sm font-medium text-gray-900">
                Company
                <span className="ml-1.5 text-xs font-normal text-gray-400">
                  (optional)
                </span>
              </Label>
              <Input
                id="lead-company"
                placeholder="Acme Corp"
                className="h-10 rounded-md px-3 text-sm"
                {...register('company')}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lead-phone" className="text-sm font-medium text-gray-900">
                Phone
                <span className="ml-1.5 text-xs font-normal text-gray-400">
                  (optional)
                </span>
              </Label>
              <Input
                id="lead-phone"
                placeholder="+1 (555) 123-4567"
                className="h-10 rounded-md px-3 text-sm"
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-xs text-red-600">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-md px-4 text-sm font-medium"
                />
              }
            >
              Cancel
            </DialogClose>
            <Button
              type="submit"
              disabled={createLead.isPending}
              className="h-9 gap-2 rounded-md bg-black px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {createLead.isPending && <Loader2 className="size-3.5 animate-spin" />}
              {createLead.isPending ? 'Saving…' : 'Save Lead'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
