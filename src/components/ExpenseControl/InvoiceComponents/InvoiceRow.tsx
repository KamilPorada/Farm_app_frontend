import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
import type { Invoice } from '../../../types/Invoice'
import { useFormatUtils } from '../../../hooks/useFormatUtils'

type RowItem = Invoice & {
	lp: number
	pointName: string
}

type Props = {
	item: RowItem
	onEdit: (i: Invoice) => void
	onDelete: () => void
	onMarkAsRealized: (i: Invoice) => void
}

export default function InvoiceRow({ item, onEdit, onDelete, onMarkAsRealized }: Props) {
	const { formatDate, formatCurrency } = useFormatUtils()

	const statusLabel = item.status ? 'Zrealizowana' : 'Oczekująca'
	const statusClass = item.status
		? 'bg-green-100 text-green-700'
		: 'bg-yellow-100 text-yellow-800'

	return (
		<>
			{/* ===================== */}
			{/* 📱 MOBILE – KARTA */}
			{/* ===================== */}
			<div className='xl:hidden mx-auto w-full max-w-xs rounded-xl border bg-white p-4 shadow-sm'>
				{/* DATA */}
				<p className='text-sm font-semibold mb-2'>
					{item.lp}. {formatDate(item.invoiceDate)}
				</p>

				{/* NUMER */}
				<div className='mb-2'>
					<p className='text-xs text-gray-500'>Numer faktury</p>
					<p className='text-sm font-medium break-words'>{item.invoiceNumber}</p>
				</div>

				{/* KWOTA */}
				<div className='mb-2'>
					<p className='text-xs text-gray-500'>Kwota</p>
					<p className='text-sm font-semibold'>{formatCurrency(item.amount)}</p>
				</div>

				{/* PUNKT */}
				<div className='mb-3'>
					<p className='text-xs text-gray-500'>Punkt sprzedaży</p>
					<p className='text-sm break-words'>{item.pointName}</p>
				</div>

				{/* STATUS */}
				<div className='mb-3'>
					<span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}>
						{statusLabel}
					</span>
				</div>

				{/* AKCJE */}
				<div className='flex justify-end gap-4 text-gray-500'>
					{!item.status && (
						<button
							onClick={() => onMarkAsRealized(item)}
							className='hover:text-green-600'
							title='Oznacz jako zrealizowaną'>
							<FontAwesomeIcon icon={faCheckCircle} />
						</button>
					)}
					<button onClick={() => onEdit(item)} className='hover:text-yellow-500'>
						<FontAwesomeIcon icon={faPen} />
					</button>
					<button onClick={onDelete} className='hover:text-red-500'>
						<FontAwesomeIcon icon={faTrash} />
					</button>
				</div>
			</div>

			{/* ===================== */}
			{/* 🖥 DESKTOP – TABELA */}
			{/* ===================== */}
			<div
				className='
					hidden xl:grid
					grid-cols-[0.5fr_2fr_2fr_1.5fr_4fr_2fr_2fr]
					w-full
					text-sm
					text-center
					items-center
					py-2
					border-b
					border-gray-300
					hover:bg-gray-50
				'>
				<div>{item.lp}</div>
				<div>{formatDate(item.invoiceDate)}</div>
				<div>{item.invoiceNumber}</div>
				<div className='font-medium'>{formatCurrency(item.amount)}</div>
				<div className='truncate px-2'>{item.pointName}</div>

				<div>
					<span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}>
						{statusLabel}
					</span>
				</div>

				<div className='flex justify-center gap-3 text-gray-500'>
					{!item.status && (
						<button
							onClick={() => onMarkAsRealized(item)}
							className='hover:text-green-600 cursor-pointer'
							title='Oznacz jako zrealizowaną'>
							<FontAwesomeIcon icon={faCheckCircle} />
						</button>
					)}
					<button onClick={() => onEdit(item)} className='hover:text-yellow-500 cursor-pointer'>
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
