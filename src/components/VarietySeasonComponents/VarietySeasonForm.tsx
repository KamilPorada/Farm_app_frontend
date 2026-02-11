import { useState } from 'react'
import SystemButton from '../ui/SystemButton'
import type { VarietySeason } from '../../types/VarietySeason'

type Props = {
  initial: VarietySeason | null
  totalTunnels: number
  usedTunnels: number
  onSave: (v: Omit<VarietySeason, 'id'>) => void
  onCancel: () => void
}

type Errors = {
  name?: string
  color?: string
  tunnelCount?: string
}

export default function VarietySeasonForm({
  initial,
  totalTunnels,
  usedTunnels,
  onSave,
  onCancel,
}: Props) {
  const [errors, setErrors] = useState<Errors>({})

  const [form, setForm] = useState({
    seasonYear: initial?.seasonYear ?? new Date().getFullYear(),
    name: initial?.name ?? '',
    color: initial?.color ?? 'Czerwona',
    tunnelCount: initial?.tunnelCount?.toString() ?? '',
  })

  // Ile realnie dostępne
  const availableTunnels = initial
    ? totalTunnels - usedTunnels + initial.tunnelCount
    : totalTunnels - usedTunnels

  /* =======================
     WALIDACJA
  ======================= */
  function validate(): boolean {
    const e: Errors = {}

    if (!form.name.trim() || form.name.trim().length < 3) {
      e.name = 'Nazwa musi mieć co najmniej 3 znaki'
    }

    if (!form.color) {
      e.color = 'Wybierz kolor'
    }

    const tunnelNumber = Number(form.tunnelCount)

    if (!form.tunnelCount) {
      e.tunnelCount = 'Podaj liczbę tuneli'
    } else if (Number.isNaN(tunnelNumber)) {
      e.tunnelCount = 'Nieprawidłowa liczba'
    } else if (tunnelNumber <= 0) {
      e.tunnelCount = 'Liczba tuneli musi być większa od 0'
    } else if (tunnelNumber > availableTunnels) {
      e.tunnelCount = `Możesz maksymalnie przypisać ${availableTunnels} tuneli`
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return

    onSave({
      ...form,
      tunnelCount: Number(form.tunnelCount),
    })
  }

  return (
    <section className="mt-6 border-t pt-4">
      <h2 className="text-xl font-semibold">
        {initial ? 'Edytuj odmianę' : 'Dodaj odmianę'}
      </h2>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">

        {/* NAZWA */}
        <Input
          label="Nazwa odmiany"
          value={form.name}
          error={errors.name}
          onChange={e =>
            setForm(p => ({ ...p, name: e.target.value }))
          }
        />

        {/* KOLOR */}
        <Select
          label="Kolor"
          value={form.color}
          error={errors.color}
          options={[
            { label: 'Czerwona', value: 'Czerwona' },
            { label: 'Żółta', value: 'Żółta' },
            { label: 'Pomarańczowa', value: 'Pomarańczowa' },
            { label: 'Zielona', value: 'Zielona' },
          ]}
          onChange={e =>
            setForm(p => ({ ...p, color: e.target.value }))
          }
        />

        {/* LICZBA TUNELI */}
        <Input
          label="Liczba tuneli"
          type="number"
          step="0.1"
          min="0"
          value={form.tunnelCount}
          error={errors.tunnelCount}
          onChange={e =>
            setForm(p => ({
              ...p,
              tunnelCount: e.target.value,
            }))
          }
        />

      </div>

      {/* INFO O DOSTĘPNYCH TUNELACH */}
      <div className="mt-2 text-sm text-gray-600">
        Dostępne tunele w sezonie: {availableTunnels}
      </div>

      <div className="mt-6 flex gap-3">
        <SystemButton onClick={handleSave}>
          Zapisz
        </SystemButton>

        <SystemButton variant="outline" onClick={onCancel}>
          Anuluj
        </SystemButton>
      </div>
    </section>
  )
}

/* =======================
   INPUT
======================= */
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

function Input({ label, error, ...props }: InputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        {...props}
        className={`mt-1 w-full rounded-md border px-3 py-2 text-sm ${
          error ? 'border-red-500' : ''
        }`}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}

/* =======================
   SELECT
======================= */
type SelectOption = { label: string; value: string }

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  options: SelectOption[]
  error?: string
}

function Select({ label, options, error, ...props }: SelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        {...props}
        className={`mt-1 w-full rounded-md border px-3 py-2 text-sm ${
          error ? 'border-red-500' : ''
        }`}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
