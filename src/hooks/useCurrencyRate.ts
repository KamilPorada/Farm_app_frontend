import { useEffect, useState } from 'react'
import { useMeData } from './useMeData'

type Currency = 'PLN' | 'EUR'

export function useCurrencyRate() {
	const { appSettings } = useMeData()
	const currency = appSettings?.currency as Currency | undefined

	const [eurRate, setEurRate] = useState(1)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (currency !== 'EUR') {
			setEurRate(1)
			return
		}

		let cancelled = false

		async function fetchRate() {
			setLoading(true)
			try {
				const res = await fetch(
					'https://api.nbp.pl/api/exchangerates/rates/a/eur/?format=json',
				)
				const data = await res.json()

				if (!cancelled) {
					setEurRate(data.rates[0].mid)
				}
			} catch {
				if (!cancelled) {
					setEurRate(1)
				}
			} finally {
				if (!cancelled) {
					setLoading(false)
				}
			}
		}

		fetchRate()

		return () => {
			cancelled = true
		}
	}, [currency])

	return {
		currency: currency ?? 'PLN',
		eurRate,
		loading,
	}
}
