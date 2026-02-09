import { useEffect, useState, useMemo } from 'react'
import { useMeData } from './useMeData'

type Currency = 'PLN' | 'EUR'
type WeightUnit = 'kg' | 't'
type DateFormat = 'DD-MM-YYYY' | 'YYYY-MM-DD' | 'DD.MM.YYYY' | 'YYYY.MM.DD'

const CACHE_KEY = 'eur_rate'
const CACHE_TS_KEY = 'eur_rate_ts'
const CACHE_TTL = 1000 * 60 * 60 * 6

export function useFormatUtils() {
	const { appSettings } = useMeData()

	const [EURRate, setEURRate] = useState<number | null>(null)

	const userCurrency: Currency = appSettings?.currency === 'EUR' ? 'EUR' : 'PLN'
	const userWeightUnit: WeightUnit = appSettings?.weightUnit === 't' ? 't' : 'kg'
	const userDateFormat: DateFormat =
		appSettings?.dateFormat === 'DD-MM-YYYY' ||
		appSettings?.dateFormat === 'YYYY-MM-DD' ||
		appSettings?.dateFormat === 'DD.MM.YYYY' ||
		appSettings?.dateFormat === 'YYYY.MM.DD'
			? appSettings.dateFormat
			: 'DD-MM-YYYY'

	const useThousandsSeparator: boolean = appSettings?.useThousandsSeparator ?? true

	useEffect(() => {
		if (userCurrency !== 'EUR') return

		const cached = sessionStorage.getItem(CACHE_KEY)
		const ts = sessionStorage.getItem(CACHE_TS_KEY)

		if (cached && ts && Date.now() - Number(ts) < CACHE_TTL) {
			setEURRate(Number(cached))
			return
		}

		async function fetchRate() {
			const res = await fetch('https://api.nbp.pl/api/exchangerates/rates/A/EUR/?format=json')
			const data = await res.json()

			sessionStorage.setItem(CACHE_KEY, data.rates[0].mid)
			sessionStorage.setItem(CACHE_TS_KEY, String(Date.now()))

			setEURRate(data.rates[0].mid)
		}

		fetchRate()
	}, [userCurrency])

	const isCurrencyReady = useMemo(() => {
		if (userCurrency === 'PLN') return true
		return !!EURRate && EURRate > 0
	}, [userCurrency, EURRate])

	function formatNumber(value: number | string): string {
		if (value === null || value === undefined || value === '') return ''

		const num = typeof value === 'string' ? Number(value) : value
		if (isNaN(num)) return ''

		if (!useThousandsSeparator) {
			return num.toFixed(2).replace(/\.00$/, '')
		}

		return num.toLocaleString('pl-PL', {
			minimumFractionDigits: num % 1 === 0 ? 0 : 2,
			maximumFractionDigits: 2,
		})
	}

	function getCurrencySymbol(currency?: Currency): string {
		const curr = currency ?? userCurrency
		return curr === 'EUR' ? '€' : 'zł'
	}

	function toEURO(valuePLN: number): number {
		if (!EURRate || EURRate <= 0) return valuePLN
		return Number((valuePLN / EURRate).toFixed(2))
	}

	function toPLN(valueEUR: number): number {
		if (!EURRate || EURRate <= 0) return valueEUR
		return Number((valueEUR * EURRate).toFixed(2))
	}

	function formatCurrency(value: number, currency?: Currency): string {
		const curr = currency ?? userCurrency

		if (curr === 'EUR' && !isCurrencyReady) {
			return `${formatNumber(value)} zł`
		}

		const converted = curr === 'EUR' ? value / EURRate! : value

		return `${formatNumber(converted)} ${getCurrencySymbol(curr)}`
	}

	function formatDate(value: string, format?: DateFormat): string {
		if (!value) return ''

		const targetFormat = format ?? userDateFormat

		const [y, m, d] = value.split('-')

		switch (targetFormat) {
			case 'YYYY-MM-DD':
				return `${y}-${m}-${d}`

			case 'DD-MM-YYYY':
				return `${d}-${m}-${y}`

			case 'YYYY.MM.DD':
				return `${y}.${m}.${d}`

			case 'DD.MM.YYYY':
				return `${d}.${m}.${y}`

			default:
				return value
		}
	}

	function convertWeight(valueKg: number, target?: WeightUnit): number {
		const unit = target ?? userWeightUnit
		return unit === 't' ? valueKg / 1000 : valueKg
	}

	function formatWeight(valueKg: number, unit?: WeightUnit): string {
		const u = unit ?? userWeightUnit
		const converted = convertWeight(valueKg, u)
		return `${formatNumber(converted)} ${u}`
	}

	function getWeightSymbol(unit?: WeightUnit): string {
		const u = unit ?? userWeightUnit
		return u === 't' ? 't' : 'kg'
	}

	return {
		isCurrencyReady,
		userCurrency,
		userWeightUnit,
		userDateFormat,
		useThousandsSeparator,
		toEURO,
		toPLN,
		formatNumber,
		getCurrencySymbol,
		formatCurrency,
		formatDate,
		formatWeight,
		convertWeight,
		getWeightSymbol,
	}
}
