import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
import { PESTICIDE_TYPE_ICON_MAP } from '../../constans/pesticideTypeIcons'
import type { PesticideType } from '../../types/Pesticide'
import SystemButton from '../ui/SystemButton'

type Props = {
	types: PesticideType[]
	onEdit: (type: PesticideType) => void
	onDelete: (type: PesticideType) => void
	onClose: () => void
}

export default function PesticideTypeManageModal({
	types,
	onEdit,
	onDelete,
	onClose,
}: Props) {
	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
			<div className='w-full max-w-lg rounded-lg bg-white p-6 shadow-lg'>
				<h3 className='text-lg font-semibold'>Zarządzaj typami</h3>
				<p className='mt-1 text-sm text-gray-500'>
					Edytuj lub usuń typy środków ochrony roślin.
				</p>

				<div className='mt-4 space-y-2'>
					{types.map(type => (
						<div
							key={type.id}
							className='flex items-center justify-between rounded-md border border-gray-400 px-3 py-2'
						>
							<div className='flex items-center gap-2'>
								{type.icon && (
									<FontAwesomeIcon icon={PESTICIDE_TYPE_ICON_MAP[type.icon]} />
								)}
								<span className='text-sm font-medium'>{type.name}</span>
							</div>

							<div className='flex items-center gap-2'>
								<button
									onClick={() => onEdit(type)}
									className='text-gray-500 hover:text-yellow-500 hover:cursor-pointer'
								>
									<FontAwesomeIcon icon={faPen} />
								</button>

								<button
									onClick={() => onDelete(type)}
									className='text-gray-500 hover:text-red-500 hover:cursor-pointer'
								>
									<FontAwesomeIcon icon={faTrash} />
								</button>
							</div>
						</div>
					))}
				</div>

				<div className='mt-6 flex justify-end'>
					<SystemButton variant='outline' onClick={onClose}>
						Zamknij
					</SystemButton>
				</div>
			</div>
		</div>
	)
}
