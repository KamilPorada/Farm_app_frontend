type Props = {
	title?: string
	description: string
	onClose: () => void
}

export default function CannotDeleteTypeModal({
	title = 'Nie można usunąć kategorii',
	description,
	onClose,
}: Props) {
	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
			<div className='w-full max-w-md rounded-lg bg-white p-6 shadow-lg'>
				<h3 className='mb-2 text-lg font-semibold'>{title}</h3>

				<p className='text-sm text-gray-600'>{description}</p>

				<div className='mt-6 flex justify-end'>
					<button
						onClick={onClose}
						className='rounded-md bg-mainColor px-4 py-2 text-sm text-white hover:opacity-90 cursor-pointer'
					>
						OK
					</button>
				</div>
			</div>
		</div>
	)
}
