import * as React from 'react'
import { formatNumberInput, parseFormattedNumber } from '@/lib/utils'
import { Input } from '@/components/ui/input'

type NumberInputProps = Omit<
  React.ComponentProps<'input'>,
  'type' | 'value' | 'onChange' | 'onBlur'
> & {
  /** Plain numeric value (unformatted), as stored in form state. */
  value: number | string
  /** Receives the parsed plain number whenever the input changes. */
  onChange: (value: number) => void
  onBlur?: () => void
}

/**
 * Text input that live-formats numbers with a thousands separator
 * (e.g. `1000000` -> `1.000.000`) while typing, and reports the plain
 * numeric value back via `onChange`. Safe to use as a drop-in replacement
 * for `<Input type="number">` in react-hook-form fields.
 */
function NumberInput({ value, onChange, onBlur, className, ...props }: NumberInputProps) {
  const [display, setDisplay] = React.useState(() => formatNumberInput(String(value ?? '')))
  const isFocused = React.useRef(false)

  // Keep the displayed value in sync when the underlying value changes
  // externally (e.g. form reset), but don't fight the user while typing.
  React.useEffect(() => {
    if (!isFocused.current) {
      setDisplay(formatNumberInput(String(value ?? '')))
    }
  }, [value])

  return (
    <Input
      type='text'
      inputMode='decimal'
      className={className}
      {...props}
      value={display}
      onFocus={(e) => {
        isFocused.current = true
        props.onFocus?.(e)
      }}
      onChange={(e) => {
        const formatted = formatNumberInput(e.target.value)
        setDisplay(formatted)
        onChange(parseFormattedNumber(formatted))
      }}
      onBlur={() => {
        isFocused.current = false
        setDisplay(formatNumberInput(String(value ?? '')))
        onBlur?.()
      }}
    />
  )
}

export { NumberInput }
