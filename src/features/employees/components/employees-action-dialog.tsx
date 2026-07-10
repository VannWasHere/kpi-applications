import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Label } from '@/components/ui/label'
import { SelectDropdown } from '@/components/select-dropdown'
import { parseSupabaseError } from '@/lib/supabase-error'
import { roles, statuses } from '../data/data'
import { useCreateEmployee, useDepartments, useUpdateEmployee } from '../data/hooks'
import { type Employee } from '../data/schema'

const formSchema = z.object({
  employeeCode: z.string().min(1, 'Employee ID is required.'),
  fullName: z.string().min(1, 'Full name is required.'),
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Email is required.' : undefined),
  }),
  departmentId: z.string().nullable(),
  position: z.string().min(1, 'Position is required.'),
  status: z.union([z.literal('active'), z.literal('inactive')]),
  role: z.union([z.literal('admin'), z.literal('karyawan')]),
  createLogin: z.boolean(),
})
type EmployeeForm = z.infer<typeof formSchema>

type EmployeesActionDialogProps = {
  currentRow?: Employee
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmployeesActionDialog({
  currentRow,
  open,
  onOpenChange,
}: EmployeesActionDialogProps) {
  const isEdit = !!currentRow
  const { data: departments } = useDepartments()
  const createEmployee = useCreateEmployee()
  const updateEmployee = useUpdateEmployee()
  const isPending = createEmployee.isPending || updateEmployee.isPending

  const form = useForm<EmployeeForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          employeeCode: currentRow.employeeCode,
          fullName: currentRow.fullName,
          email: currentRow.email,
          departmentId: currentRow.departmentId,
          position: currentRow.position,
          status: currentRow.status,
          role: currentRow.role,
          createLogin: false,
        }
      : {
          employeeCode: '',
          fullName: '',
          email: '',
          departmentId: null,
          position: '',
          status: 'active',
          role: 'karyawan',
          createLogin: true,
        },
  })

  useEffect(() => {
    form.reset(
      isEdit
        ? {
            employeeCode: currentRow.employeeCode,
            fullName: currentRow.fullName,
            email: currentRow.email,
            departmentId: currentRow.departmentId,
            position: currentRow.position,
            status: currentRow.status,
            role: currentRow.role,
            createLogin: false,
          }
        : {
            employeeCode: '',
            fullName: '',
            email: '',
            departmentId: null,
            position: '',
            status: 'active',
            role: 'karyawan',
            createLogin: true,
          }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRow, open])

  async function onSubmit(values: EmployeeForm) {
    try {
      if (isEdit) {
        await updateEmployee.mutateAsync({
          id: currentRow.id,
          input: values,
          profileId: currentRow.profileId,
        })
        toast.success('Employee updated successfully.')
      } else {
        await createEmployee.mutateAsync(values)
        toast.success(
          values.createLogin
            ? 'Employee created and invited to sign in.'
            : 'Employee created successfully.'
        )
      }
      onOpenChange(false)
      form.reset()
    } catch (err) {
      const { message, isDuplicate } = parseSupabaseError(err)
      toast.error(message)
      // A duplicate isn't something the user can fix by resubmitting the
      // same form, so close the dialog instead of leaving it open.
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
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the employee details here.'
              : 'Create a new employee record here.'}{' '}
            Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='employee-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='grid gap-4'
          >
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='employeeCode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID</FormLabel>
                    <FormControl>
                      <Input placeholder='EMP-0001' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='fullName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Jane Doe' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder='jane.doe@company.com' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='departmentId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value ?? undefined}
                      onValueChange={field.onChange}
                      placeholder='Select department'
                      items={(departments ?? []).map((d) => ({
                        label: d.name,
                        value: d.id,
                      }))}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='position'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input placeholder='Software Engineer' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
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
                      items={statuses}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='role'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select role'
                      items={roles}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {!isEdit && (
              <FormField
                control={form.control}
                name='createLogin'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center gap-2 space-y-0'>
                    <FormControl>
                      <Checkbox
                        id='createLogin'
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <Label htmlFor='createLogin' className='cursor-pointer text-sm font-normal'>
                      Create a login and send a password setup email
                    </Label>
                  </FormItem>
                )}
              />
            )}
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='employee-form' disabled={isPending}>
            {isPending && <Loader2 className='animate-spin' />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
