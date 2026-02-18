import SystemButton from './SystemButton'

type Props = {
	title?: string
	description?: string
	onConfirm: () => void
	onCancel: () => void
}

export default function ConfirmDeleteModal({
	title = 'Potwierdź usunięcie',
	description = 'Czy na pewno chcesz usunąć ten element? Tej operacji nie można cofnąć.',
	onConfirm,
	onCancel,
}: Props) {
	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3'>
			<div className='w-full max-w-md rounded-lg bg-white p-5 shadow-lg'>
				<h3 className='text-lg font-semibold text-gray-900'>{title}</h3>

				<p className='mt-2 text-sm text-gray-600'>{description}</p>

				<div className='mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3'>
					<SystemButton variant='outline' onClick={onCancel} className='w-full sm:w-auto'>
						Anuluj
					</SystemButton>

					<SystemButton onClick={onConfirm}>
						Usuń
					</SystemButton>
				</div>
			</div>
		</div>
	)
}
