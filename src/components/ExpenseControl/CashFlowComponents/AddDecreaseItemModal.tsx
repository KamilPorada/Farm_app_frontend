type Props = {
	title: string
	amount: string
	onTitleChange: (v: string) => void
	onAmountChange: (v: string) => void
	onSubmit: () => void
	onClose: () => void
}

export default function AddDecreaseItemModal({
	title,
	amount,
	onTitleChange,
	onAmountChange,
	onSubmit,
	onClose,
}: Props) {
	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
			<div className='w-full max-w-lg rounded-lg bg-white p-6 shadow-lg'>
				<h3 className='mb-2 text-lg font-semibold'>Nowy koszt</h3>
				<p className='mb-4 text-sm text-gray-500'>Dodaj nową pozycję kosztów do wybranej kategorii.</p>

				<div className='space-y-3'>
					<input
						className='w-full rounded-md border px-3 py-2 text-sm'
						placeholder='Nazwa'
						value={title}
						onChange={e => onTitleChange(e.target.value)}
					/>
					<input
						type='number'
						className='w-full rounded-md border px-3 py-2 text-sm'
						placeholder='Kwota'
						value={amount}
						onChange={e => {
							const v = e.target.value

							if (v === '') {
								onAmountChange('')
								return
							}

							const num = Number(v)

							onAmountChange(num < 0 ? '' : v)
						}}
					/>
				</div>

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
