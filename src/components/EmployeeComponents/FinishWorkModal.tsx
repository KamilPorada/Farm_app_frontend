import { useState } from 'react'

type Props = {
	onConfirm: (date: string) => void
	onClose: () => void
}

export default function FinishWorkModal({ onConfirm, onClose }: Props) {
	const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
			<div className='bg-white rounded-xl shadow-lg w-full max-w-md p-6'>
				<h3 className='text-lg font-semibold mb-4'>Zakończyć pracę pracownika?</h3>

				<label className='text-sm font-medium'>Data zakończenia pracy</label>

				<input
					type='date'
					value={date}
					onChange={e => setDate(e.target.value)}
					className='mt-1 w-full border rounded-md px-3 py-2 text-sm'
				/>

				<div className='flex justify-end gap-3 mt-6'>
					<button onClick={onClose} className='border px-4 py-2 rounded-md text-sm cursor-pointer'>
						Anuluj
					</button>

					<button onClick={() => onConfirm(date)} className='bg-mainColor text-white px-4 py-2 rounded-md text-sm cursor-pointer'>
						Zakończ pracę
					</button>
				</div>
			</div>
		</div>
	)
}
