import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine, faArrowTrendDown } from '@fortawesome/free-solid-svg-icons'
import { useFormatUtils } from '../../../hooks/useFormatUtils'

type Props = {
	totalIncrease: number
	totalDecrease: number
}

export default function CashFlowSummary({ totalIncrease, totalDecrease }: Props) {
	const { formatNumber, userCurrency, toEURO } = useFormatUtils()

	const profit = totalIncrease - totalDecrease
	const isPositive = profit >= 0

	const value = Math.abs(profit)
	const displayValue = userCurrency === 'EUR' ? toEURO(value) : value
	const currency = userCurrency === 'EUR' ? '€' : 'zł'

	return (
		<div className='mt-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm'>
			<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
				{/* LEFT */}
				<div className='flex items-start gap-4'>
					<div
						className={`
							mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full
							${isPositive ? 'bg-mainColor/10 text-mainColor' : 'bg-red-100 text-red-600'}
						`}>
						<FontAwesomeIcon icon={isPositive ? faChartLine : faArrowTrendDown} />
					</div>

					<div>
						<p className='text-base font-medium text-gray-700'>Realny zysk finansowy</p>
						<p className='text-sm text-gray-500'>Wynik finansowy po uwzględnieniu kosztów</p>
					</div>
				</div>

				{/* RIGHT / AMOUNT */}
				<div
					className={`
						text-left sm:text-right
						text-2xl sm:text-xl font-semibold
						${isPositive ? 'text-mainColor' : 'text-red-600'}
						whitespace-nowrap
					`}>
					{isPositive ? '+ ' : '- '}
					{formatNumber(displayValue)} {currency}
				</div>
			</div>
		</div>
	)
}
