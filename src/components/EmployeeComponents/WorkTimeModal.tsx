import { useState } from 'react'
import SystemButton from '../ui/SystemButton'
import { useFormatUtils } from '../../hooks/useFormatUtils'

type Props = {
	onSave: (hours: number, paid: number | null, date: string) => void
	onClose: () => void
}

export default function WorkTimeModal({ onSave, onClose }: Props) {
	const { getCurrencySymbol, toPLN } = useFormatUtils()
	const [hours, setHours] = useState('')
	const [paid, setPaid] = useState('')
	const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
	const [error, setError] = useState<string | null>(null)

	function validate(): boolean {
		const h = Number(hours)

		if (!hours) {
			setError('Podaj liczbę godzin pracy')
			return false
		}

		if (isNaN(h) || h <= 0) {
			setError('Godziny muszą być większe niż 0')
			return false
		}

		if (h > 24) {
			setError('Liczba godzin nie może przekraczać 24')
			return false
		}

		setError(null)
		return true
	}

	function handleSave() {
		if (!validate()) return

		onSave(Number(hours), getCurrencySymbol() === 'EUR' ? toPLN(Number(paid)) : Number(paid), date)
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
			<div className='w-full max-w-md rounded-lg bg-white p-6 shadow-lg'>
				<h3 className='text-lg font-semibold mb-4'>Dodaj wpis czasu pracy</h3>

				<div className='grid gap-4'>
					<div>
						<label className='text-sm font-medium'>Data</label>
						<input
							type='date'
							value={date}
							onChange={e => setDate(e.target.value)}
							className='mt-1 w-full rounded-md border px-3 py-2 text-sm'
						/>
					</div>

					<div>
						<label className='text-sm font-medium'>Godziny pracy (h)</label>
						<input
							type='number'
							value={hours}
							onChange={e => setHours(e.target.value)}
							className={`mt-1 w-full rounded-md border px-3 py-2 text-sm ${error ? 'border-red-500' : ''}`}
						/>
						{error && <p className='text-xs text-red-600 mt-1'>{error}</p>}
					</div>

					<div>
						<label className='text-sm font-medium'>Wypłata ({getCurrencySymbol()})</label>
						<input
							type='number'
							value={paid}
							onChange={e => setPaid(e.target.value)}
							className='mt-1 w-full rounded-md border px-3 py-2 text-sm'
						/>
					</div>
				</div>

				<div className='mt-6 flex justify-end gap-3'>
					<SystemButton variant='outline' onClick={onClose}>
						Anuluj
					</SystemButton>

					<SystemButton onClick={handleSave}>Zapisz</SystemButton>
				</div>
			</div>
		</div>
	)
}
