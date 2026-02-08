import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash, faDownload } from '@fortawesome/free-solid-svg-icons'
import { useMeData } from '../../../hooks/useMeData'
import { useCurrencyRate } from '../../../hooks/useCurrencyRate'
import ExpenseRow from './ExpenseRow'
import type { Expense } from '../../../types/Expense'

type Props = {
	items: Expense[]
	onEdit: (e: Expense) => void
	onDelete: (e: Expense) => void
}

export default function ExpenseList({ items, onEdit, onDelete }: Props) {
	const [query, setQuery] = useState('')
	const { appSettings } = useMeData()
	const { eurRate } = useCurrencyRate()

	const currency = appSettings?.currency === 'EUR' || appSettings?.currency === 'PLN' ? appSettings.currency : 'PLN'

	const dateFormat = (appSettings?.dateFormat as 'DD-MM-YYYY' | 'YYYY-MM-DD') ?? 'DD-MM-YYYY'

	const useSep = appSettings?.useThousandsSeparator ?? true

	function formatDate(value: string, format: 'DD-MM-YYYY' | 'YYYY-MM-DD') {
		if (format === 'YYYY-MM-DD') return value
		const [y, m, d] = value.split('-')
		return `${d}-${m}-${y}`
	}

	const formatMoney = (v: number) =>
		v.toLocaleString('pl-PL', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
			useGrouping: useSep,
		})

	function exportToCSV(rows: Expense[]) {
		if (!rows.length) return

		const headers = ['LP', 'Data', 'Nazwa', 'Ilość', 'Cena', 'Jednostka', 'Suma']

		const csv = [
			headers.join(';'),
			...rows.map((e, i) => {
				const price = currency === 'EUR' ? e.price / eurRate : e.price
				const sum = price * e.quantity

				return [i + 1, e.expenseDate, e.title, e.quantity, price.toFixed(2), e.unit, sum.toFixed(2)]
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

	/* =======================
	   FILTER
	======================= */
	const filteredItems = useMemo(() => {
		if (!query.trim()) return items
		const q = query.toLowerCase()
		return items.filter(e => e.title.toLowerCase().includes(q))
	}, [items, query])

	const totalSum = useMemo(() => {
		return filteredItems.reduce((acc, e) => {
			const price = currency === 'EUR' ? e.price / eurRate : e.price
			return acc + price * e.quantity
		}, 0)
	}, [filteredItems, currency, eurRate])

	if (!items.length) {
		return <p className='mt-4 text-sm text-gray-500'>Brak wydatków.</p>
	}

	return (
		<div className='mt-4'>
			{/* ===================== */}
			{/* 💰 PODSUMOWANIE + EXPORT */}
			{/* ===================== */}
			<div className='mb-4 flex items-center justify-between'>
				<div className='h-[42px] px-4 border-l-4 border-mainColor  flex items-center'>
					<p className='text-sm'>
						<span className='text-gray-500'>Suma wydatków:</span>{' '}
						<span className='font-semibold text-gray-900'>
							{formatMoney(totalSum)} {currency === 'EUR' ? '€' : 'zł'}
						</span>
					</p>
				</div>

				<button className='h-[42px] px-4 border rounded-md text-sm flex items-center gap-2'>
					<FontAwesomeIcon icon={faDownload} />
					Eksport CSV
				</button>
			</div>

			{/* ===================== */}
			{/* 📱 MOBILE – KARTY */}
			{/* ===================== */}
			<div className='space-y-4 md:hidden'>
				{filteredItems.map((e, i) => {
					// cena zawsze w bazie w PLN
					const price = currency === 'EUR' ? e.price / eurRate : e.price
					const sum = price * e.quantity

					// unit: zł/worek → €/worek
					const [, unitName = ''] = e.unit.split('/')
					const displayUnit = currency === 'EUR' ? `€/${unitName}` : `zł/${unitName}`

					const formatMoney = (v: number) =>
						v.toLocaleString('pl-PL', {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
							useGrouping: useSep,
						})

					const formatQty = (v: number) =>
						v.toLocaleString('pl-PL', {
							useGrouping: useSep,
						})

					return (
						<div key={e.id} className='rounded-lg border bg-white p-4 shadow-sm'>
							<p className='font-semibold text-gray-900'>
								{i + 1}. {e.title}
							</p>
							<p className='text-sm text-gray-500'>{formatDate(e.expenseDate, dateFormat)}</p>

							<div className='mt-2 text-sm text-gray-700 space-y-1'>
								<p>
									{formatQty(e.quantity)} × {formatMoney(price)} {displayUnit}
								</p>
								<p className='font-medium'>
									Suma: {formatMoney(sum)} {currency === 'EUR' ? '€' : 'zł'}
								</p>
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

			{/* DESKTOP */}
			<div className='hidden md:block'>
				<div
					className='
	grid
	grid-cols-[0.5fr_1.5fr_3fr_1fr_2fr_1.5fr_1fr]
	gap-3
	px-3
	py-2
	text-xs text-center
	font-medium
	bg-mainColor
	text-white
	rounded-t-lg
'>
					<div>Lp.</div>
					<div>Data</div>
					<div>Nazwa</div>
					<div>Ilość</div>
					<div>Cena</div>
					<div>Suma</div>
					<div>Akcje</div>
				</div>

				{filteredItems.map((e, i) => (
					<ExpenseRow
						key={e.id}
						index={i + 1}
						expense={e}
						currency={currency}
						eurRate={eurRate}
						useSeparator={useSep}
						onEdit={onEdit}
						onDelete={onDelete}
					/>
				))}
			</div>
		</div>
	)
}

/* =======================
   FORMAT PRICE
======================= */
function formatPrice(value: number, currency: 'PLN' | 'EUR', eurRate: number, useSep: boolean) {
	const v = currency === 'EUR' ? value / eurRate : value
	return (
		v.toLocaleString('pl-PL', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
			useGrouping: useSep,
		}) + ` ${currency}`
	)
}
