import { useEffect, useMemo, useState } from 'react'
import SystemButton from '../ui/SystemButton'
import type { Harvest } from '../../types/Harvest'
import type { VarietySeason } from '../../types/VarietySeason'

type Props = {
	allHarvests: Harvest[]
	varieties: VarietySeason[]
	year: number
	onSave: (payload: Omit<Harvest, 'id'>[]) => void
	onCancel: () => void
}

export default function HarvestDayForm({ allHarvests, varieties, year, onSave, onCancel }: Props) {
	/* =======================
	   DATA
	======================= */
	const today = new Date()
	const initialDate = `${year}-${String(today.getMonth() + 1).padStart(
		2,
		'0',
	)}-${String(today.getDate()).padStart(2, '0')}`

	const [date, setDate] = useState(initialDate)

	/* =======================
	   ODMIANY JUŻ ZAPISANE
	======================= */
	const existingVarietyIds = useMemo(() => {
		return allHarvests.filter(h => h.harvestDate === date).map(h => h.varietySeasonId)
	}, [allHarvests, date])

	const varietiesToRender = useMemo(() => {
		return varieties.filter(v => !existingVarietyIds.includes(v.id))
	}, [varieties, existingVarietyIds])

	/* =======================
	   STATE
	======================= */
	const [boxes, setBoxes] = useState<Record<number, number | ''>>({})
	const [errors, setErrors] = useState<Record<number, string>>({})

	useEffect(() => {
		const map: Record<number, number | ''> = {}

		varietiesToRender.forEach(v => {
			map[v.id] = ''
		})

		setBoxes(map)
		setErrors({})
	}, [varietiesToRender])

	/* =======================
	   WALIDACJA
	======================= */
	function validate(): boolean {
		const newErrors: Record<number, string> = {}

		Object.entries(boxes).forEach(([key, value]) => {
			if (value !== '' && Number(value) < 0) {
				newErrors[Number(key)] = 'Wartość nie może być mniejsza od zera'
			}
		})

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	/* =======================
	   SAVE
	======================= */
	function handleSave() {
		if (!validate()) return

		const payload: Omit<Harvest, 'id'>[] = []

		Object.entries(boxes).forEach(([varietyId, value]) => {
			if (value === '' || Number(value) === 0) return

			payload.push({
				varietySeasonId: Number(varietyId),
				harvestDate: date,
				boxCount: Number(value),
			})
		})

		onSave(payload)
	}

	/* =======================
	   RENDER
	======================= */
	return (
		<section className='mt-6 border-t pt-6'>
			<h2 className='text-xl font-semibold mb-6'>Rejestr dzienny zbiorów</h2>

			{/* DATA */}
			<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
				<div>
					<label className='block text-sm text-gray-700 mb-1'>Data</label>

					<input
						type='date'
						value={date}
						onChange={e => setDate(e.target.value)}
						className='w-full rounded-md border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-mainColor'
					/>
				</div>
			</div>

			{/* KOMUNIKAT */}
			{varietiesToRender.length === 0 && (
				<div className='mt-8 text-sm text-gray-600'>Wszystkie odmiany mają już zapisany zbiór dla wybranego dnia.</div>
			)}

			{/* ODMIANY */}
			{varietiesToRender.length > 0 && (
				<div className='mt-8 grid grid-cols-1 md:grid-cols-2 gap-6'>
					{varietiesToRender.map(v => (
						<div key={v.id}>
							<label className='block text-sm text-gray-700 mb-1'>
								{v.name} ({v.color})
							</label>

							<input
								type='number'
								step='0.1'
								min='0'
								value={boxes[v.id] ?? ''}
								onChange={e =>
									setBoxes(prev => ({
										...prev,
										[v.id]: e.target.value === '' ? '' : Number(e.target.value),
									}))
								}
								className={`w-full rounded-md border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-mainColor
								${errors[v.id] ? 'border-red-500' : ''}`}
							/>

							{errors[v.id] && <p className='mt-1 text-xs text-red-600'>{errors[v.id]}</p>}
						</div>
					))}
				</div>
			)}

			{/* BUTTONS */}
			<div className='mt-8 flex gap-3'>
				{varietiesToRender.length != 0 && <SystemButton onClick={handleSave}>Zapisz</SystemButton>}

				<SystemButton variant='outline' onClick={onCancel}>
					Anuluj
				</SystemButton>
			</div>
		</section>
	)
}
