type Props = {
	value: string
	onChange: (v: string) => void
	onSubmit: () => void
	onClose: () => void
}

export default function AddIncreaseTypeModal({ value, onChange, onSubmit, onClose }: Props) {
	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
			<div className='w-full max-w-lg rounded-lg bg-white p-6 shadow-lg'>
				<h3 className='mb-2 text-lg font-semibold'>Nowa kategoria przychodu</h3>
				<p className='mb-4 text-sm text-gray-500'>Dodaj nową kategorię przychodów dla bieżącego sezonu.</p>

				<input
					className='w-full rounded-md border px-3 py-2 text-sm'
					placeholder='Np. Sprzedaż papryki'
					value={value}
					onChange={e => onChange(e.target.value)}
				/>

				<div className='mt-6 flex justify-end gap-3'>
					<button onClick={onClose} className='rounded-md border px-4 py-2 text-sm cursor-pointer'>
						Anuluj
					</button>
					<button onClick={onSubmit} className='rounded-md bg-mainColor px-4 py-2 text-sm text-white cursor-pointer'>
						Dodaj
					</button>
				</div>
			</div>
		</div>
	)
}
