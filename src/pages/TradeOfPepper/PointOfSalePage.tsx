import { useEffect, useState, useMemo } from 'react'
import PointOfSaleHeader from '../../components/PointOfSaleComponents/PointOfSaleHeader'
import PointOfSaleList from '../../components/PointOfSaleComponents/PointOfSaleList'
import PointOfSaleForm from '../../components/PointOfSaleComponents/PointOfSaleForm'
import PointOfSaleDetails from '../../components/PointOfSaleComponents/PointOfSaleDetails'
import type { PointOfSale } from '../../types/PointOfSale'
import type { TradeOfPepper } from '../../types/TradeOfPepper'
import { useAuthUser } from '../../hooks/useAuthUser'
import { MoonLoader } from 'react-spinners'
import { notify } from '../../utils/notify'
import { useMeData } from '../../hooks/useMeData'

export default function PointOfSalePage() {
	const { user, getToken, isLoading } = useAuthUser()
	const { appSettings: globalSettings } = useMeData()
	const notificationsEnabled = globalSettings?.notificationsEnabled
	const [allFarmerTrades, setAllFarmerTrades] = useState<TradeOfPepper[]>([])

	const [year, setYear] = useState(new Date().getFullYear())
	const [points, setPoints] = useState<PointOfSale[]>([])
	const [mode, setMode] = useState<'list' | 'add' | 'edit' | 'details'>('list')
	const [active, setActive] = useState<PointOfSale | null>(null)
	const [loading, setLoading] = useState(false)

	const hasPoints = points.length > 0

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

	/* =======================
	   FETCH LISTY
	======================= */
	useEffect(() => {
		if (!user?.id) return

		async function fetchPoints() {
			setLoading(true)
			try {
				const token = await getToken()

				const res = await fetch(`http://localhost:8080/api/points-of-sale/farmer/${user?.id}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})

				if (!res.ok) {
					notify(notificationsEnabled, 'error', 'Nie udało się pobrać punktów sprzedaży!')
					return
				}

				const data: PointOfSale[] = await res.json()
				setPoints(data)
			} catch (err) {
			} finally {
				setLoading(false)
			}
		}

		fetchPoints()
	}, [user, year])

	/* =======================
	   SAVE (ADD / EDIT)
	======================= */
	async function handleSave(p: PointOfSale) {
		if (!user) return

		const token = await getToken()
		const isEdit = mode === 'edit'

		const payload = {
			...p,
			farmerId: user.id,
		}

		try {
			const res = await fetch(`http://localhost:8080/api/points-of-sale${isEdit ? `/${p.id}` : ''}`, {
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
					isEdit ? 'Nie udało się zapisać zmian!' : 'Nie udało się dodać punktu sprzedaży!',
				)
				return
			}

			const saved: PointOfSale = await res.json()

			setPoints(prev => (isEdit ? prev.map(x => (x.id === saved.id ? saved : x)) : [...prev, saved]))

			notify(
				notificationsEnabled,
				'success',
				isEdit ? 'Dane punktu sprzedaży zostały pomyślnie edytowane!' : 'Utworzono pomyślnie nowy punkt sprzedaży!',
			)

			setMode('list')
			setActive(null)
		} catch (err) {}
	}

	/* =======================
	   DELETE
	======================= */
	async function handleDelete(p: PointOfSale) {
		if (!user) return

		const token = await getToken()

		try {
			const res = await fetch(`http://localhost:8080/api/points-of-sale/${p.id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (!res.ok) {
				notify(notificationsEnabled, 'error', 'Nie udało się usunąć punktu sprzedaży!')
				return
			}

			setPoints(prev => prev.filter(x => x.id !== p.id))

			notify(notificationsEnabled, 'success', 'Punkt sprzedaży został usunięty pomyślnie!')

			setMode('list')
		} catch (err) {}
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
			<PointOfSaleHeader
				year={year}
				setYear={setYear}
				onAdd={() => {
					setActive(null)
					setMode('add')
				}}
			/>

			{!hasPoints && mode === 'list' ? (
				<div className='flex flex-col items-center justify-center py-24 text-center'>
					<p className='text-base font-medium text-gray-700'>Brak punktów sprzedaży!</p>

					<p className='mt-2 text-sm text-gray-500 max-w-md'>
						Dodaj punkt sprzedaży, aby rozpocząć organizację i późniejszą analizę sprzedaży.
					</p>
				</div>
			) : (
				<>
					{mode === 'list' && (
						<PointOfSaleList
							items={points}
							onView={p => {
								setActive(p)
								setMode('details')
							}}
							onEdit={p => {
								setActive(p)
								setMode('edit')
							}}
							onDelete={handleDelete}
						/>
					)}

					{mode === 'details' && active && (
						<PointOfSaleDetails
							point={active}
							onBack={() => {
								setActive(null)
								setMode('list')
							}}
						/>
					)}
				</>
			)}
			{(mode === 'add' || mode === 'edit') && (
				<PointOfSaleForm
					initial={active}
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
