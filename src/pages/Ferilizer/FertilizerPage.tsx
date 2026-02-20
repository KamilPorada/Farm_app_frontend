import { useEffect, useState } from 'react'
import SectionHeader from '../../components/ui/SectionHeader'
import FertilizerList from '../../components/FertilizerComponents/FertilizerList'
import FertilizerForm from '../../components/FertilizerComponents/FertilizerForm'
import type { Fertilizer } from '../../types/Fertilizer'
import { useAuthUser } from '../../hooks/useAuthUser'
import { MoonLoader } from 'react-spinners'
import { notify } from '../../utils/notify'
import { useMeData } from '../../hooks/useMeData'

export default function FertilizerPage() {
	const { user, getToken, isLoading } = useAuthUser()
	const { appSettings: globalSettings } = useMeData()
	const notificationsEnabled = globalSettings?.notificationsEnabled
	const [year, setYear] = useState(new Date().getFullYear())

	const [fertilizers, setFertilizers] = useState<Fertilizer[]>([])
	const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list')
	const [active, setActive] = useState<Fertilizer | null>(null)
	const [loading, setLoading] = useState(false)

	const hasItems = fertilizers.length > 0

	/* =======================
	   FETCH FERTILIZERS
	======================= */
	useEffect(() => {
		if (!user?.id) return

		async function fetchFertilizers() {
			setLoading(true)
			try {
				const token = await getToken()

				const res = await fetch(`http://localhost:8080/api/fertilizers/farmer/${user?.id}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})

				if (!res.ok) {
					notify(notificationsEnabled, 'error', 'Nie udało się pobrać nawozów!')
					return
				}

				const data: Fertilizer[] = await res.json()
				setFertilizers(data)
			} finally {
				setLoading(false)
			}
		}

		fetchFertilizers()
	}, [user])

	/* =======================
	   SAVE (ADD / EDIT)
	======================= */
	async function handleSave(f: Fertilizer) {
		if (!user) return

		const isEdit = mode === 'edit'

		const exists = fertilizers.some(
			item => item.name.trim().toLowerCase() === f.name.trim().toLowerCase() && (!isEdit || item.id !== f.id),
		)

		if (exists) {
			notify(notificationsEnabled, 'info', 'Nawóz o tej nazwie już istnieje.')
			return
		}

		const token = await getToken()

		try {
			const res = await fetch(`http://localhost:8080/api/fertilizers${isEdit ? `/${f.id}` : `/${user.id}`}`, {
				method: isEdit ? 'PUT' : 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(f),
			})

			if (!res.ok) {
				notify(notificationsEnabled, 'error', isEdit ? 'Nie udało się zapisać zmian!' : 'Nie udało się dodać nawozu!')
				return
			}

			const saved: Fertilizer = await res.json()

			setFertilizers(prev => (isEdit ? prev.map(x => (x.id === saved.id ? saved : x)) : [...prev, saved]))

			notify(notificationsEnabled, 'success', isEdit ? 'Nawóz został zaktualizowany!' : 'Nawóz został dodany!')

			setMode('list')
			setActive(null)
		} catch (err) {}
	}

	/* =======================
	   DELETE
	======================= */
	async function handleDelete(f: Fertilizer) {
		if (!user) return

		const token = await getToken()

		try {
			const res = await fetch(`http://localhost:8080/api/fertilizers/${f.id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (!res.ok) {
				notify(notificationsEnabled, 'error', 'Nie udało się usunąć nawozu!')
				return
			}

			setFertilizers(prev => prev.filter(x => x.id !== f.id))

			notify(notificationsEnabled, 'success', 'Nawóz został usunięty!')
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
			<SectionHeader
				title='Nawozy'
				description='Zarządzaj nawozami używanymi w gospodarstwie przy uprawie papryki'
				buttonTitle='Dodaj nawóz'
				year={year}
				setYear={setYear}
				onAdd={() => {
					setActive(null)
					setMode('add')
				}}
			/>

			{!hasItems && mode === 'list' ? (
				<div className='flex flex-col items-center justify-center py-24 text-center'>
					<p className='text-base font-medium text-gray-700'>Brak nawozów</p>

					<p className='mt-2 text-sm text-gray-500 max-w-md'>Dodaj nawozy, aby rozpocząć zarządzanie nawożeniem.</p>
				</div>
			) : (
				<>
					{mode === 'list' && (
						<FertilizerList
							items={fertilizers}
							onEdit={f => {
								setActive(f)
								setMode('edit')
							}}
							onDelete={handleDelete}
						/>
					)}
				</>
			)}

			{(mode === 'add' || mode === 'edit') && (
				<FertilizerForm
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
