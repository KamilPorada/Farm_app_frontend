import { useState } from 'react'

type StageType = 'PRICKING' | 'PLANTING' | 'HARVEST_START' | 'HARVEST_END'

type Props = {
	stage: StageType
	year: number
	onClose: () => void
	onSave: (data: { startDate: string; endDate?: string }) => void
}

export default function AddProductionStageModal({
	stage,
	year,
	onClose,
	onSave,
}: Props) {
	const [startDate, setStartDate] = useState('')
	const [endDate, setEndDate] = useState('')
	const [error, setError] = useState<string | null>(null)

	const isRange = stage === 'PRICKING' || stage === 'PLANTING'

	const getTitle = () => {
		switch (stage) {
			case 'PRICKING':
				return 'Dodaj etap – Pikowanie papryki'
			case 'PLANTING':
				return 'Dodaj etap – Sadzenie papryki'
			case 'HARVEST_START':
				return 'Dodaj etap – Początek zbiorów'
			case 'HARVEST_END':
				return 'Dodaj etap – Koniec zbiorów'
		}
	}

	const isValidYear = (date: string) => {
		return new Date(date).getFullYear() === year
	}

	const handleSubmit = () => {
		setError(null)

		if (!startDate) {
			setError('Wybierz datę')
			return
		}

		// 🔴 WALIDACJA ROKU
		if (!isValidYear(startDate)) {
			setError(`Data musi należeć do roku ${year}`)
			return
		}

		// 🔴 WALIDACJA ZAKRESU
		if (isRange) {
			if (!endDate) {
				setError('Uzupełnij datę końcową')
				return
			}

			if (!isValidYear(endDate)) {
				setError(`Data musi należeć do roku ${year}`)
				return
			}

			if (new Date(endDate) < new Date(startDate)) {
				setError('Data końcowa nie może być wcześniejsza niż początkowa')
				return
			}
		}

		onSave({
			startDate,
			endDate: isRange ? endDate : undefined,
		})
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
			<div className='w-full max-w-md rounded-lg bg-white p-6 shadow-lg'>
				<h3 className='mb-4 text-lg font-semibold'>{getTitle()}</h3>

				<p className='mt-1 text-sm text-gray-500'>
					Uzupełnij daty dla wybranego etapu produkcji.
				</p>

				<div className='mt-4 space-y-4'>
					<div>
						<label className='text-sm font-medium'>
							{isRange ? 'Data od' : 'Data'}
						</label>
						<input
							type='date'
							value={startDate}
							onChange={e => setStartDate(e.target.value)}
							className='mt-1 w-full rounded-md border px-3 py-2 text-sm'
						/>
					</div>

					{isRange && (
						<div>
							<label className='text-sm font-medium'>Data do</label>
							<input
								type='date'
								value={endDate}
								onChange={e => setEndDate(e.target.value)}
								className='mt-1 w-full rounded-md border px-3 py-2 text-sm'
							/>
						</div>
					)}

					{error && (
						<p className='text-sm text-red-500'>{error}</p>
					)}
				</div>

				<div className='mt-6 flex justify-end gap-3'>
					<button
						onClick={onClose}
						className='rounded-md border px-4 py-2 text-sm hover:cursor-pointer'>
						Anuluj
					</button>

					<button
						onClick={handleSubmit}
						className='rounded-md bg-mainColor px-4 py-2 text-sm text-white hover:cursor-pointer'>
						Zapisz
					</button>
				</div>
			</div>
		</div>
	)
}
