import { useState } from 'react'
import type { CultivationCalendar } from '../../types/CultivationCalendar'
import SystemButton from '../ui/SystemButton'

type Props = {
	item: CultivationCalendar
	year: number
	onClose: () => void
	onSave: (updated: CultivationCalendar) => void
}

const isSameYear = (date: string, year: number) => new Date(date).getFullYear() === year

export default function ManageProductionStagesModal({ item, year, onClose, onSave }: Props) {
	const [form, setForm] = useState({ ...item })
	const [error, setError] = useState<string | null>(null)

	const validate = () => {
		setError(null)

		const allDates = [
			form.prickingStartDate,
			form.prickingEndDate,
			form.plantingStartDate,
			form.plantingEndDate,
			form.harvestStartDate,
			form.harvestEndDate,
		].filter(Boolean) as string[]

		for (const d of allDates) {
			if (!isSameYear(d, year)) {
				setError(`Wszystkie daty muszą należeć do roku ${year}`)
				return false
			}
		}

		if (
			form.prickingStartDate &&
			form.prickingEndDate &&
			new Date(form.prickingEndDate) < new Date(form.prickingStartDate)
		) {
			setError('Pikowanie – data końcowa nie może być wcześniejsza')
			return false
		}

		if (
			form.plantingStartDate &&
			form.plantingEndDate &&
			new Date(form.plantingEndDate) < new Date(form.plantingStartDate)
		) {
			setError('Sadzenie – data końcowa nie może być wcześniejsza')
			return false
		}

		if (
			form.prickingEndDate &&
			form.plantingStartDate &&
			new Date(form.plantingStartDate) <= new Date(form.prickingEndDate)
		) {
			setError('Sadzenie musi rozpocząć się po zakończeniu pikowania')
			return false
		}

		if (
			form.plantingEndDate &&
			form.harvestStartDate &&
			new Date(form.harvestStartDate) <= new Date(form.plantingEndDate)
		) {
			setError('Pierwsze zbiory muszą rozpocząć się po sadzeniu')
			return false
		}

		if (
			form.harvestStartDate &&
			form.harvestEndDate &&
			new Date(form.harvestEndDate) <= new Date(form.harvestStartDate)
		) {
			setError('Ostatnie zbiory muszą być po pierwszych')
			return false
		}

		return true
	}

	const handleSubmit = () => {
		if (!validate()) return
		onSave(form)
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
			<div className='w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl'>
				<h3 className='text-xl font-semibold text-gray-800'>Zarządzaj etapami produkcji</h3>

				<p className='mt-1 text-sm text-gray-500'>Możesz edytować wyłącznie zdefiniowane etapy sezonu.</p>

				<div className='mt-4 space-y-8'>
					{/* PIKOWANIE */}
					{item.prickingStartDate && (
						<div>
							<p className='text-sm font-semibold text-gray-700'>Pikowanie</p>

							<div className='grid grid-cols-2 gap-4 mt-3'>
								<input
									type='date'
									value={form.prickingStartDate ?? ''}
									onChange={e =>
										setForm(prev => ({
											...prev,
											prickingStartDate: e.target.value,
										}))
									}
									className='mt-1 w-full rounded-md border px-3 py-2 text-sm'
								/>

								<input
									type='date'
									value={form.prickingEndDate ?? ''}
									onChange={e =>
										setForm(prev => ({
											...prev,
											prickingEndDate: e.target.value,
										}))
									}
									className='mt-1 w-full rounded-md border px-3 py-2 text-sm'
								/>
							</div>
						</div>
					)}

					{/* SADZENIE */}
					{item.plantingStartDate && (
						<div>
							<p className='text-sm font-semibold text-gray-700'>Sadzenie do tuneli</p>

							<div className='grid grid-cols-2 gap-4 mt-3'>
								<input
									type='date'
									value={form.plantingStartDate ?? ''}
									onChange={e =>
										setForm(prev => ({
											...prev,
											plantingStartDate: e.target.value,
										}))
									}
									className='mt-1 w-full rounded-md border px-3 py-2 text-sm'
								/>

								<input
									type='date'
									value={form.plantingEndDate ?? ''}
									onChange={e =>
										setForm(prev => ({
											...prev,
											plantingEndDate: e.target.value,
										}))
									}
									className='mt-1 w-full rounded-md border px-3 py-2 text-sm'
								/>
							</div>
						</div>
					)}

					{/* PIERWSZE ZBIORY */}
					{item.harvestStartDate && (
						<div>
							<p className='text-sm font-semibold text-gray-700'>Pierwsze zbiory</p>

							<input
								type='date'
								value={form.harvestStartDate ?? ''}
								onChange={e =>
									setForm(prev => ({
										...prev,
										harvestStartDate: e.target.value,
									}))
								}
								className='mt-1 w-full rounded-md border px-3 py-2 text-sm'
							/>
						</div>
					)}

					{/* OSTATNIE ZBIORY */}
					{item.harvestEndDate && (
						<div>
							<p className='text-sm font-semibold text-gray-700'>Ostatnie zbiory</p>

							<input
								type='date'
								value={form.harvestEndDate ?? ''}
								onChange={e =>
									setForm(prev => ({
										...prev,
										harvestEndDate: e.target.value,
									}))
								}
								className='mt-1 w-full rounded-md border px-3 py-2 text-sm'
							/>
						</div>
					)}
				</div>

				{error && <div className='mt-6 rounded-md py-3 text-sm text-red-600'>{error}!</div>}

				<div className='mt-10 flex justify-end gap-3'>
					<SystemButton variant={'outline'} onClick={onClose}>
						Anuluj
					</SystemButton>

					<SystemButton onClick={handleSubmit}>Zapisz zmiany</SystemButton>
				</div>
			</div>
		</div>
	)
}
