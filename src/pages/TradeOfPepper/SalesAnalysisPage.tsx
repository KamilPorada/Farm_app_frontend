import React from 'react'
import { useEffect, useState, useMemo } from 'react'

import SalesAnalysisHeader from '../../components/SalesAnalysis/SalesAnalysisHeader'
import SalesAnalysisMainCards from '../../components/SalesAnalysis/SalesAnalysisMainCards'
import { useAuthUser } from '../../hooks/useAuthUser'
import { MoonLoader } from 'react-spinners'
import { notify } from '../../utils/notify'
import { useMeData } from '../../hooks/useMeData'
import type { TradeOfPepper } from '../../types/TradeOfPepper'
import type { PointOfSale } from '../../types/PointOfSale'

function SalesAnalysisPage() {
	const { user, getToken, isLoading } = useAuthUser()
	const { appSettings, farmerTunnels } = useMeData()
	const notificationsEnabled = appSettings?.notificationsEnabled

	const [allFarmerTrades, setAllFarmerTrades] = useState<TradeOfPepper[]>([])
	const [trades, setTrades] = useState<TradeOfPepper[]>([])
	const [points, setPoints] = useState<PointOfSale[]>([])

	const today = new Date()
	const todayISO = today.toISOString().slice(0, 10)
	const [year, setYear] = useState(today.getFullYear())
	const [toDate, setToDate] = useState(todayISO)

	// 👉 zakres analizy (JEDNO ŹRÓDŁO PRAWDY)
	const dateRange = useMemo(()  => {
		return {
			from: `${year}-01-01`,
			to: toDate,
		}
	}, [year, toDate])
	const [loading, setLoading] = useState(false)

	const filteredTrades = useMemo(() => {
		const from = new Date(dateRange.from)
		const to = new Date(dateRange.to)

		return trades.filter(trade => {
			const tradeDate = new Date(trade.tradeDate) // 👈 jeśli inne pole, zmień tutaj
			return tradeDate >= from && tradeDate <= to
		})
	}, [trades, dateRange])

    const filteredPreviousYearTrades = useMemo(() => {
	const previousYear = year - 1

	const from = new Date(`${previousYear}-01-01`)

	// 👉 bierzemy dzień + miesiąc z toDate
	const [, month, day] = toDate.split('-')
	const to = new Date(`${previousYear}-${month}-${day}`)

	return allFarmerTrades.filter(trade => {
		const tradeDate = new Date(trade.tradeDate)
		return (
			tradeDate >= from &&
			tradeDate <= to &&
			tradeDate.getFullYear() === previousYear
		)
	})
}, [allFarmerTrades, year, toDate])


	/* =======================
	   FETCH POINTS OF SALE
	======================= */
	useEffect(() => {
		if (!user?.id) return

		async function fetchPoints() {
			setLoading(true)
			try {
				const token = await getToken()
				const res = await fetch(`http://localhost:8080/api/points-of-sale/farmer/${user?.id}`, {
					headers: { Authorization: `Bearer ${token}` },
				})

				if (!res.ok) {
					return
				}

				setPoints(await res.json())
			} finally {
				setLoading(false)
			}
		}

		fetchPoints()
	}, [user])

	/* =======================
	   FETCH TRADES BY YEAR
	======================= */
	useEffect(() => {
		if (!user?.id) return

		async function fetchTrades() {
			setLoading(true)
			try {
				const token = await getToken()
				const res = await fetch(`http://localhost:8080/api/trades-of-pepper/farmer/${user?.id}/year/${year}`, {
					headers: { Authorization: `Bearer ${token}` },
				})

				if (!res.ok) {
					return
				}

				setTrades(await res.json())
			} finally {
				setLoading(false)
			}
		}

		fetchTrades()
	}, [user, year])

	/* =======================
	   FETCH TRADES BY FARMER
	======================= */
	useEffect(() => {
		if (!user?.id) return

		async function fetchTrades() {
			setLoading(true)
			try {
				const token = await getToken()
				const res = await fetch(`http://localhost:8080/api/trades-of-pepper/farmer/${user?.id}`, {
					headers: { Authorization: `Bearer ${token}` },
				})

				if (!res.ok) {
					return
				}

				setAllFarmerTrades(await res.json())
			} finally {
				setLoading(false)
			}
		}

		fetchTrades()
	}, [user, year])

	if (isLoading || loading) {
		return (
			<div className='absolute top-0 left-0 flex justify-center py-6'>
				<MoonLoader size={50} />
			</div>
		)
	}
	return (
		<div className='container p-8'>
			<SalesAnalysisHeader year={year} setYear={setYear} toDate={toDate} setToDate={setToDate} />{' '}
			<SalesAnalysisMainCards actualTrades={filteredTrades} previousTrades={filteredPreviousYearTrades} />
		</div>
	)
}

export default SalesAnalysisPage
