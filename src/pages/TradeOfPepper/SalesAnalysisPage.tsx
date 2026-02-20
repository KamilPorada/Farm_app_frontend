import { useEffect, useState, useMemo } from 'react'
import SalesAnalysisHeader from '../../components/SalesAnalysis/SalesAnalysisHeader'
import SalesAnalysisMainCards from '../../components/SalesAnalysis/SalesAnalysisMainCards'
import TradesAndHarvestByMonthChart from '../../components/SalesAnalysis/TradesAndHarvestByMonthChart'
import AveragePriceChart from '../../components/SalesAnalysis/AveragePriceChart'
import PepperClassDonutCards from '../../components/SalesAnalysis/PepperClassDonutCards'
import PepperColorRadialChart from '../../components/SalesAnalysis/PepperColorRadialChart'
import PepperTransactionsRadarChart from '../../components/SalesAnalysis/PepperTransactionRadarChart'
import SeasonTunnelStatsCards from '../../components/SalesAnalysis/SeasonTunnelStatsCards'
import PointOfSaleDashboardCard from '../../components/SalesAnalysis/PointOfSaleDashboardCard'
import SalesIntensityHeatmap from '../../components/SalesAnalysis/SalesIntensityHeatmap'
import { useAuthUser } from '../../hooks/useAuthUser'
import { MoonLoader } from 'react-spinners'
import { useMeData } from '../../hooks/useMeData'
import type { TradeOfPepper } from '../../types/TradeOfPepper'
import type { PointOfSale } from '../../types/PointOfSale'

function SalesAnalysisPage() {
	const { user, getToken, isLoading } = useAuthUser()
	const { farmerTunnels } = useMeData() as unknown as {
		farmerTunnels: { year: number; count: number }[]
	}

	const [allFarmerTrades, setAllFarmerTrades] = useState<TradeOfPepper[]>([])
	const [trades, setTrades] = useState<TradeOfPepper[]>([])
	const [points, setPoints] = useState<PointOfSale[]>([])

	const today = new Date()
	const todayISO = today.toISOString().slice(0, 10)
	const [year, setYear] = useState(today.getFullYear()) 
	const [toDate, setToDate] = useState(todayISO)
	const tunnelsInActualSeason = farmerTunnels.find(t => t.year === year)?.count ?? 0
	const tunnelsInPreviousSeason = farmerTunnels.find(t => t.year === year - 1)?.count ?? 0

	// 👉 zakres analizy (JEDNO ŹRÓDŁO PRAWDY)
	const dateRange = useMemo(() => {
		return {
			from: `${year}-01-01`,
			to: toDate,
		}
	}, [year, toDate])
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		const currentYear = new Date().getFullYear()

		if (year === currentYear) {
			// ✅ bieżący rok → dzisiejsza data
			const todayISO = new Date().toISOString().slice(0, 10)
			setToDate(todayISO)
		} else {
			// ✅ poprzedni rok → ostatni dzień roku
			setToDate(`${year}-12-31`)
		}
	}, [year])

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

		let to: Date

		// 🔹 jeżeli toDate = dzisiejsza data → pełny poprzedni rok
		if (toDate === todayISO) {
			to = new Date(`${previousYear}-12-31`)
		} else {
			// 🔹 jeżeli user zmienił datę → ten sam dzień/miesiąc rok wcześniej
			const [, month, day] = toDate.split('-')
			to = new Date(`${previousYear}-${month}-${day}`)
		}

		return allFarmerTrades.filter(trade => {
			const tradeDate = new Date(trade.tradeDate)

			return tradeDate >= from && tradeDate <= to && tradeDate.getFullYear() === previousYear
		})
	}, [allFarmerTrades, year, toDate, todayISO])

	const sortedPoints = useMemo(() => {
		if (!points.length || !allFarmerTrades.length) return points

		const countMap = allFarmerTrades.reduce<Record<number, number>>((acc, t) => {
			acc[t.pointOfSaleId] = (acc[t.pointOfSaleId] ?? 0) + 1
			return acc
		}, {})

		return [...points].sort((a, b) => {
			const aCount = countMap[a.id] ?? 0
			const bCount = countMap[b.id] ?? 0
			return bCount - aCount
		})
	}, [points, allFarmerTrades])

	const hasTrades = filteredTrades.length > 0

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
		<div className='flex flex-col gap-6 container p-8'>
			<SalesAnalysisHeader year={year} setYear={setYear} toDate={toDate} setToDate={setToDate} />

			{!hasTrades ? (
				<div className='flex flex-col items-center justify-center py-24 text-center'>
					<p className='text-base font-medium text-gray-700'>Brak zarejestrowanych transakcji w wybranym okresie!</p>

					<p className='mt-2 text-sm text-gray-500 max-w-md'>
						Dla tego zakresu dat nie ma jeszcze danych sprzedażowych. Wybierz inny okres, aby kontynuować analizę.
					</p>
				</div>
			) : (
				<>
					<SalesAnalysisMainCards actualTrades={filteredTrades} previousTrades={filteredPreviousYearTrades} />

					<TradesAndHarvestByMonthChart actualTrades={filteredTrades} />

					<PepperClassDonutCards actualTrades={filteredTrades} />

					<div className='flex flex-col md:flex-row justify-between items-center gap-6'>
						<PepperColorRadialChart actualTrades={filteredTrades} />
						<PepperTransactionsRadarChart actualTrades={filteredTrades} />
					</div>

					<SeasonTunnelStatsCards
						tunnelsInActualSeason={tunnelsInActualSeason}
						tunnelsInPreviousSeason={tunnelsInPreviousSeason}
						actualTrades={filteredTrades}
						previousTrades={filteredPreviousYearTrades}
					/>

					<AveragePriceChart actualTrades={filteredTrades} />

					<SalesIntensityHeatmap actualTrades={filteredTrades} />

					<PointOfSaleDashboardCard points={sortedPoints} actualTrades={filteredTrades} />
				</>
			)}
		</div>
	)
}

export default SalesAnalysisPage
