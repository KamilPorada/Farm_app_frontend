import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useMeData } from '../../../hooks/useMeData'
import type { Expense } from '../../../types/Expense'

type Props = {
	index: number
	expense: Expense
	currency: 'PLN' | 'EUR'
	eurRate: number
	useSeparator: boolean
	onEdit: (e: Expense) => void
	onDelete: (e: Expense) => void
}

export default function ExpenseRow({ index, expense, currency, eurRate, useSeparator, onEdit, onDelete }: Props) {
	// cena zawsze w bazie w PLN
	const { appSettings } = useMeData()
	const price = currency === 'EUR' ? expense.price / eurRate : expense.price
	const sum = price * expense.quantity
	const dateFormat = (appSettings?.dateFormat as 'DD-MM-YYYY' | 'YYYY-MM-DD') ?? 'DD-MM-YYYY'

	/* =======================
	   UNIT STRING MAGIC 🧙‍♂️
	======================= */
	const [, unitName = ''] = expense.unit.split('/')
	const displayUnit = currency === 'EUR' ? `€/${unitName}` : `zł/${unitName}`

	/* =======================
	   FORMATTERS
	======================= */
	const formatMoney = (v: number) =>
		v.toLocaleString('pl-PL', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
			useGrouping: useSeparator,
		})

	const formatQuantity = (v: number) =>
		v.toLocaleString('pl-PL', {
			useGrouping: useSeparator,
		})

	function formatDate(value: string, format: 'DD-MM-YYYY' | 'YYYY-MM-DD') {
		if (format === 'YYYY-MM-DD') return value
		const [y, m, d] = value.split('-')
		return `${d}-${m}-${y}`
	}
	return (
		<div
			className='
				grid
				grid-cols-[0.5fr_1.5fr_3fr_1fr_2fr_1.5fr_1fr]
				gap-3
				px-3
				py-2
				items-center
				text-center
				border-b border-gray-300
				text-sm
				hover:bg-gray-50
			'>
			{/* LP */}
			<div className='text-gray-500'>{index}</div>

			{/* DATA */}
			<div>{formatDate(expense.expenseDate, dateFormat)}</div>

			{/* NAZWA */}
			<div>{expense.title}</div>

			{/* ILOŚĆ */}
			<div>{formatQuantity(expense.quantity)}</div>

			{/* CENA */}
			<div>
				{formatMoney(price)} {displayUnit}
			</div>

			{/* SUMA */}
			<div className='font-medium'>
				{formatMoney(sum)} {currency === 'EUR' ? '€' : 'zł'}
			</div>

			{/* AKCJE */}
			<div className='flex justify-center gap-2 text-gray-500'>
				<button onClick={() => onEdit(expense)} className='hover:text-yellow-500 transition hover:cursor-pointer'>
					<FontAwesomeIcon icon={faPen} />
				</button>
				<button onClick={() => onDelete(expense)} className='hover:text-red-500 transition hover:cursor-pointer'>
					<FontAwesomeIcon icon={faTrash} />
				</button>
			</div>
		</div>
	)
}
