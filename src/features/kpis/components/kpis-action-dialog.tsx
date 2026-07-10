import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
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
import { Input } from '@/components/ui/input'
import { SelectDropdown } from '@/components/select-dropdown'
import { Textarea } from '@/components/ui/textarea'
import { parseSupabaseError } from '@/lib/supabase-error'
import { kpiCategories, kpiStatuses } from '../data/data'
import { useCreateKpi, useUpdateKpi } from '../data/hooks'
import { type Kpi } from '../data/schema'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string(),
  category: z.string().min(1, 'Category is required.'),
  weight: z.coerce
    .number()
    .min(1, 'Weight must be greater than 0.')
    .max(100, 'Weight cannot exceed 100.'),
  target: z.coerce.number().min(0.01, 'Target must be greater than 0.'),
  dueDate: z.string().min(1, 'Due date is required.'),
  status: z.union([z.literal('draft'), z.literal('active'), z.literal('completed')]),
})
type KpiFormInput = z.input<typeof formSchema>
type KpiForm = z.output<typeof formSchema>

type KpisActionDialogProps = {
  currentRow?: Kpi
  open: boolean
  onOpenChange: (open: boolean) => void
}

function toDefaultValues(currentRow: Kpi | undefined): KpiFormInput {
  return currentRow
    ? {
        title: currentRow.title,
        description: currentRow.description ?? '',
        category: currentRow.category,
        weight: currentRow.weight,
        target: currentRow.target,
        dueDate: currentRow.dueDate,
        status: currentRow.status,
      }
    : {
        title: '',
        description: '',
        category: '',
        weight: 10,
        target: 100,
        dueDate: '',
        status: 'draft',
      }
}

export function KpisActionDialog({
  currentRow,
  open,
  onOpenChange,
}: KpisActionDialogProps) {
  const isEdit = !!currentRow
  const createKpi = useCreateKpi()
  const updateKpi = useUpdateKpi()
  const isPending = createKpi.isPending || updateKpi.isPending

  const form = useForm<KpiFormInput, unknown, KpiForm>({
    resolver: zodResolver(formSchema),
    defaultValues: toDefaultValues(currentRow),
  })

  useEffect(() => {
    form.reset(toDefaultValues(currentRow))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRow, open])

  async function onSubmit(values: KpiForm) {
    try {
      const input = { ...values, description: values.description || null }
      if (isEdit) {
        await updateKpi.mutateAsync({ id: currentRow.id, input })
        toast.success('KPI updated successfully.')
      } else {
        await createKpi.mutateAsync(input)
        toast.success('KPI created successfully.')
      }
      onOpenChange(false)
      form.reset()
    } catch (err) {
      const { message, isDuplicate } = parseSupabaseError(err)
      toast.error(message)
      if (isDuplicate) {
        onOpenChange(false)
        form.reset()
      }
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit KPI' : 'Create KPI'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the KPI details here.'
              : 'Define a new KPI / OKR here.'}{' '}
            Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='kpi-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='grid gap-4'
          >
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KPI Title</FormLabel>
                  <FormControl>
                    <Input placeholder='Increase quarterly sales' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Describe the goal and how it will be measured.'
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select category'
                      items={kpiCategories.map((c) => ({ label: c, value: c }))}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select status'
                      items={kpiStatuses}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid grid-cols-3 gap-4'>
              <FormField
                control={form.control}
                name='weight'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (%)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={1}
                        max={100}
                        {...field}
                        value={field.value as number | string}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='target'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={0.01}
                        step='any'
                        {...field}
                        value={field.value as number | string}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='dueDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type='date' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='kpi-form' disabled={isPending}>
            {isPending && <Loader2 className='animate-spin' />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
