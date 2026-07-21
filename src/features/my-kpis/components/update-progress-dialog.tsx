import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useUpdateMyProgress } from '@/features/kpis/data/hooks'
import { type MyKpiAssignment } from '@/features/kpis/data/schema'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { NumberInput } from '@/components/number-input'
import { Textarea } from '@/components/ui/textarea'
import { formatNumber } from '@/lib/utils'

const formSchema = z.object({
  currentValue: z.coerce.number().min(0, 'Value cannot be negative.'),
  notes: z.string(),
})
type ProgressFormInput = z.input<typeof formSchema>
type ProgressForm = z.output<typeof formSchema>

type UpdateProgressDialogProps = {
  employeeId: string
  assignment: MyKpiAssignment | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdateProgressDialog({
  employeeId,
  assignment,
  open,
  onOpenChange,
}: UpdateProgressDialogProps) {
  const updateProgress = useUpdateMyProgress(employeeId)

  const form = useForm<ProgressFormInput, unknown, ProgressForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentValue: assignment?.currentValue ?? 0,
      notes: assignment?.notes ?? '',
    },
  })

  useEffect(() => {
    form.reset({
      currentValue: assignment?.currentValue ?? 0,
      notes: assignment?.notes ?? '',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignment, open])

  async function onSubmit(values: ProgressForm) {
    if (!assignment) return
    try {
      await updateProgress.mutateAsync({
        assignmentId: assignment.id,
        currentValue: values.currentValue,
        notes: values.notes || null,
      })
      toast.success('Progress updated.')
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update progress.')
    }
  }

  if (!assignment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>Update Progress</DialogTitle>
          <DialogDescription>{assignment.kpiTitle}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='progress-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='grid gap-4'
          >
            <p className='text-sm text-muted-foreground'>
              Target:{' '}
              <span className='font-medium'>{formatNumber(assignment.kpiTarget)}</span>
            </p>
            <FormField
              control={form.control}
              name='currentValue'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Value</FormLabel>
                  <FormControl>
                    <NumberInput
                      value={field.value as number | string}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='notes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Add context about your progress.'
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='progress-form' disabled={updateProgress.isPending}>
            {updateProgress.isPending && <Loader2 className='animate-spin' />}
            Save progress
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
