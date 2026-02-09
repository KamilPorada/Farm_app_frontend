import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
import type { TradeOfPepper } from '../../types/TradeOfPepper'
import { useFormatUtils } from '../../hooks/useFormatUtils'

type RowItem = TradeOfPepper & {
	lp: number
	pointName: string
	total: number // zawsze PLN
}

type Props = {
	item: RowItem
	onView: (t: TradeOfPepper) => void
	onEdit: (t: TradeOfPepper) => void
	onDelete: () => void
}

function formatPepperClass(v: number) {
	return v === 3 ? 'Krojona' : String(v)
}

export default function TradeOfPepperRow({ item, onEdit, onDelete }: Props) {
	const { formatDate, formatCurrency, formatWeight, isCurrencyReady } = useFormatUtils()

	/* ⛔ blokada błędnego renderu (EUR bez kursu) */
	if (!isCurrencyReady) {
		return null
	}

	return (
		<>
			{/* 📱 MOBILE */}
			<div className='xl:hidden w-full max-w-sm rounded-xl border bg-white p-4 shadow-sm'>
				<div className='flex justify-between items-start'>
					<p className='text-sm font-semibold text-gray-900'>
						{item.lp}. {formatDate(item.tradeDate)}
					</p>

					<div className='flex gap-2 text-gray-500'>
						<button onClick={() => onEdit(item)} className='hover:text-yellow-500 hover:cusor-pointer'>
							<FontAwesomeIcon icon={faPen} />
						</button>
						<button onClick={onDelete} className='hover:text-red-500 hover:cusor-pointer'>
							<FontAwesomeIcon icon={faTrash} />
						</button>
					</div>
				</div>

				<div className='mt-2 grid grid-cols-2 gap-y-1 text-sm'>
					<p>
						<span className='text-gray-500'>Klasa:</span> {formatPepperClass(item.pepperClass)}
					</p>
					<p>
						<span className='text-gray-500'>Kolor:</span> {item.pepperColor}
					</p>

					<p>
						<span className='text-gray-500'>Cena:</span> {formatCurrency(item.tradePrice)}
					</p>

					<p>
						<span className='text-gray-500'>Masa:</span> {formatWeight(item.tradeWeight)}
					</p>

					<p>
						<span className='text-gray-500'>VAT:</span> {item.vatRate}%
					</p>

					<p className='font-semibold'>Suma: {formatCurrency(item.total)}</p>
				</div>

				<p className='mt-2 text-xs text-gray-500 truncate'>Punkt sprzedaży: {item.pointName}</p>
			</div>

			{/* 🖥 DESKTOP */}
			<div
				className='
					hidden xl:grid
					grid-cols-[1fr_2fr_1.5fr_2fr_1fr_2fr_1fr_2fr_5.5fr_1.5fr]
					w-full
					py-2
					text-sm
					text-center
					items-center
					border-b
					border-gray-300
					hover:bg-gray-50
				'>
				<div>{item.lp}</div>
				<div>{formatDate(item.tradeDate)}</div>
				<div>{formatPepperClass(item.pepperClass)}</div>
				<div>{item.pepperColor}</div>
				<div>{formatCurrency(item.tradePrice)}</div>
				<div>{formatWeight(item.tradeWeight)}</div>
				<div>{item.vatRate}%</div>
				<div className='font-semibold'>{formatCurrency(item.total)}</div>
				<div className='truncate px-2'>{item.pointName}</div>

				<div className='flex justify-center gap-2 text-gray-500'>
					<button onClick={() => onEdit(item)} className='hover:text-yellow-500 hover:cusor-pointer'>
						<FontAwesomeIcon icon={faPen} />
					</button>
					<button onClick={onDelete} className='hover:text-red-500 hover:cusor-pointer'>
						<FontAwesomeIcon icon={faTrash} />
					</button>
				</div>
			</div>
		</>
	)
}
