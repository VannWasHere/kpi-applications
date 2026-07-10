import { KpisActionDialog } from './kpis-action-dialog'
import { KpisAssignDialog } from './kpis-assign-dialog'
import { KpisDeleteDialog } from './kpis-delete-dialog'
import { useKpisContext } from './kpis-provider'

export function KpisDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useKpisContext()
  return (
    <>
      <KpisActionDialog
        key='kpi-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <KpisActionDialog
            key={`kpi-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => setCurrentRow(null), 500)
            }}
            currentRow={currentRow}
          />

          <KpisDeleteDialog
            key={`kpi-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => setCurrentRow(null), 500)
            }}
            currentRow={currentRow}
          />

          <KpisAssignDialog
            key={`kpi-assign-${currentRow.id}`}
            open={open === 'assign'}
            onOpenChange={() => {
              setOpen('assign')
              setTimeout(() => setCurrentRow(null), 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
