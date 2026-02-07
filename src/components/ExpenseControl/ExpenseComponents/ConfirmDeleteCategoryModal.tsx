import SystemButton from '../../ui/SystemButton'

type Props = {
	categoryName: string
	onConfirm: () => void
	onCancel: () => void
}

export default function ConfirmDeleteCategoryModal({
	categoryName,
	onConfirm,
	onCancel,
}: Props) {
	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
			<div className='w-full max-w-md rounded-lg bg-white p-6 shadow-lg'>
				<h3 className='text-lg font-semibold'>Usuń kategorię</h3>
				<p className='mt-2 text-sm text-gray-600'>
					Czy na pewno chcesz usunąć kategorię
					<span className='font-medium'> „{categoryName}”</span>?
				</p>

				<div className='mt-6 flex justify-end gap-3'>
					<SystemButton variant='outline' onClick={onCancel}>
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
