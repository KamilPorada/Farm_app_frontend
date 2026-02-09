import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
import type { Expense } from '../../../types/Expense'
import { useFormatUtils } from '../../../hooks/useFormatUtils'

type Props = {
	index: number
	expense: Expense
	onEdit: (e: Expense) => void
	onDelete: (e: Expense) => void
}

export default function ExpenseRow({ index, expense, onEdit, onDelete }: Props) {
	const {
		formatCurrency,
		formatNumber,
		formatDate,
		userCurrency,
		toEURO,
	} = useFormatUtils()

	const price = userCurrency === 'EUR' ? toEURO(expense.price) : expense.price
	const sum = price * expense.quantity

	const [, unitName = ''] = expense.unit.split('/')
	const displayUnit = userCurrency === 'EUR' ? `€/${unitName}` : `zł/${unitName}`

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
			'
		>
			<div className='text-gray-500'>{index}</div>

			<div>{formatDate(expense.expenseDate)}</div>

			<div>{expense.title}</div>

			<div>{formatNumber(expense.quantity)}</div>

			<div>
				{formatNumber(price)} {displayUnit}
			</div>

			<div className='font-medium'>
				{formatCurrency(sum)}
			</div>

			<div className='flex justify-center gap-2 text-gray-500'>
				<button
					onClick={() => onEdit(expense)}
					className='hover:text-yellow-500 transition hover:cursor-pointer'
				>
					<FontAwesomeIcon icon={faPen} />
				</button>
				<button
					onClick={() => onDelete(expense)}
					className='hover:text-red-500 transition hover:cursor-pointer'
				>
					<FontAwesomeIcon icon={faTrash} />
				</button>
			</div>
		</div>
	)
}
