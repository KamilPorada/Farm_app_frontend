import { useEffect, useMemo, useState } from 'react'
import SystemButton from '../ui/SystemButton'
import type { Treatment } from '../../types/Treatment'
import type { Pesticide, PesticideType } from '../../types/Pesticide'

type Props = {
	initial: Treatment | null
	types: PesticideType[]
	pesticides: Pesticide[]
	tunnelsInActualSeason: number
	year: number
	onTypeChange: (typeId: number | null) => void
	onSave: (t: Treatment) => void
	onCancel: () => void
}

type Errors = {
	treatmentDate?: string
	treatmentTime?: string
	pesticideId?: string
	pesticideDose?: string
	liquidVolume?: string
	tunnelCount?: string
}

export default function TreatmentForm({
	initial,
	types,
	pesticides,
	onTypeChange,
	onSave,
	onCancel,
	tunnelsInActualSeason,
	year,
}: Props) {
	const now = new Date()

	const [selectedType, setSelectedType] = useState<number | null>(null)
	const [errors, setErrors] = useState<Errors>({})

	const [form, setForm] = useState<Treatment>({
		id: initial?.id,
		farmerId: initial?.farmerId ?? 0,
		pesticideId: initial?.pesticideId ?? 0,
		treatmentDate: initial?.treatmentDate ?? now.toISOString().split('T')[0],
		treatmentTime: initial?.treatmentTime ?? now.toTimeString().slice(0, 5),
		pesticideDose: initial?.pesticideDose ?? ('' as any),
		liquidVolume: initial?.liquidVolume ?? ('' as any),
		tunnelCount: initial?.tunnelCount ?? null,
	})

	const selectedPesticide = useMemo(
		() => pesticides.find(p => p.id === form.pesticideId),
		[form.pesticideId, pesticides],
	)

	const doseLabel = selectedPesticide?.isLiquid ? 'Dawka (ml/100l wody)' : 'Dawka (g/100l wody)'

	function handleTypeChange(typeId: number | null) {
		setSelectedType(typeId)
		onTypeChange(typeId)
		setForm(f => ({ ...f, pesticideId: 0 }))
	}

	function validate(): boolean {
		const e: Errors = {}
        const formDate = new Date(form.treatmentDate)

        if(formDate.getFullYear() != year){
            e.treatmentDate = `Data powinna należeć do sezonu ${year}`
        }

		if (!form.treatmentDate) {
			e.treatmentDate = 'Wybierz datę'
		}

		if (!form.treatmentTime) {
			e.treatmentTime = 'Wybierz godzinę'
		}

		if (!form.pesticideId) {
			e.pesticideId = 'Wybierz pestycyd'
		}

		if (!form.pesticideDose || Number(form.pesticideDose) <= 0) {
			e.pesticideDose = 'Podaj dawkę większą niż 0'
		}

		if (!form.liquidVolume || Number(form.liquidVolume) <= 0) {
			e.liquidVolume = 'Podaj ilość wody'
		}

		if (form.tunnelCount != null) {
			if (form.tunnelCount < 0) {
				e.tunnelCount = 'Liczba tuneli nie może być ujemna'
			}

			if (form.tunnelCount > tunnelsInActualSeason) {
				e.tunnelCount = `Maksymalnie ${tunnelsInActualSeason} tuneli`
			}
		}

		setErrors(e)
		return Object.keys(e).length === 0
	}

	function handleSave() {
		if (!validate()) return

		onSave({
			...form,
			pesticideDose: Number(form.pesticideDose),
			liquidVolume: Number(form.liquidVolume),
		})
	}

	useEffect(() => {
		if (!form.pesticideId && pesticides.length > 0) {
			setForm(prev => ({
				...prev,
				pesticideId: pesticides[0].id,
			}))
		}
	}, [pesticides])

	return (
		<section className='mt-6 border-t pt-4'>
			<h2 className='text-xl font-semibold'>{initial ? 'Edytuj zabieg' : 'Dodaj zabieg'}</h2>

			<div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-2'>
				<Input
					label='Data zabiegu'
					type='date'
					value={form.treatmentDate}
					error={errors.treatmentDate}
					onChange={e =>
						setForm(p => ({
							...p,
							treatmentDate: e.target.value,
						}))
					}
				/>

				<Input
					label='Godzina zabiegu'
					type='time'
					value={form.treatmentTime}
					error={errors.treatmentTime}
					onChange={e =>
						setForm(p => ({
							...p,
							treatmentTime: e.target.value,
						}))
					}
				/>

				<Select
					label='Typ pestycydu'
					value={selectedType ?? ''}
					onChange={e => handleTypeChange(e.target.value ? Number(e.target.value) : null)}
					options={[
						{ label: 'Wszystkie', value: '' },
						...types.map(t => ({
							label: t.name,
							value: String(t.id),
						})),
					]}
				/>

				<Select
					label='Pestycyd'
					value={form.pesticideId}
					error={errors.pesticideId}
					onChange={e =>
						setForm(p => ({
							...p,
							pesticideId: Number(e.target.value),
						}))
					}
					options={pesticides.map(p => ({
						label: p.name,
						value: String(p.id),
					}))}
				/>

				<Input
					label={doseLabel}
					type='number'
					value={form.pesticideDose}
					error={errors.pesticideDose}
					onChange={e =>
						setForm(p => ({
							...p,
							pesticideDose: Number(e.target.value),
						}))
					}
				/>

				<Input
					label='Ilość wody (l)'
					type='number'
					value={form.liquidVolume}
					error={errors.liquidVolume}
					onChange={e =>
						setForm(p => ({
							...p,
							liquidVolume: Number(e.target.value),
						}))
					}
				/>

				<div>
					<Input
						label={`Liczba tuneli`}
						type='number'
						min={0}
						max={tunnelsInActualSeason}
						value={form.tunnelCount ?? ''}
						error={errors.tunnelCount}
						onChange={e => {
							const value = e.target.value

							if (value === '') {
								setForm(p => ({ ...p, tunnelCount: null }))
								return
							}

							const num = Number(value)

							if (num < 0) return
							if (num > tunnelsInActualSeason) return

							setForm(p => ({ ...p, tunnelCount: num }))
						}}
					/>

					<p className='mt-1 text-xs text-gray-500'>Maksymalna liczba tuneli w sezonie: {tunnelsInActualSeason}</p>
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
