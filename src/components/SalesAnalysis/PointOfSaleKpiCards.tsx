import { useMemo } from 'react'
import type { TradeOfPepper } from '../../types/TradeOfPepper'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faScaleBalanced, faSackDollar, faTag } from '@fortawesome/free-solid-svg-icons'
import { useMeData } from '../../hooks/useMeData'
import { useCurrencyRate } from '../../hooks/useCurrencyRate'

type Props = {
	actualTrades: TradeOfPepper[]
}

function formatNumber(value: number, { useSeparator, decimals }: { useSeparator: boolean; decimals: number }) {
	if (useSeparator) {
		return new Intl.NumberFormat('pl-PL', {
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals,
		}).format(value)
	}

	return value.toFixed(decimals)
}

function KpiCard({ icon, label, value, unit }: { icon: any; label: string; value: string; unit?: string }) {
	return (
		<div className='w-full relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-gray-50 p-3 shadow-sm'>
			{/* accent */}
			<div className='absolute left-0 top-0 h-full w-1 bg-mainColor' />

			{/* watermark icon */}
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
	const { appSettings } = useMeData()
	const { currency, eurRate } = useCurrencyRate()

	const { totalMass, massUnit, totalRevenue, currencyUnit, avgPrice, priceUnit } = useMemo(() => {
		if (!actualTrades.length) {
			return {
				totalMass: '0',
				massUnit: 'kg',
				totalRevenue: '0',
				currencyUnit: currency === 'PLN' ? 'zł' : '€',
				avgPrice: '0',
				priceUnit: `${currency === 'PLN' ? 'zł' : '€'}/kg`,
			}
		}

		/* ===== MASA ===== */
		const totalKg = actualTrades.reduce((acc, t) => acc + t.tradeWeight, 0)

		const isTons = appSettings?.weightUnit === 't'
		const massValue = isTons ? totalKg / 1000 : totalKg
		const massDecimals = isTons ? 2 : 0

		/* ===== PRZYCHÓD (BRUTTO) ===== */
		const revenuePln = actualTrades.reduce((acc, t) => acc + t.tradeWeight * t.tradePrice * (1 + t.vatRate / 100), 0)

		const revenue = currency === 'EUR' && eurRate ? revenuePln / eurRate : revenuePln

		/* ===== ŚREDNIA CENA (WAŻONA) ===== */
		const avgPriceValue = totalKg > 0 ? revenue / (isTons ? totalKg / 1000 : totalKg) : 0

		const useSeparator = appSettings?.useThousandsSeparator ?? false

		return {
			totalMass: formatNumber(massValue, {
				useSeparator,
				decimals: massDecimals,
			}),
			massUnit: isTons ? 't' : 'kg',

			totalRevenue: formatNumber(revenue, {
				useSeparator,
				decimals: 0,
			}),
			currencyUnit: currency === 'PLN' ? 'zł' : '€',

			avgPrice: formatNumber(avgPriceValue, {
				useSeparator,
				decimals: 2,
			}),
			priceUnit: `${currency === 'PLN' ? 'zł' : '€'}/${isTons ? 't' : 'kg'}`,
		}
	}, [actualTrades, appSettings, currency, eurRate])

	return (
		<div className='w-full flex flex-col md:flex-row justify-between items-center gap-6'>
			<KpiCard icon={faScaleBalanced} label='Łączna sprzedaż' value={totalMass} unit={massUnit} />

			<KpiCard icon={faSackDollar} label='Łączny przychód' value={totalRevenue} unit={currencyUnit} />

			<KpiCard icon={faTag} label='Średnia cena' value={avgPrice} unit={priceUnit} />
		</div>
	)
}
