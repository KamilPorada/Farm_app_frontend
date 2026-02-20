import { useEffect, useState } from 'react'
import SectionHeader from '../../components/ui/SectionHeader'
import TreatmentList from '../../components/TreatmentComponents/TreatmentList'
import TreatmentForm from '../../components/TreatmentComponents/TreatmentForm'
import type { Treatment } from '../../types/Treatment'
import type { Pesticide, PesticideType } from '../../types/Pesticide'
import { useAuthUser } from '../../hooks/useAuthUser'
import { MoonLoader } from 'react-spinners'
import { notify } from '../../utils/notify'
import { useMeData } from '../../hooks/useMeData'

export default function TreatmentPage() {
	const { user, getToken, isLoading } = useAuthUser()
	const { appSettings: globalSettings } = useMeData()
	const notificationsEnabled = globalSettings?.notificationsEnabled
	const { farmerTunnels } = useMeData() as unknown as {
		farmerTunnels: { year: number; count: number }[]
	}

	const [year, setYear] = useState(new Date().getFullYear())
	const [treatments, setTreatments] = useState<Treatment[]>([])
	const [types, setTypes] = useState<PesticideType[]>([])
	const [pesticides, setPesticides] = useState<Pesticide[]>([])
	const [mode, setMode] = useState<'list' | 'add' | 'edit' | 'details'>('list')
	const [active, setActive] = useState<Treatment | null>(null)
	const [activeTypeId, setActiveTypeId] = useState<number | null>(null)
	const [loading, setLoading] = useState(false)
	const tunnelsInActualSeason = farmerTunnels.find(t => t.year === year)?.count ?? 0

	const hasTreatments = treatments.length > 0

	function handleTypeChange(typeId: number | null) {
		setActiveTypeId(typeId)
	}

	/* =======================
	   FETCH LISTY
	======================= */
	useEffect(() => {
		if (!user?.id) return

		async function fetchTreatments() {
			setLoading(true)
			try {
				const token = await getToken()

				const res = await fetch(`http://localhost:8080/api/treatments/farmer/${user?.id}/${year}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})

				if (!res.ok) {
					notify(notificationsEnabled, 'error', 'Nie udało się pobrać zabiegów!')
					return
				}

				const data: Treatment[] = await res.json()
				setTreatments(data)
			} finally {
				setLoading(false)
			}
		}

		fetchTreatments()
	}, [user, year])

	/* =======================
	   SAVE (ADD / EDIT)
	======================= */
	async function handleSave(t: Treatment) {
		if (!user) return

		const token = await getToken()
		const isEdit = mode === 'edit'

		const payload = {
			...t,
			farmerId: user.id,
		}

		try {
			const res = await fetch(`http://localhost:8080/api/treatments${isEdit ? `/${t.id}` : ''}`, {
				method: isEdit ? 'PUT' : 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			})

			if (!res.ok) {
				notify(notificationsEnabled, 'error', isEdit ? 'Nie udało się zapisać zmian!' : 'Nie udało się dodać zabiegu!')
				return
			}

			const saved: Treatment = await res.json()

			setTreatments(prev => (isEdit ? prev.map(x => (x.id === saved.id ? saved : x)) : [...prev, saved]))

			notify(notificationsEnabled, 'success', isEdit ? 'Zabieg został zaktualizowany!' : 'Zabieg został dodany!')

			setMode('list')
			setActive(null)
		} catch {}
	}

	/* =======================
	   DELETE
	======================= */
	async function handleDelete(t: Treatment) {
		if (!user) return

		const token = await getToken()

		try {
			const res = await fetch(`http://localhost:8080/api/treatments/${t.id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (!res.ok) {
				notify(notificationsEnabled, 'error', 'Nie udało się usunąć zabiegu!')
				return
			}

			setTreatments(prev => prev.filter(x => x.id !== t.id))

			notify(notificationsEnabled, 'success', 'Zabieg został usunięty!')

			setMode('list')
		} catch {}
	}

	useEffect(() => {
		if (!user?.id) return

		async function fetchTypes() {
			const token = await getToken()

			const res = await fetch(`http://localhost:8080/api/pesticide-types?farmerId=${user?.id}`, {
				headers: { Authorization: `Bearer ${token}` },
			})

			const data: PesticideType[] = await res.json()
			setTypes(data)
		}

		fetchTypes()
	}, [user])

	useEffect(() => {
		if (!user?.id) return

		async function fetchPesticides() {
			const token = await getToken()

			const url = activeTypeId
				? `http://localhost:8080/api/pesticides/by-type/${activeTypeId}?farmerId=${user?.id}`
				: `http://localhost:8080/api/pesticides?farmerId=${user?.id}`

			const res = await fetch(url, {
				headers: { Authorization: `Bearer ${token}` },
			})

			const data: Pesticide[] = await res.json()
			setPesticides(data)
		}

		fetchPesticides()
	}, [user, activeTypeId])

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
				title='Zabiegi ochrony roślin'
				description='Zarządzaj zabiegami ochrony roślin w bieżącym sezonie'
				buttonTitle='Dodaj zabieg'
				year={year}
				setYear={setYear}
				onAdd={() => {
					setActive(null)
					setMode('add')
				}}
			/>

			{!hasTreatments && mode === 'list' ? (
				<div className='flex flex-col items-center justify-center py-24 text-center'>
					<p className='text-base font-medium text-gray-700'>Brak zapisanych zabiegów!</p>

					<p className='mt-2 text-sm text-gray-500 max-w-md'>
						Dodaj zabieg ochrony roślin, aby prowadzić historię oprysków i kontrolować ochronę upraw.
					</p>
				</div>
			) : (
				<>
					{mode === 'list' && (
						<TreatmentList
							items={treatments}
							pesticides={pesticides}
							types={types}
							onEdit={t => {
								setActive(t)
								setMode('edit')
							}}
							onDelete={handleDelete}
						/>
					)}
				</>
			)}

			{(mode === 'add' || mode === 'edit') && (
				<TreatmentForm
					initial={active}
					types={types}
					pesticides={pesticides}
					tunnelsInActualSeason={tunnelsInActualSeason}
					year={year}
					onTypeChange={handleTypeChange}
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
