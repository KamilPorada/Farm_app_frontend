import { useMemo } from 'react'
import type { TradeOfPepper } from '../../types/TradeOfPepper'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faScaleBalanced, faSackDollar, faTag } from '@fortawesome/free-solid-svg-icons'
import { useFormatUtils } from '../../hooks/useFormatUtils'

type Props = {
	actualTrades: TradeOfPepper[]
}

function KpiCard({ icon, label, value, unit }: { icon: any; label: string; value: string; unit?: string }) {
	return (
		<div className='w-full relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-gray-50 p-3 shadow-sm'>
			<div className='absolute left-0 top-0 h-full w-1 bg-mainColor' />

			<div className='absolute right-2 bottom-2 text-mainColor/20 text-4xl'>
				<FontAwesomeIcon icon={icon} />
			</div>

			<div className='pl-4 space-y-3'>
				<p className='text-[11px] uppercase tracking-wide text-gray-500 leading-tight'>{label}</p>

				<div className='flex items-end gap-1'>
					<span className='text-3xl font-semibold text-gray-900 leading-none'>{value}</span>
					{unit && <span className='text-sm text-gray-500 mb-0.5'>{unit}</span>}
				</div>
			</div>
		</div>
	)
}

export default function PointOfSaleKpiCards({ actualTrades }: Props) {
	const { formatNumber, convertWeight, toEURO, getCurrencySymbol, getWeightSymbol, userCurrency } =
		useFormatUtils()

	const { totalMassValue, totalRevenueValue, avgPriceValue } = useMemo(() => {
		if (!actualTrades.length) {
			return {
				totalMassValue: '0',
				totalRevenueValue: '0',
				avgPriceValue: '0',
			}
		}

		const totalKg = actualTrades.reduce((acc, t) => acc + t.tradeWeight, 0)
		const totalRevenuePln = actualTrades.reduce(
			(acc, t) => acc + t.tradeWeight * t.tradePrice * (1 + t.vatRate / 100),
			0,
		)

		const avgPricePlnPerKg = totalKg > 0 ? totalRevenuePln / totalKg : 0

		return {
			totalMassValue: formatNumber(convertWeight(totalKg)),
			totalRevenueValue: formatNumber(Math.round(userCurrency === 'EUR' ? toEURO(totalRevenuePln) : totalRevenuePln)),
			avgPriceValue: formatNumber(userCurrency === 'EUR' ? toEURO(avgPricePlnPerKg) : avgPricePlnPerKg),
		}
	}, [actualTrades, userCurrency, toEURO, convertWeight])

	return (
		<div className='w-full flex flex-col md:flex-row justify-between items-center gap-6'>
			<KpiCard icon={faScaleBalanced} label='Łączna sprzedaż' value={totalMassValue} unit={getWeightSymbol()} />

			<KpiCard icon={faSackDollar} label='Łączny przychód' value={totalRevenueValue} unit={getCurrencySymbol()} />

			<KpiCard
				icon={faTag}
				label='Średnia cena'
				value={avgPriceValue}
				unit={`${getCurrencySymbol()}/kg`}
			/>
		</div>
	)
}
