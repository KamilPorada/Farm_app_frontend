import { useEffect, useState, useMemo } from 'react'
import SectionHeader from '../../components/ui/SectionHeader'
import ConfirmDeleteModal from '../../components/PointOfSaleComponents/ConfirmDeleteModal'
import VarietySeasonForm from '../../components/VarietySeasonComponents/VarietySeasonForm'
import VarietySeasonCard from '../../components/VarietySeasonComponents/VarietySeasonCard'
import NoAvailableTunnelsModal from '../../components/VarietySeasonComponents/NoAvailableTunnelsModal'

import type { VarietySeason } from '../../types/VarietySeason'

import { useAuthUser } from '../../hooks/useAuthUser'
import { MoonLoader } from 'react-spinners'
import { notify } from '../../utils/notify'
import { useMeData } from '../../hooks/useMeData'

export default function VarietySeasonPage() {
	const { user, getToken, isLoading } = useAuthUser()
	const { appSettings, farmerTunnels } = useMeData()
	const notificationsEnabled = appSettings?.notificationsEnabled

	const [year, setYear] = useState(new Date().getFullYear())
	const [varietySeason, setVarietySeason] = useState<VarietySeason[]>([])
	const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list')
	const [toDelete, setToDelete] = useState<VarietySeason | null>(null)
	const [active, setActive] = useState<VarietySeason | null>(null)
	const [showNoTunnelsModal, setShowNoTunnelsModal] = useState(false)
	const [loading, setLoading] = useState(false)

	const totalTunnels = useMemo(() => {
		const found = farmerTunnels?.find(t => Number(t.year) === Number(year))

		return found ? Number(found.count) : 0
	}, [farmerTunnels, year])

	const usedTunnels = useMemo(() => {
		return varietySeason.reduce((sum, v) => sum + Number(v.tunnelCount), 0)
	}, [varietySeason])

	const sortedVarieties = useMemo(() => {
		return [...varietySeason].sort((a, b) => Number(b.tunnelCount) - Number(a.tunnelCount))
	}, [varietySeason])

	const hasVarieties = varietySeason.length > 0

	useEffect(() => {
		const loadVarieties = async () => {
			if (!user) return

			try {
				setLoading(true)
				const token = await getToken()

				const res = await fetch(`http://localhost:8080/api/varieties/${user.id}/${year}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})

				if (!res.ok) throw new Error('Błąd pobierania odmian')

				const data = await res.json()
				setVarietySeason(data)
			} catch (err: any) {
				notify(notificationsEnabled, 'error', err.message || 'Błąd pobierania odmian')
			} finally {
				setLoading(false)
			}
		}

		loadVarieties()
	}, [user, year])

	const handleCreate = async (data: Omit<VarietySeason, 'id'>) => {
		try {
			const token = await getToken()

			const res = await fetch(`http://localhost:8080/api/varieties/${user?.id}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					...data,
					seasonYear: year,
				}),
			})

			if (!res.ok) throw new Error('Błąd dodawania odmiany')

			const created = await res.json()

			setVarietySeason(prev => [...prev, created])
			setMode('list')

			notify(notificationsEnabled, 'success', 'Odmiana została dodana')
		} catch (err: any) {
			notify(notificationsEnabled, 'error', err.message || 'Błąd dodawania odmiany')
		}
	}

	const handleUpdate = async (id: number, data: Omit<VarietySeason, 'id'>) => {
		try {
			const token = await getToken()

			const res = await fetch(`http://localhost:8080/api/varieties/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					...data,
					seasonYear: year,
				}),
			})

			if (!res.ok) throw new Error('Błąd edycji odmiany')

			const updated = await res.json()

			setVarietySeason(prev => prev.map(v => (v.id === id ? updated : v)))

			setMode('list')
			setActive(null)

			notify(notificationsEnabled, 'success', 'Odmiana została zaktualizowana')
		} catch (err: any) {
			notify(notificationsEnabled, 'error', err.message || 'Błąd edycji odmiany')
		}
	}

	const handleDelete = async () => {
		if (!toDelete) return

		try {
			const token = await getToken()

			const res = await fetch(`http://localhost:8080/api/varieties/${toDelete.id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (!res.ok) throw new Error('Błąd usuwania odmiany')

			setVarietySeason(prev => prev.filter(v => v.id !== toDelete.id))

			setToDelete(null)

			notify(notificationsEnabled, 'success', 'Odmiana została usunięta')
		} catch (err: any) {
			notify(notificationsEnabled, 'error', err.message || 'Błąd usuwania odmiany')
		}
	}

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
				title='Odmiany'
				description='Zarządzaj odmianami papryki w wybranym sezonie oraz kontroluj liczbę tuneli przypisanych do każdej odmiany.'
				buttonTitle='Dodaj odmianę'
				year={year}
				setYear={setYear}
				onAdd={() => {
					if (totalTunnels - usedTunnels <= 0) {
						setShowNoTunnelsModal(true)
						return
					}

					setActive(null)
					setMode('add')
				}}
			/>

			{mode === 'add' && (
				<VarietySeasonForm
					initial={null}
					totalTunnels={totalTunnels}
					usedTunnels={usedTunnels}
					onSave={handleCreate}
					onCancel={() => setMode('list')}
				/>
			)}

			{mode === 'edit' && active && (
				<VarietySeasonForm
					initial={active}
					totalTunnels={totalTunnels}
					usedTunnels={usedTunnels}
					onSave={data => handleUpdate(active.id, data)}
					onCancel={() => {
						setMode('list')
						setActive(null)
					}}
				/>
			)}

			{toDelete && (
				<ConfirmDeleteModal
					title='Usuń odmianę'
					description={`Czy na pewno chcesz usunąć odmianę "${toDelete.name}"?`}
					onConfirm={handleDelete}
					onCancel={() => setToDelete(null)}
				/>
			)}

			{mode === 'list' && !hasVarieties ? (
				<div className='flex flex-col items-center justify-center py-24 text-center'>
					<p className='text-base font-medium text-gray-700'>Brak odmian w wybranym sezonie!</p>

					<p className='mt-2 max-w-md text-sm text-gray-500'>
						Dla wybranego roku nie dodano jeszcze żadnych odmian. Kliknij przycisk „Dodaj odmianę”, aby rozpocząć
						zarządzanie odmianami w tym sezonie.
					</p>
				</div>
			) : mode === 'list' ? (
				<div className='mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
					{sortedVarieties.map(v => (
						<VarietySeasonCard
							key={v.id}
							variety={v}
							totalTunnels={totalTunnels}
							onEdit={item => {
								setActive(item)
								setMode('edit')
							}}
							onDelete={item => setToDelete(item)}
						/>
					))}
				</div>
			) : null}

			{showNoTunnelsModal && <NoAvailableTunnelsModal onClose={() => setShowNoTunnelsModal(false)} />}
		</div>
	)
}
