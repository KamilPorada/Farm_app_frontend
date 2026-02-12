type Props = {
	onClose: () => void
}

export default function NoVarietiesForYearModal({ onClose }: Props) {
	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
			<div className='w-full max-w-md rounded-lg bg-white p-6 shadow-lg'>
				<h3 className='mb-2 text-lg font-semibold'>
					Brak odmian w wybranym roku
				</h3>

				<p className='text-sm text-gray-600'>
					W wybranym sezonie nie dodano żadnych odmian.
					Aby móc rejestrować zbiory, najpierw dodaj odmiany
					w sekcji Odmiany w module Konrola zbiorów.
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
