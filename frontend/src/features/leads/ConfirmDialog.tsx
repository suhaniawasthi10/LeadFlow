import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  isLoading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <div className="px-6 pb-2 pt-6">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {title}
          </DialogTitle>
          <DialogDescription className="mt-1.5 text-sm text-gray-500">
            {description}
          </DialogDescription>
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
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="h-9 rounded-md bg-red-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-60"
          >
            {isLoading ? 'Deleting…' : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
