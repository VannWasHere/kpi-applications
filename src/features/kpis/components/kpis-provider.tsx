import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Kpi } from '../data/schema'

type KpisDialogType = 'add' | 'edit' | 'delete' | 'assign'

type KpisContextType = {
  open: KpisDialogType | null
  setOpen: (str: KpisDialogType | null) => void
  currentRow: Kpi | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Kpi | null>>
}

const KpisContext = React.createContext<KpisContextType | null>(null)

export function KpisProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<KpisDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Kpi | null>(null)

  return (
    <KpisContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </KpisContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useKpisContext = () => {
  const context = React.useContext(KpisContext)
  if (!context) {
    throw new Error('useKpisContext has to be used within <KpisContext>')
  }
  return context
}
