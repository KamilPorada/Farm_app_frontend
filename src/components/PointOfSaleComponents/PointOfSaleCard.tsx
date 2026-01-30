import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
import type { PointOfSale } from '../../types/PointOfSale'

type Props = {
  point: PointOfSale
  onView: (p: PointOfSale) => void
  onEdit: (p: PointOfSale) => void
  onDelete: (p: PointOfSale) => void
}

export default function PointOfSaleCard({ point, onView, onEdit, onDelete }: Props) {
  return (
    <div className="flex items-center justify-between rounded-md border p-4">
      <div>
        <p className="font-medium">{point.name}</p>
        <p className="text-sm text-gray-500">{point.type} · {point.address}</p>
      </div>

      <div className="flex gap-4 text-gray-600">
        <button onClick={() => onView(point)}>
          <FontAwesomeIcon icon={faEye} />
        </button>
        <button onClick={() => onEdit(point)}>
          <FontAwesomeIcon icon={faPen} />
        </button>
        <button onClick={() => onDelete(point)} className="text-red-600">
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    </div>
  )
}
