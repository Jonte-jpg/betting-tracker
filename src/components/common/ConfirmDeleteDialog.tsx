import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type Props = Readonly<{
  open: boolean
  onOpenChange?: (open: boolean) => void
  title?: React.ReactNode
  description?: React.ReactNode
  confirmLabel?: React.ReactNode
  cancelLabel?: React.ReactNode
  onConfirm: () => void | Promise<void>
}>

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title = 'Är du säker?',
  description = 'Detta går inte att ångra.',
  confirmLabel = 'Ta bort',
  cancelLabel = 'Avbryt',
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="flex w-full gap-2 sm:justify-end">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange?.(false)}>
              {cancelLabel}
            </Button>
            <Button
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async (e) => {
                e.preventDefault()
                await onConfirm()
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmDeleteDialog
