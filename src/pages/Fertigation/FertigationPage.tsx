import { useEffect, useState } from 'react'
import SectionHeader from '../../components/ui/SectionHeader'
import FertigationList from '../../components/FertigationComponents/FertigationList'
import FertigationForm from '../../components/FertigationComponents/FertigationForm'
import FertilizerUsageTable from '../../components/FertigationComponents/FertilizerUsageTable'
import FertigationSummary from '../../components/FertigationComponents/FertigationSummary'
import type { Fertigation } from '../../types/Fertigation'
import type { Fertilizer } from '../../types/Fertilizer'
import { useAuthUser } from '../../hooks/useAuthUser'
import { MoonLoader } from 'react-spinners'
import { notify } from '../../utils/notify'
import { useMeData } from '../../hooks/useMeData'
import { useFormatUtils } from '../../hooks/useFormatUtils'

export default function FertigationPage() {
	const { user, getToken, isLoading } = useAuthUser()
	const { appSettings: globalSettings } = useMeData()
	const notificationsEnabled = globalSettings?.notificationsEnabled
	const { userCurrency, toEURO } = useFormatUtils()

	const { farmerTunnels } = useMeData() as unknown as {
		farmerTunnels: { year: number; count: number }[]
	}

	const [year, setYear] = useState(new Date().getFullYear())

	const [fertigations, setFertigations] = useState<Fertigation[]>([])
	const [fertilizers, setFertilizers] = useState<Fertilizer[]>([])

	const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list')
	const [active, setActive] = useState<Fertigation | null>(null)

	// 🔥 widok sekcji
	const [view, setView] = useState<'fertigation' | 'usage'>('fertigation')

	const [loading, setLoading] = useState(false)

	const tunnelsInActualSeason = farmerTunnels.find(t => t.year === year)?.count ?? 0

	const hasItems = fertigations.length > 0

	/* =======================
	   ZAPAMIĘTYWANIE WIDOKU
	======================= */
	useEffect(() => {
		const saved = localStorage.getItem('fertigationView')
		if (saved === 'fertigation' || saved === 'usage') {
			setView(saved)
		}
	}, [])

	useEffect(() => {
		localStorage.setItem('fertigationView', view)
	}, [view])

	/* =======================
	   FETCH FERTIGATIONS
	======================= */
	async function fetchFertigations() {
		setLoading(true)
		try {
			const token = await getToken()

			const res = await fetch(`http://localhost:8080/api/fertigations/season/${year}`, {
				headers: {
					Authorization: `Bearer ${token}`,
					farmerId: String(user?.id),
				},
			})

			if (!res.ok) {
				notify(notificationsEnabled, 'error', 'Nie udało się pobrać fertygacji!')
				return
			}

			const data: Fertigation[] = await res.json()
			setFertigations(data)
		} finally {
			setLoading(false)
		}
	}

	/* =======================
	   FETCH FERTILIZERS
	======================= */
	async function fetchFertilizers() {
		setLoading(true)
		try {
			const token = await getToken()

			const res = await fetch(`http://localhost:8080/api/fertilizers/farmer/${user?.id}/season/${year}`, {
				headers: { Authorization: `Bearer ${token}` },
			})

			if (!res.ok) {
				notify(notificationsEnabled, 'error', 'Nie udało się pobrać nawozów!')
				return
			}

			const data: Fertilizer[] = await res.json()

			const converted = data.map(f => ({
				...f,
				price: typeof f.price === 'number' ? (userCurrency === 'EUR' ? toEURO(f.price) : f.price) : null,
			}))

			setFertilizers(converted)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (!user || !globalSettings) return
		fetchFertigations()
		fetchFertilizers()
	}, [year, user, globalSettings])

	/* =======================
	   SAVE
	======================= */
	async function handleSave(f: Fertigation) {
		if (!user) return

		const isEdit = mode === 'edit'
		const token = await getToken()

		try {
			const res = await fetch(`http://localhost:8080/api/fertigations${isEdit ? `/${f.id}` : ``}`, {
				method: isEdit ? 'PUT' : 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
					farmerId: String(user.id),
				},
				body: JSON.stringify(f),
			})

			if (!res.ok) {
				notify(
					notificationsEnabled,
					'error',
					isEdit ? 'Nie udało się zapisać zmian!' : 'Nie udało się dodać fertygacji!',
				)
				return
			}

			await fetchFertigations()

			notify(
				notificationsEnabled,
				'success',
				isEdit ? 'Fertygacja została zaktualizowana!' : 'Fertygacja została dodana!',
			)

			setMode('list')
			setActive(null)
		} catch {}
	}

	/* =======================
	   DELETE
	======================= */
	async function handleDelete(f: Fertigation) {
		if (!user) return

		const token = await getToken()

		try {
			const res = await fetch(`http://localhost:8080/api/fertigations/${f.id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
					farmerId: String(user.id),
				},
			})

			if (!res.ok) {
				notify(notificationsEnabled, 'error', 'Nie udało się usunąć fertygacji!')
				return
			}

			setFertigations(prev => prev.filter(x => x.id !== f.id))
			notify(notificationsEnabled, 'success', 'Fertygacja została usunięta!')
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
			<SectionHeader
				title='Fertygacja'
				description='Rejestruj fertygacje oraz kontroluj nawożenie w tunelach'
				buttonTitle='Dodaj fertygację'
				year={year}
				setYear={setYear}
				onAdd={() => {
					setActive(null)
					setMode('add')
				}}
			/>

			{/* brak danych */}
			{!hasItems && mode === 'list' ? (
				<div className='flex flex-col items-center justify-center py-24 text-center'>
					<p className='text-base font-medium text-gray-700'>Brak fertygacji</p>
					<p className='mt-2 text-sm text-gray-500 max-w-md'>
						Dodaj pierwszą fertygację, aby rozpocząć kontrolę nawożenia.
					</p>
				</div>
			) : (
				mode === 'list' && (
					<>
						{/* Kafelki */}
						{fertigations.length > 0 && <FertigationSummary fertigations={fertigations} fertilizers={fertilizers} />}

						{/* Przełącznik widoków */}
						<div className='flex gap-2 mt-6 mb-4'>
							<button
								onClick={() => setView('fertigation')}
								className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer
								${view === 'fertigation' ? 'bg-mainColor text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
								`}>
								Fertygacje ({fertigations.length})
							</button>

							<button
								onClick={() => setView('usage')}
								className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer
								${view === 'usage' ? 'bg-mainColor text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
								`}>
								Zużycie nawozów
							</button>
						</div>

						{/* Widoki */}
						{view === 'fertigation' && (
							<FertigationList
								items={fertigations}
								fertilizers={fertilizers}
								onEdit={f => {
									setActive(f)
									setMode('edit')
								}}
								onDelete={handleDelete}
							/>
						)}

						{view === 'usage' && (
							<FertilizerUsageTable
								fertigations={fertigations}
								fertilizers={fertilizers}
								tunnelsInSeason={tunnelsInActualSeason}
							/>
						)}
					</>
				)
			)}

			{/* formularz */}
			{(mode === 'add' || mode === 'edit') && (
				<FertigationForm
					initial={active}
					fertilizers={fertilizers}
					tunnelsInActualSeason={tunnelsInActualSeason}
					year={year}
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
