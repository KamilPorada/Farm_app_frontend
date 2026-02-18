import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
import type { Employee } from '../../types/Employee'
import { useFormatUtils } from '../../hooks/useFormatUtils'

type RowItem = Employee & {
	lp: number
}

type Props = {
	item: RowItem
	onEdit: () => void
	onDelete: () => void
	onWorkTime: () => void
}

export default function EmployeeRow({ item, onEdit, onDelete, onWorkTime }: Props) {
	const fullName = `${item.firstName} ${item.lastName}`
	const { getCurrencySymbol } = useFormatUtils()
	const isActive = !item.finishDate

	const statusLabel = isActive ? 'Pracuje' : 'Nie pracuje'
	const statusClass = isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'

	return (
		<>
			{/* ===================== */}
			{/* 📱 MOBILE CARD */}
			{/* ===================== */}
			<div className='xl:hidden mx-auto w-full max-w-xs rounded-xl border bg-white p-4 shadow-sm'>
				<p className='text-sm font-semibold mb-2'>
					{item.lp}. {fullName}
				</p>

				<div className='mb-2'>
					<p className='text-xs text-gray-500'>Wiek</p>
					<p className='text-sm'>{item.age ?? '—'}</p>
				</div>

				<div className='mb-2'>
					<p className='text-xs text-gray-500'>Narodowość</p>
					<p className='text-sm'>{item.nationality || '—'}</p>
				</div>

				<div className='mb-3'>
					<p className='text-xs text-gray-500'>Wynagrodzenie</p>
					<p className='text-sm font-semibold'>
						{item.salary} {getCurrencySymbol()}/h
					</p>
				</div>

				<div className='flex justify-end mb-2'>
					<span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}>
						{statusLabel}
					</span>
				</div>

				{/* ACTIONS */}
				<div className='flex justify-end gap-4 text-gray-500'>
					<button onClick={onWorkTime} className='hover:text-mainColor' title='Godziny pracy'>
						<FontAwesomeIcon icon={faClock} />
					</button>

					<button onClick={onEdit} className='hover:text-yellow-500'>
						<FontAwesomeIcon icon={faPen} />
					</button>

					<button onClick={onDelete} className='hover:text-red-500'>
						<FontAwesomeIcon icon={faTrash} />
					</button>
				</div>
			</div>

			{/* ===================== */}
			{/* 🖥 DESKTOP ROW */}
			{/* ===================== */}
			<div
				className='
					hidden xl:grid
					grid-cols-[0.5fr_3fr_1fr_2fr_2fr_2fr_2fr]
					text-sm
					text-center
					items-center
					py-2
					border-b
					border-gray-300
					hover:bg-gray-50
				'>
				<div>{item.lp}</div>
				<div className='font-medium'>{fullName}</div>
				<div>{item.age ?? '—'}</div>
				<div>{item.nationality || '—'}</div>
				<div className='font-semibold'>
					{item.salary} {getCurrencySymbol()}/h
				</div>
				<div >
					<span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}>
						{statusLabel}
					</span>
				</div>

				<div className='flex justify-center gap-3 text-gray-500'>
					<button onClick={onWorkTime} className='hover:text-mainColor cursor-pointer' title='Godziny pracy'>
						<FontAwesomeIcon icon={faClock} />
					</button>

					<button onClick={onEdit} className='hover:text-yellow-500 cursor-pointer'>
						<FontAwesomeIcon icon={faPen} />
					</button>

					<button onClick={onDelete} className='hover:text-red-500 cursor-pointer'>
						<FontAwesomeIcon icon={faTrash} />
					</button>
				</div>
			</div>
		</>
	)
}
