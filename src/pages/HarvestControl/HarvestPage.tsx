import { useEffect, useState, useMemo } from 'react'
import SectionHeader from '../../components/ui/SectionHeader'
import ConfirmDeleteModal from '../../components/PointOfSaleComponents/ConfirmDeleteModal'
import HarvestDayForm from '../../components/HarvestComponents/HarvestDayForm'
import NoVarietiesForYearModal from '../../components/HarvestComponents/NoVarietiesForYearModal'
import HarvestList from '../../components/HarvestComponents/HarvestList'
import HarvestSummary from '../../components/HarvestComponents/HarvestSummary'
import HarvestKpiCards from '../../components/HarvestComponents/HarvestKpiCards'

import type { Harvest } from '../../types/Harvest'
import type { VarietySeason } from '../../types/VarietySeason'

import { useAuthUser } from '../../hooks/useAuthUser'
import { MoonLoader } from 'react-spinners'
import { notify } from '../../utils/notify'
import { useMeData } from '../../hooks/useMeData'

export default function HarvestPage() {
	const { user, getToken, isLoading } = useAuthUser()
	const { appSettings } = useMeData()
	const notificationsEnabled = appSettings?.notificationsEnabled

	const [year, setYear] = useState(new Date().getFullYear())
	const [harvests, setHarvests] = useState<Harvest[]>([])
	const [varieties, setVarieties] = useState<VarietySeason[]>([])
	const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list')
	const [toDelete, setToDelete] = useState<Harvest | null>(null)
	const [showNoVarietiesModal, setShowNoVarietiesModal] = useState(false)
	const [loading, setLoading] = useState(false)
	const hasHarvests = harvests.length > 0

	/* =======================
	   FETCH HARVESTS (YEAR)
	======================= */
	useEffect(() => {
		const loadHarvests = async () => {
			if (!user) return

			try {
				setLoading(true)
				const token = await getToken()

				const res = await fetch(`http://localhost:8080/api/harvests/${user.id}/${year}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})

				if (!res.ok) throw new Error('Błąd pobierania zbiorów')

				const data = await res.json()
				setHarvests(data)
			} catch (err: any) {
				notify(notificationsEnabled, 'error', err.message)
			} finally {
				setLoading(false)
			}
		}

		loadHarvests()
	}, [user, year])

	/* =======================
	   FETCH VARIETIES (YEAR)
	======================= */
	useEffect(() => {
		const loadVarieties = async () => {
			if (!user) return

			try {
				const token = await getToken()

				const res = await fetch(`http://localhost:8080/api/varieties/${user.id}/${year}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})

				if (!res.ok) throw new Error('Błąd pobierania odmian')

				const data = await res.json()
				setVarieties(data)
			} catch (err: any) {
				notify(notificationsEnabled, 'error', err.message)
			}
		}

		loadVarieties()
	}, [user, year])

	/* =======================
	   HARVESTY DLA WYBRANEGO DNIA
	======================= */

	/* =======================
	   BATCH SAVE (CREATE + UPDATE)
	======================= */
	const handleBatchSave = async (dayHarvestsPayload: Omit<Harvest, 'id'>[]) => {
		if (!user) return

		try {
			const token = await getToken()

			await Promise.all(
				dayHarvestsPayload.map(async h => {
					const existing = harvests.find(
						x => x.varietySeasonId === h.varietySeasonId && x.harvestDate === h.harvestDate,
					)

					if (existing) {
						const res = await fetch(`http://localhost:8080/api/harvests/${existing.id}`, {
							method: 'PUT',
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${token}`,
							},
							body: JSON.stringify(h),
						})

						if (!res.ok) throw new Error('Błąd aktualizacji')
					} else {
						const res = await fetch(`http://localhost:8080/api/harvests/${user.id}`, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${token}`,
							},
							body: JSON.stringify(h),
						})

						if (!res.ok) throw new Error('Błąd dodawania')
					}
				}),
			)

			notify(notificationsEnabled, 'success', 'Zbiory zapisane')

			setMode('list')

			// refresh
			const refreshed = await fetch(`http://localhost:8080/api/harvests/${user.id}/${year}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (!refreshed.ok) throw new Error('Błąd odświeżania')

			const refreshedData = await refreshed.json()
			setHarvests(refreshedData)
		} catch {
			notify(notificationsEnabled, 'error', 'Błąd zapisu zbiorów')
		}
	}

	/* =======================
	   DELETE
	======================= */
	const handleDelete = async () => {
		if (!toDelete) return

		try {
			const token = await getToken()

			const res = await fetch(`http://localhost:8080/api/harvests/${toDelete.id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (!res.ok) throw new Error('Błąd usuwania')

			setHarvests(prev => prev.filter(h => h.id !== toDelete.id))

			setToDelete(null)
			notify(notificationsEnabled, 'success', 'Usunięto zbiór')
		} catch {
			notify(notificationsEnabled, 'error', 'Błąd usuwania')
		}
	}

	/* =======================
   UPDATE (INLINE EDIT)
======================= */
	const handleUpdate = async (updatedHarvest: Harvest) => {
		if (!user) return

		try {
			const token = await getToken()

			const res = await fetch(`http://localhost:8080/api/harvests/${updatedHarvest.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(updatedHarvest),
			})

			if (!res.ok) throw new Error('Błąd aktualizacji')

			// 🔥 aktualizacja lokalnego state bez refetch
			setHarvests(prev => prev.map(h => (h.id === updatedHarvest.id ? updatedHarvest : h)))

			notify(notificationsEnabled, 'success', 'Zaktualizowano zbiór')
		} catch {
			notify(notificationsEnabled, 'error', 'Błąd aktualizacji')
		}
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
			<SectionHeader
				title='Zbiory'
				description='Rejestruj dzienne zbiory papryki w wybranym roku.'
				buttonTitle='Dodaj zbiory'
				year={year}
				setYear={setYear}
				onAdd={() => {
					if (varieties.length === 0) {
						setShowNoVarietiesModal(true)
						return
					}

					setMode('add')
				}}
			/>

			{/* FORM */}
			{(mode === 'add' || mode === 'edit') && (
				<HarvestDayForm
					allHarvests={harvests}
					varieties={varieties}
					year={year}
					onSave={handleBatchSave}
					onCancel={() => setMode('list')}
				/>
			)}

			{/* LISTA ZBIORÓW */}
			{mode === 'list' && (
				<>
					{harvests.length === 0 ? (
						<div className='flex flex-col items-center justify-center py-24 text-center'>
							<p className='text-base font-medium text-gray-700'>Brak zbiorów w wybranym roku</p>

							<p className='mt-2 text-sm text-gray-500 max-w-md'>
								W wybranym sezonie nie zarejestrowano jeszcze żadnych zbiorów. Kliknij „Dodaj zbiory”, aby rozpocząć
								ewidencję.
							</p>
						</div>
					) : (
						<div className='flex flex-col gap-5 mt-5'>
							<HarvestKpiCards
								harvests={harvests}
								varieties={varieties}
								boxWeightKg={Number(appSettings?.boxWeightKg ?? 0)}
							/>

							<div className='flex flex-col md:flex-row gap-5'>
								<HarvestSummary
									harvests={harvests}
									varieties={varieties}
									boxWeightKg={Number(appSettings?.boxWeightKg ?? 0)}
								/>
								<HarvestList
									harvests={harvests}
									varieties={varieties}
									onDelete={item => setToDelete(item)}
									onUpdate={handleUpdate}
								/>
							</div>
						</div>
					)}
				</>
			)}

			{/* DELETE */}
			{toDelete && (
				<ConfirmDeleteModal
					title='Usuń zbiór'
					description='Czy na pewno chcesz usunąć ten wpis?'
					onConfirm={handleDelete}
					onCancel={() => setToDelete(null)}
				/>
			)}

			{/* BRAK ODMIAN */}
			{showNoVarietiesModal && <NoVarietiesForYearModal onClose={() => setShowNoVarietiesModal(false)} />}
		</div>
	)
}
