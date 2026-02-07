import { useEffect, useState, useMemo } from 'react'
import TradeOfPepperHeader from '../../components/TradeOfPepperComonent/TradeOfPepperHeader'
import TradeOfPepperForm from '../../components/TradeOfPepperComonent/TradeOfPepperForm'
import TradeOfPepperList from '../../components/TradeOfPepperComonent/TradeOfPepperList'
import type { TradeOfPepper } from '../../types/TradeOfPepper'
import type { PointOfSale } from '../../types/PointOfSale'
import { useAuthUser } from '../../hooks/useAuthUser'
import { MoonLoader } from 'react-spinners'
import { notify } from '../../utils/notify'
import { useMeData } from '../../hooks/useMeData'

export default function TradeOfPepperPage() {
	const { user, getToken, isLoading } = useAuthUser()
	const { appSettings } = useMeData()
	const notificationsEnabled = appSettings?.notificationsEnabled

	const [year, setYear] = useState(new Date().getFullYear())
	const [allFarmerTrades, setAllFarmerTrades] = useState<TradeOfPepper[]>([])
	const [trades, setTrades] = useState<TradeOfPepper[]>([])
	const [points, setPoints] = useState<PointOfSale[]>([])
	const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list')
	const [active, setActive] = useState<TradeOfPepper | null>(null)
	const [loading, setLoading] = useState(false)

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

	const hasTrades = trades.length > 0

	/* =======================
	   SAVE (ADD / EDIT)
	======================= */
	async function handleSave(trade: TradeOfPepper) {
		if (!user) return

		const token = await getToken()
		const isEdit = mode === 'edit'

		const payload = {
			farmerId: user.id,
			pointOfSaleId: trade.pointOfSaleId,
			tradeDate: trade.tradeDate,
			pepperClass: trade.pepperClass,
			pepperColor: trade.pepperColor,
			tradePrice: trade.tradePrice,
			tradeWeight: trade.tradeWeight,
			vatRate: trade.vatRate,
		}

		try {
			const res = await fetch(`http://localhost:8080/api/trades-of-pepper${isEdit ? `/${trade.id}` : ''}`, {
				method: isEdit ? 'PUT' : 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			})

			if (!res.ok) {
				notify(
					notificationsEnabled,
					'error',
					isEdit ? 'Nie udało się zapisać zmian!' : 'Nie udało się dodać transakcji!',
				)
				return
			}

			const saved: TradeOfPepper = await res.json()

			setTrades(prev => (isEdit ? prev.map(t => (t.id === saved.id ? saved : t)) : [...prev, saved]))

			notify(
				notificationsEnabled,
				'success',
				isEdit ? 'Pomyślnie zaktualizowano dane transakcji!' : 'Pomyślnie dodano nową transakcję!',
			)

			setMode('list')
			setActive(null)
		} catch {}
	}

	/* =======================
	   DELETE
	======================= */
	async function handleDelete(trade: TradeOfPepper) {
		if (!user) return

		const token = await getToken()

		try {
			const res = await fetch(`http://localhost:8080/api/trades-of-pepper/${trade.id}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			})

			if (!res.ok) {
				notify(notificationsEnabled, 'error', 'Nie udało się usunąć transakcji')
				return
			}

			setTrades(prev => prev.filter(t => t.id !== trade.id))

			notify(notificationsEnabled, 'success', 'Transakcja została usunięta!')
		} catch {}
	}

	/* =======================
	   LOADING
	======================= */
	if (isLoading || loading) {
		return (
			<div className='absolute top-0 left-0 flex justify-center py-6'>
				<MoonLoader size={50} />
			</div>
		)
	}

	if (!user) return null

	return (
		<div className='container p-8'>
			<TradeOfPepperHeader
				year={year}
				setYear={setYear}
				onAdd={() => {
					setActive(null)
					setMode('add')
				}}
			/>
			{!hasTrades && mode === 'list' ? (
				<div className='flex flex-col items-center justify-center py-24 text-center'>
					<p className='text-base font-medium text-gray-700'>Brak zarejestrowanych transakcji w wybranym okresie!</p>

					<p className='mt-2 text-sm text-gray-500 max-w-md'>
						Dla tego zakresu dat nie ma jeszcze danych sprzedażowych. Wybierz inny okres, aby kontynuować przegląd
						danych.
					</p>
				</div>
			) : (
				<>
					{/* ===== LISTA ===== */}
					{mode === 'list' && (
						<TradeOfPepperList
							items={trades}
							allFarmerTrades={allFarmerTrades}
							points={points}
							onView={t => {
								setActive(t)
								setMode('edit')
							}}
							onEdit={t => {
								setActive(t)
								setMode('edit')
							}}
							onDelete={handleDelete}
						/>
					)}
				</>
			)}
			{/* ===== FORM ===== */}
			{(mode === 'add' || mode === 'edit') && (
				<TradeOfPepperForm
					initial={active}
					points={sortedPoints}
					onCancel={() => {
						setActive(null)
						setMode('list')
					}}
					onSave={handleSave}
				/>
			)}
		</div>
	)
}
