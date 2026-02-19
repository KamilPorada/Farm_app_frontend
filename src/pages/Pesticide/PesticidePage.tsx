import { useEffect, useState } from 'react'
import SectionHeader from '../../components/ui/SectionHeader'
import PesticideTypeHeader from '../../components/PesticideComponents/PesticideTypeHeader'
import PesticideTypeFormModal from '../../components/PesticideComponents/PesticideTypeFormModal'
import ConfirmDeletePesticideTypeModal from '../../components/PesticideComponents/ConfirmDeletePesticideType'
import PesticideTypeManageModal from '../../components/PesticideComponents/PesticideTypeManageModal'
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal'
import PesticideForm from '../../components/PesticideComponents/PesticideForm'
import PesticideList from '../../components/PesticideComponents/PesticideList'
import type { Pesticide, PesticideType } from '../../types/Pesticide'
import { useAuthUser } from '../../hooks/useAuthUser'
import { MoonLoader } from 'react-spinners'
import { notify } from '../../utils/notify'
import { useMeData } from '../../hooks/useMeData'

export default function PesticidePage() {
	const { user, getToken, isLoading } = useAuthUser()
	const { appSettings: globalSettings } = useMeData()
	const notificationsEnabled = globalSettings?.notificationsEnabled

	const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list')
	const [active, setActive] = useState<Pesticide | null>(null)
	const [year, setYear] = useState(new Date().getFullYear())

	const [pesticides, setPesticides] = useState<Pesticide[]>([])
	const [types, setTypes] = useState<PesticideType[]>([])
	const [activeTypeId, setActiveTypeId] = useState<number | null>(null)

	const [showTypeFormModal, setShowTypeFormModal] = useState(false)
	const [showManageModal, setShowManageModal] = useState(false)
	const [showDeleteModal, setShowDeleteModal] = useState(false)

	const [editingType, setEditingType] = useState<PesticideType | null>(null)
	const [deletingType, setDeletingType] = useState<PesticideType | null>(null)
	const [toDeletePesticide, setToDeletePesticide] = useState<Pesticide | null>(null)

	const [loading, setLoading] = useState(false)

	const hasItems = pesticides.length > 0

	/* =======================
	   CREATE TYPE
	======================= */
	async function handleCreateType(data: { name: string }) {
		if (!user) return
		setLoading(true)

		try {
			const token = await getToken()

			const res = await fetch(`http://localhost:8080/api/pesticide-types?farmerId=${user.id}`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			})

			if (!res.ok) {
				notify(notificationsEnabled, 'error', 'Nie udało się dodać typu środka!')
				return
			}

			const saved: PesticideType = await res.json()
			setTypes(prev => [...prev, saved])
			setActiveTypeId(saved.id)
			setShowTypeFormModal(false)

			notify(notificationsEnabled, 'success', 'Typ środka dodany!')
		} finally {
			setLoading(false)
		}
	}

	async function handleUpdateType(data: { name: string }) {
		if (!editingType || !user) return
		setLoading(true)

		try {
			const token = await getToken()

			const res = await fetch(`http://localhost:8080/api/pesticide-types/${editingType.id}?farmerId=${user.id}`, {
				method: 'PUT',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			})

			if (!res.ok) {
				notify(notificationsEnabled, 'error', 'Nie udało się zapisać zmian')
				return
			}

			const updated: PesticideType = await res.json()
			setTypes(prev => prev.map(t => (t.id === updated.id ? updated : t)))

			setEditingType(null)
			setShowTypeFormModal(false)

			notify(notificationsEnabled, 'success', 'Typ zaktualizowany!')
		} finally {
			setLoading(false)
		}
	}

	async function handleDeleteType() {
		if (!deletingType || !user) return
		setLoading(true)

		try {
			const token = await getToken()

			const res = await fetch(`http://localhost:8080/api/pesticide-types/${deletingType.id}?farmerId=${user.id}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			})

			if (!res.ok) {
				notify(notificationsEnabled, 'error', 'Nie można usunąć typu')
				return
			}

			setTypes(prev => prev.filter(t => t.id !== deletingType.id))

			if (activeTypeId === deletingType.id) {
				setActiveTypeId(null)
			}

			setDeletingType(null)
			setShowDeleteModal(false)

			notify(notificationsEnabled, 'success', 'Typ usunięty!')
		} finally {
			setLoading(false)
		}
	}

	/* =======================
	   SAVE PESTICIDE
	======================= */
	async function handleSavePesticide(data: Pesticide) {
		if (!user) return
		setLoading(true)

		try {
			const token = await getToken()
			const isEdit = data.id !== 0

			const url = isEdit
				? `http://localhost:8080/api/pesticides/${data.id}?farmerId=${user.id}`
				: `http://localhost:8080/api/pesticides?farmerId=${user.id}`

			const res = await fetch(url, {
				method: isEdit ? 'PUT' : 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			})

			if (!res.ok) {
				notify(notificationsEnabled, 'error', 'Nie udało się zapisać środka')
				return
			}

			const saved: Pesticide = await res.json()

			setPesticides(prev => (isEdit ? prev.map(p => (p.id === saved.id ? saved : p)) : [...prev, saved]))

			notify(notificationsEnabled, 'success', isEdit ? 'Środek zaktualizowany' : 'Środek dodany')

			setMode('list')
			setActive(null)
		} finally {
			setLoading(false)
		}
	}

	async function handleDeletePesticide(item: Pesticide) {
		if (!user) return
		setLoading(true)

		try {
			const token = await getToken()

			await fetch(`http://localhost:8080/api/pesticides/${item.id}?farmerId=${user.id}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			})

			setPesticides(prev => prev.filter(p => p.id !== item.id))
			notify(notificationsEnabled, 'success', 'Środek usunięty')
		} finally {
			setLoading(false)
		}
	}

	/* =======================
	   FETCH TYPES
	======================= */
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

	/* =======================
	   FETCH PESTICIDES
	======================= */
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
				title='Środki ochrony roślin'
				description='Zarządzaj środkami ochrony roślin oraz ich typami.'
				buttonTitle='Dodaj środek'
				year={year}
				setYear={setYear}
				onAdd={() => {
					setActive(null)
					setMode('add')
				}}
			/>

			<div className='mt-6'>
				<PesticideTypeHeader
					types={types}
					activeTypeId={activeTypeId}
					onSelect={setActiveTypeId}
					onAdd={() => {
						setEditingType(null)
						setShowTypeFormModal(true)
					}}
					onManage={() => setShowManageModal(true)}
				/>
			</div>

			{showTypeFormModal && (
				<PesticideTypeFormModal
					initial={
						editingType
							? {
									name: editingType.name,
									icon: editingType.icon ?? null,
								}
							: undefined
					}
					onClose={() => {
						setEditingType(null)
						setShowTypeFormModal(false)
					}}
					onSubmit={editingType ? handleUpdateType : handleCreateType}
				/>
			)}

			{showManageModal && (
				<PesticideTypeManageModal
					types={types}
					onClose={() => setShowManageModal(false)}
					onEdit={type => {
						setShowManageModal(false)
						setEditingType(type)
						setShowTypeFormModal(true)
					}}
					onDelete={type => {
						setShowManageModal(false)
						setDeletingType(type)
						setShowDeleteModal(true)
					}}
				/>
			)}

			{showDeleteModal && deletingType && (
				<ConfirmDeletePesticideTypeModal
					typeName={deletingType.name}
					onCancel={() => {
						setDeletingType(null)
						setShowDeleteModal(false)
					}}
					onConfirm={handleDeleteType}
				/>
			)}

			{mode !== 'list' && (
				<PesticideForm
					initial={active}
					types={types}
					onSave={handleSavePesticide}
					onCancel={() => {
						setMode('list')
						setActive(null)
					}}
				/>
			)}

			{!hasItems && mode === 'list' ? (
				<div className='flex flex-col items-center justify-center py-24 text-center'>
					<p className='text-base font-medium text-gray-700'>Brak zapisanych środków ochrony roślin</p>

					<p className='mt-2 text-sm text-gray-500 max-w-md'>
						Nie dodano jeszcze żadnych środków. Dodaj pierwszy preparat, aby rozpocząć zarządzanie ochroną roślin w
						gospodarstwie.
					</p>
				</div>
			) : (
				<>
					{/* ===== LISTA ŚRODKÓW ===== */}
					{mode === 'list' && (
						<PesticideList
							items={pesticides}
							types={types}
							onEdit={item => {
								setActive(item)
								setMode('edit')
							}}
							onDelete={item => setToDeletePesticide(item)}
						/>
					)}
				</>
			)}

			{toDeletePesticide && (
				<ConfirmDeleteModal
					onCancel={() => setToDeletePesticide(null)}
					onConfirm={async () => {
						await handleDeletePesticide(toDeletePesticide)
						setToDeletePesticide(null)
					}}
				/>
			)}
		</div>
	)
}
