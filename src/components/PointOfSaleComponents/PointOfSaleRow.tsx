import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
import type { PointOfSale } from '../../types/PointOfSale'

type Props = {
	point: PointOfSale
	onView: (p: PointOfSale) => void
	onEdit: (p: PointOfSale) => void
	onDelete: (p: PointOfSale) => void
}

export default function PointOfSaleRow({ point, onView, onEdit, onDelete }: Props) {
	return (
		<div
			className='
        grid grid-cols-12 gap-3
        px-3 py-2
        items-center
        border-b border-gray-300
        text-sm
        hover:bg-gray-50
        transition
      '>
			{/* NAZWA */}
			<div className='col-span-4'>
				<p className='font-medium text-gray-900 leading-tight'>{point.name}</p>
				<p className='text-xs text-gray-400'>{point.type}</p>
			</div>

			{/* ADRES */}
			<div className='col-span-4 text-gray-700 truncate'>{point.address}</div>

			{/* KONTAKT */}
			<div className='col-span-3 text-xs text-gray-600 leading-tight'>
				<p>{point.phone}</p>
				<p className='truncate'>{point.email}</p>
			</div>

			{/* AKCJE */}
			<div className='col-span-1 flex justify-start gap-3'>
				<button
					onClick={() => onView(point)}
					className='
			flex h-9 w-9 items-center justify-center
			rounded-md
			text-gray-500
			transition
			hover:text-mainColor hover:cursor-pointer
		'>
					<FontAwesomeIcon icon={faEye} />
				</button>

				<button
					onClick={() => onEdit(point)}
					className='
			flex h-9 w-9 items-center justify-center
			rounded-md
			text-gray-500
			transition
			hover:text-yellow-500 hover:cursor-pointer
		'>
					<FontAwesomeIcon icon={faPen} />
				</button>

				<button
					onClick={() => onDelete(point)}
					className='
			flex h-9 w-9 items-center justify-center
			rounded-md
			text-gray-500
			transition
			hover:text-red-600 hover:cursor-pointer
		'>
					<FontAwesomeIcon icon={faTrash} />
				</button>
			</div>
		</div>
	)
}
