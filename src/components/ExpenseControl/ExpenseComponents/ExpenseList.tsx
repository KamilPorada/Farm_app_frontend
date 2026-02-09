import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash, faDownload } from '@fortawesome/free-solid-svg-icons'
import type { Expense } from '../../../types/Expense'
import ExpenseRow from './ExpenseRow'
import { useFormatUtils } from '../../../hooks/useFormatUtils'

type Props = {
	items: Expense[]
	onEdit: (e: Expense) => void
	onDelete: (e: Expense) => void
}

export default function ExpenseList({ items, onEdit, onDelete }: Props) {
	const [query, setQuery] = useState('')

	const { formatCurrency, formatNumber, formatDate, userCurrency, toEURO } = useFormatUtils()

	const filteredItems = useMemo(() => {
		if (!query.trim()) return items
		const q = query.toLowerCase()
		return items.filter(e => e.title.toLowerCase().includes(q))
	}, [items, query])

	const totalSum = useMemo(() => {
		return filteredItems.reduce((acc, e) => {
			const price = userCurrency === 'EUR' ? toEURO(e.price) : e.price
			return acc + price * e.quantity
		}, 0)
	}, [filteredItems, userCurrency, toEURO])

	function exportToCSV(rows: Expense[]) {
		if (!rows.length) return

		const headers = ['LP', 'Data', 'Nazwa', 'Ilość', 'Cena', 'Jednostka', 'Suma']

		const csv = [
			headers.join(';'),
			...rows.map((e, i) => {
				const price = userCurrency === 'EUR' ? toEURO(e.price) : e.price
				const sum = price * e.quantity

				return [i + 1, formatDate(e.expenseDate), e.title, e.quantity, price.toFixed(2), e.unit, sum.toFixed(2)]
					.map(v => `"${String(v)}"`)
					.join(';')
			}),
		].join('\n')

		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
		const url = URL.createObjectURL(blob)

		const a = document.createElement('a')
		a.href = url
		a.download = 'Wydatki.csv'
		a.click()

		URL.revokeObjectURL(url)
	}

	if (!items.length) {
		return <p className='mt-4 text-sm text-gray-500'>Brak wydatków.</p>
	}

	return (
		<div className='mt-4'>
			<div className='mb-4 flex items-center justify-between'>
				<div className='h-[42px] px-4 border-l-4 border-mainColor flex items-center'>
					<p className='text-sm'>
						<span className='text-gray-500'>Suma wydatków:</span>{' '}
						<span className='font-semibold text-gray-900'>{formatCurrency(totalSum)}</span>
					</p>
				</div>

				<button
					onClick={() => exportToCSV(filteredItems)}
					className='h-[42px] px-4 border rounded-md text-sm flex items-center gap-2'>
					<FontAwesomeIcon icon={faDownload} />
					Eksport CSV
				</button>
			</div>

			<div className='space-y-4 md:hidden'>
				{filteredItems.map((e, i) => {
					const price = userCurrency === 'EUR' ? toEURO(e.price) : e.price
					const sum = price * e.quantity

					const [, unitName = ''] = e.unit.split('/')
					const displayUnit = userCurrency === 'EUR' ? `€/${unitName}` : `zł/${unitName}`

					return (
						<div key={e.id} className='rounded-lg border bg-white p-4 shadow-sm'>
							<p className='font-semibold text-gray-900'>
								{i + 1}. {e.title}
							</p>
							<p className='text-sm text-gray-500'>{formatDate(e.expenseDate)}</p>

							<div className='mt-2 text-sm text-gray-700 space-y-1'>
								<p>
									{formatNumber(e.quantity)} × {formatNumber(price)} {displayUnit}
								</p>
								<p className='font-medium'>Suma: {formatCurrency(sum)}</p>
							</div>

							<div className='mt-3 flex justify-end gap-2'>
								<button onClick={() => onEdit(e)} className='p-2 rounded-md hover:text-yellow-500 hover:bg-yellow-50'>
									<FontAwesomeIcon icon={faPen} />
								</button>
								<button onClick={() => onDelete(e)} className='p-2 rounded-md hover:text-red-500 hover:bg-red-50'>
									<FontAwesomeIcon icon={faTrash} />
								</button>
							</div>
						</div>
					)
				})}
			</div>

			<div className='hidden md:block'>
				<div className=' grid grid-cols-[0.5fr_1.5fr_3fr_1fr_2fr_1.5fr_1fr] gap-3 px-3 py-2 text-xs text-center font-medium bg-mainColor text-white rounded-t-lg '>
					{' '}
					<div>Lp.</div> <div>Data</div> <div>Nazwa</div> <div>Ilość</div> <div>Cena</div> <div>Suma</div>{' '}
					<div>Akcje</div>{' '}
				</div>
				{filteredItems.map((e, i) => (
					<ExpenseRow key={e.id} index={i + 1} expense={e} onEdit={onEdit} onDelete={onDelete} />
				))}
			</div>
		</div>
	)
}
