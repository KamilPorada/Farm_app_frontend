import { useMeData } from './useMeData'
import { useCurrencyRate } from './useCurrencyRate'

type Currency = 'PLN' | 'EUR'
type WeightUnit = 'kg' | 't'
type DateFormat = 'DD-MM-YYYY' | 'YYYY-MM-DD'

export function useFormatUtils() {
	const { appSettings } = useMeData()
	const { eurRate } = useCurrencyRate()

	const userCurrency: Currency = appSettings?.currency === 'EUR' ? 'EUR' : 'PLN'
	const userWeightUnit: WeightUnit = appSettings?.weightUnit === 't' ? 't' : 'kg'
	const userDateFormat: DateFormat = appSettings?.dateFormat === 'DD-MM-YYYY' ? 'DD-MM-YYYY' : 'YYYY-MM-DD'

	const useThousandsSeparator: boolean = appSettings?.useThousandsSeparator ?? true

	/* =======================
	   NUMBER
	   123300 → 123 300 | 123300
	======================= */
	function formatNumber(value: number | string): string {
		if (value === null || value === undefined || value === '') return ''

		const num = typeof value === 'string' ? Number(value) : value
		if (isNaN(num)) return ''

		if (!useThousandsSeparator) {
			// bez separatorów tysięcy
			return String(num)
		}

		return num.toLocaleString('pl-PL')
	}

	/* =======================
	   CURRENCY SYMBOL
	   PLN → zł | EUR → €
	======================= */
	function getCurrencySymbol(currency?: Currency): string {
		const curr = currency ?? userCurrency
		return curr === 'EUR' ? '€' : 'zł'
	}

	/* =======================
	   CURRENCY CONVERSION
	   BAZA: PLN
	======================= */
	function convertCurrency(value: number, target: Currency): number {
		if (!eurRate || eurRate <= 0) return value

		if (target === 'EUR') {
			return Number((value / eurRate).toFixed(2))
		}

		// EUR → PLN
		return Number((value * eurRate).toFixed(2))
	}

	/* =======================
	   FORMAT CURRENCY
	======================= */
	function formatCurrency(value: number, currency?: Currency): string {
		const curr = currency ?? userCurrency
		const converted = convertCurrency(value, curr)

		return `${formatNumber(converted)} ${getCurrencySymbol(curr)}`
	}

	/* =======================
	   DATE
	======================= */
	function formatDate(value: string, format?: DateFormat): string {
		if (!value) return ''

		const targetFormat = format ?? userDateFormat

		if (targetFormat === 'YYYY-MM-DD') return value

		const [y, m, d] = value.split('-')
		if (!y || !m || !d) return value

		return `${d}-${m}-${y}`
	}

	/* =======================
	   WEIGHT
	   baza: kg
	======================= */
	function convertWeight(valueKg: number, target?: WeightUnit): number {
		const unit = target ?? userWeightUnit
		return unit === 't' ? valueKg / 1000 : valueKg
	}

	function formatWeight(valueKg: number, unit?: WeightUnit): string {
		const u = unit ?? userWeightUnit
		const converted = convertWeight(valueKg, u)

		return `${formatNumber(converted)} ${u}`
	}

	return {
		// settings
		userCurrency,
		userWeightUnit,
		userDateFormat,
		useThousandsSeparator,

		// number
		formatNumber,

		// currency
		getCurrencySymbol,
		convertCurrency,
		formatCurrency,

		// date
		formatDate,

		// weight
		convertWeight,
		formatWeight,
	}
}
