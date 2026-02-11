type Props = {
	onClose: () => void
}

export default function NoAvailableTunnelsModal({ onClose }: Props) {
	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
			<div className='w-full max-w-md rounded-lg bg-white p-6 shadow-lg'>
				<h3 className='mb-2 text-lg font-semibold'>
					Brak wolnych tuneli
				</h3>

				<p className='text-sm text-gray-600'>
					Wszystkie tunele w tym sezonie zostały już przypisane do odmian.
					Aby dodać nową odmianę, musisz najpierw zmniejszyć liczbę tuneli
					w jednej z istniejących odmian.
				</p>

				<div className='mt-6 flex justify-end'>
					<button
						onClick={onClose}
						className='cursor-pointer rounded-md bg-mainColor px-4 py-2 text-sm text-white hover:opacity-90'
					>
						Ok
					</button>
				</div>
			</div>
		</div>
	)
}
