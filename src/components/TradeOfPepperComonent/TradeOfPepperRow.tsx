import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
import type { TradeOfPepper } from '../../types/TradeOfPepper'
import { useMeData } from '../../hooks/useMeData'
import { useCurrencyRate } from '../../hooks/useCurrencyRate'

type RowItem = TradeOfPepper & {
	lp: number
	pointName: string
	total: number // zawsze w PLN (bazowe)
}

type Props = {
	item: RowItem
	onView: (t: TradeOfPepper) => void
	onEdit: (t: TradeOfPepper) => void
	onDelete: () => void
}

/* =======================
   HELPERS
======================= */
function formatPepperClass(v: number) {
	return v === 3 ? 'Krojona' : String(v)
}

function formatDate(value: string, format: 'DD-MM-YYYY' | 'YYYY-MM-DD') {
	if (format === 'YYYY-MM-DD') return value
	const [y, m, d] = value.split('-')
	return `${d}-${m}-${y}`
}

function formatNumber(value: number, useSeparator: boolean, decimals: number) {
	const fixed = value.toFixed(decimals)
	if (!useSeparator) return fixed
	return fixed.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export default function TradeOfPepperRow({ item, onEdit, onDelete }: Props) {
	const { appSettings } = useMeData()

	const dateFormat = (appSettings?.dateFormat as 'DD-MM-YYYY' | 'YYYY-MM-DD') ?? 'DD-MM-YYYY'

	const currency = appSettings?.currency ?? 'PLN'
	const weightUnit = appSettings?.weightUnit ?? 'kg'
	const useThousands = appSettings?.useThousandsSeparator ?? false

	/* =======================
	   EUR RATE
	======================= */
	const [eurRate, setEurRate] = useState<number>(4.5)

	useEffect(() => {
		if (currency !== 'EUR') return

		async function fetchRate() {
			try {
				const res = await fetch('https://api.nbp.pl/api/exchangerates/rates/A/EUR/?format=json')
				const data = await res.json()
				const rate = data?.rates?.[0]?.mid
				if (typeof rate === 'number') setEurRate(rate)
			} catch {}
		}

		fetchRate()
	}, [currency])

	/* =======================
	   UI CONVERSIONS
	======================= */
	const currencySymbol = currency === 'EUR' ? '€' : 'zł'

	const priceUi = currency === 'EUR' ? item.tradePrice / eurRate : item.tradePrice

	const weightUi = weightUnit === 't' ? item.tradeWeight / 1000 : item.tradeWeight

	const totalUi = currency === 'EUR' ? item.total / eurRate : item.total

	const priceDecimals = currency === 'EUR' ? 2 : 1
	const weightDecimals = weightUnit === 't' ? 3 : 0

	/* =========================================================
	   MOBILE – KARTA
	========================================================= */
	return (
		<>
			{/* 📱 MOBILE */}
			<div className='xl:hidden w-90 rounded-xl border bg-white p-4 shadow-sm'>
				<div className='flex justify-between items-start'>
					<p className='text-sm font-semibold text-gray-900'>
						{item.lp}. {formatDate(item.tradeDate, dateFormat)}
					</p>

					<div className='flex gap-2 text-gray-500'>
						<button onClick={() => onEdit(item)} className='hover:text-yellow-500'>
							<FontAwesomeIcon icon={faPen} />
						</button>
						<button onClick={onDelete} className='hover:text-red-500'>
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
						<span className='text-gray-500'>Cena:</span> {formatNumber(priceUi, useThousands, priceDecimals)}{' '}
						{currencySymbol}
					</p>

					<p>
						<span className='text-gray-500'>Masa:</span> {formatNumber(weightUi, useThousands, weightDecimals)}{' '}
						{weightUnit}
					</p>

					<p>
						<span className='text-gray-500'>VAT:</span> {item.vatRate}%
					</p>

					<p className='font-semibold'>
						Suma: {formatNumber(totalUi, useThousands, 2)} {currencySymbol}
					</p>
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
				<div>{formatDate(item.tradeDate, dateFormat)}</div>
				<div>{formatPepperClass(item.pepperClass)}</div>
				<div>{item.pepperColor}</div>

				<div>
					{formatNumber(priceUi, useThousands, priceDecimals)} {currencySymbol}
				</div>

				<div>
					{formatNumber(weightUi, useThousands, weightDecimals)} {weightUnit}
				</div>

				<div>{item.vatRate}%</div>

				<div className='font-semibold'>
					{formatNumber(totalUi, useThousands, 2)} {currencySymbol}
				</div>

				<div className='truncate px-2'>{item.pointName}</div>

				<div className='flex justify-center gap-2 text-gray-500'>
					<button onClick={() => onEdit(item)} className='hover:text-yellow-500'>
						<FontAwesomeIcon icon={faPen} />
					</button>
					<button onClick={onDelete} className='hover:text-red-500'>
						<FontAwesomeIcon icon={faTrash} />
					</button>
				</div>
			</div>
		</>
	)
}
