import { useMemo, useState } from 'react'
import SystemButton from '../ui/SystemButton'
import type { Fertigation } from '../../types/Fertigation'
import type { Fertilizer } from '../../types/Fertilizer'

type Props = {
	initial: Fertigation | null
	fertilizers: Fertilizer[]
	tunnelsInActualSeason: number
	year: number
	onSave: (f: Fertigation) => void
	onCancel: () => void
}

type Errors = {
	date?: string
	fertilizerId?: string
	dose?: string
	tunnelCount?: string
}

export default function FertigationForm({
	initial,
	fertilizers,
	tunnelsInActualSeason,
	year,
	onSave,
	onCancel,
}: Props) {
	const today = new Date().toISOString().split('T')[0]

	const [errors, setErrors] = useState<Errors>({})

	const [form, setForm] = useState<Fertigation>({
		id: initial?.id,
		fertilizerId: initial?.fertilizerId ?? fertilizers[0]?.id ?? 0,
		fertigationDate: initial?.fertigationDate ?? today,
		dose: initial?.dose ?? ('' as any),
		tunnelCount: initial?.tunnelCount ?? ('' as any),
	})

	/* 🔹 wybrany nawóz */
	const selectedFertilizer = useMemo(
		() => fertilizers.find(f => f.id === form.fertilizerId),
		[form.fertilizerId, fertilizers],
	)

	/* 🔹 jednostka dawki */
	const doseUnit = selectedFertilizer?.form?.toLowerCase() === 'płynny' ? 'l/tunel' : 'kg/tunel'

	/* =======================
	   WALIDACJA
	======================= */
	function validate(): boolean {
		const e: Errors = {}
		const formDate = new Date(form.fertigationDate)

		if (formDate.getFullYear() !== year) {
			e.date = `Data powinna należeć do sezonu ${year}`
		}

		if (!form.fertigationDate) {
			e.date = 'Wybierz datę fertygacji'
		}

		if (!form.fertilizerId) {
			e.fertilizerId = 'Wybierz nawóz'
		}

		if (!form.dose || Number(form.dose) <= 0) {
			e.dose = 'Podaj dawkę większą niż 0'
		}

		if (!form.tunnelCount || Number(form.tunnelCount) <= 0) {
			e.tunnelCount = 'Podaj liczbę tuneli'
		}

		if (Number(form.tunnelCount) > tunnelsInActualSeason) {
			e.tunnelCount = `Maksymalnie ${tunnelsInActualSeason} tuneli`
		}

		setErrors(e)
		return Object.keys(e).length === 0
	}

	function handleSave() {
		if (!validate()) return

		onSave({
			...form,
			dose: Number(form.dose),
			tunnelCount: Number(form.tunnelCount),
		})
	}

	return (
		<section className='mt-6 border-t pt-4'>
			<h2 className='text-xl font-semibold'>{initial ? 'Edytuj fertygację' : 'Dodaj fertygację'}</h2>

			<div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-2'>
				{/* DATA */}
				<Input
					label='Data fertygacji'
					type='date'
					value={form.fertigationDate}
					error={errors.date}
					onChange={e => setForm(p => ({ ...p, fertigationDate: e.target.value }))}
				/>

				{/* NAWÓZ */}
				<Select
					label='Nawóz'
					value={form.fertilizerId}
					error={errors.fertilizerId}
					options={fertilizers.map(f => ({
						label: f.name,
						value: String(f.id),
					}))}
					onChange={e =>
						setForm(p => ({
							...p,
							fertilizerId: Number(e.target.value),
						}))
					}
				/>

				{/* DAWKA */}
				<Input
					label={`Dawka (${doseUnit})`}
					type='number'
					step='0.01'
					value={form.dose}
					error={errors.dose}
					onChange={e =>
						setForm(p => ({
							...p,
							dose: Number(e.target.value),
						}))
					}
				/>

				{/* TUNELE */}
				<div>
					<Input
						label='Liczba tuneli'
						type='number'
						min={1}
						max={tunnelsInActualSeason}
						value={form.tunnelCount}
						error={errors.tunnelCount}
						onChange={e => {
							const value = e.target.value

							if (value === '') {
								setForm(p => ({ ...p, tunnelCount: '' as any }))
								return
							}

							const num = Number(value)

							if (num < 1) return
							if (num > tunnelsInActualSeason) return

							setForm(p => ({ ...p, tunnelCount: num }))
						}}
					/>

					<p className='mt-1 text-xs text-gray-500'>Maksymalna liczba tuneli: {tunnelsInActualSeason}</p>
				</div>
			</div>

			<div className='mt-6 flex gap-3'>
				<SystemButton onClick={handleSave}>Zapisz</SystemButton>
				<SystemButton variant='outline' onClick={onCancel}>
					Anuluj
				</SystemButton>
			</div>
		</section>
	)
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
	label: string
	error?: string
}

function Input({ label, error, ...props }: InputProps) {
	return (
		<div>
			<label className='block text-sm font-medium text-gray-700'>{label}</label>

			<input
				{...props}
				className={`mt-1 w-full rounded-md border px-3 py-2 text-sm ${error ? 'border-red-500' : ''}`}
			/>

			{error && <p className='mt-1 text-xs text-red-600'>{error}</p>}
		</div>
	)
}

type SelectOption = { label: string; value: string }

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
	label: string
	options: SelectOption[]
	error?: string
}

function Select({ label, options, error, ...props }: SelectProps) {
	return (
		<div>
			<label className='block text-sm font-medium text-gray-700'>{label}</label>

			<select {...props} className={`mt-1 w-full rounded-md border px-3 py-2 text-sm ${error ? 'border-red-500' : ''}`}>
				{options.map(o => (
					<option key={o.value} value={o.value}>
						{o.label}
					</option>
				))}
			</select>

			{error && <p className='mt-1 text-xs text-red-600'>{error}</p>}
		</div>
	)
}
