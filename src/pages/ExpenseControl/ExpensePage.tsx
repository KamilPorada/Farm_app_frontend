import { useEffect, useState } from 'react'
import SectionHeader from '../../components/ui/SectionHeader'
import ExpenseCategoryHeader from '../../components/ExpenseControl/ExpenseComponents/ExpenseCategoryHeader'
import ExpenseCategoryFormModal from '../../components/ExpenseControl/ExpenseComponents/ExpenseCategoryFormModal'
import ConfirmDeleteCategoryModal from '../../components/ExpenseControl/ExpenseComponents/ConfirmDeleteCategoryModal'
import ExpenseCategoryManageModal from '../../components/ExpenseControl/ExpenseComponents/ExpenseCategoryManageModal'
import type { Expense, ExpenseCategory } from '../../types/Expense'
import { useAuthUser } from '../../hooks/useAuthUser'
import { MoonLoader } from 'react-spinners'
import { notify } from '../../utils/notify'
import { useMeData } from '../../hooks/useMeData'

export default function ExpensePage() {
	const { user, getToken, isLoading } = useAuthUser()
	const { appSettings: globalSettings } = useMeData()
	const notificationsEnabled = globalSettings?.notificationsEnabled

	const [year, setYear] = useState(new Date().getFullYear())
	const [mode, setMode] = useState<'list' | 'add' | 'edit' | 'details'>('list')
	const [active, setActive] = useState<Expense | null>(null)

	const [categories, setCategories] = useState<ExpenseCategory[]>([])
	const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null)

	const [showCategoryFormModal, setShowCategoryFormModal] = useState(false)
	const [showManageModal, setShowManageModal] = useState(false)
	const [showDeleteModal, setShowDeleteModal] = useState(false)

	const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null)
	const [deletingCategory, setDeletingCategory] = useState<ExpenseCategory | null>(null)

	const [loading, setLoading] = useState(false)

	/* =======================
   		CREATE CATEGORY
	======================= */
	async function handleCreateCategory(data: { name: string; icon: string | null }) {
		if (!user) return

		setLoading(true)

		try {
			const token = await getToken()

			const res = await fetch(`http://localhost:8080/api/expense-categories?farmerId=${user.id}`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: data.name,
					icon: data.icon,
				}),
			})

			if (!res.ok) {
				if (res.status === 409) {
					notify(notificationsEnabled, 'error', 'Kategoria o tej nazwie już istnieje!')
				} else {
					notify(notificationsEnabled, 'error', 'Nie udało się dodać kategorii wydatków!')
				}
				return
			}

			const saved: ExpenseCategory = await res.json()

			// dodaj do listy
			setCategories(prev => [...prev, saved])

			// ustaw jako aktywną
			setActiveCategoryId(saved.id)

			// zamknij modal
			setShowCategoryFormModal(false)

			notify(notificationsEnabled, 'success', 'Kategoria wydatków została dodana!')
		} catch (err) {
			notify(notificationsEnabled, 'error', 'Wystąpił błąd podczas dodawania kategorii!')
		} finally {
			setLoading(false)
		}
	}

	async function handleUpdateCategory(data: { name: string; icon: string | null }) {
		if (!editingCategory || !user) return
		setLoading(true)

		try {
			const token = await getToken()

			const res = await fetch(
				`http://localhost:8080/api/expense-categories/${editingCategory.id}?farmerId=${user.id}`,
				{
					method: 'PUT',
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						name: data.name,
						icon: data.icon,
					}),
				},
			)

			if (!res.ok) {
				if (res.status === 409) {
					notify(notificationsEnabled, 'error', 'Kategoria o tej nazwie już istnieje!')
				} else {
					notify(notificationsEnabled, 'error', 'Nie udało się zapisać zmian!')
				}
				return
			}

			const updated: ExpenseCategory = await res.json()

			setCategories(prev => prev.map(c => (c.id === updated.id ? updated : c)))

			setEditingCategory(null)
			setShowCategoryFormModal(false)

			notify(notificationsEnabled, 'success', 'Kategoria została zaktualizowana!')
		} finally {
			setLoading(false)
		}
	}

	async function handleDeleteCategory() {
		if (!deletingCategory || !user) return
		setLoading(true)

		try {
			const token = await getToken()

			const res = await fetch(
				`http://localhost:8080/api/expense-categories/${deletingCategory.id}?farmerId=${user.id}`,
				{
					method: 'DELETE',
					headers: { Authorization: `Bearer ${token}` },
				},
			)

			if (!res.ok) {
				notify(notificationsEnabled, 'error', 'Nie można usunąć kategorii (może zawierać wydatki)')
				return
			}

			setCategories(prev => prev.filter(c => c.id !== deletingCategory.id))

			if (activeCategoryId === deletingCategory.id) {
				setActiveCategoryId(null)
			}

			setDeletingCategory(null)
			setShowDeleteModal(false)

			notify(notificationsEnabled, 'success', 'Kategoria została usunięta!')
		} finally {
			setLoading(false)
		}
	}

	/* =======================
	   FETCH CATEGORIES
	======================= */
	useEffect(() => {
		if (!user?.id) return

		async function fetchCategories() {
			setLoading(true)
			try {
				const token = await getToken()

				const res = await fetch(`http://localhost:8080/api/expense-categories?farmerId=${user?.id}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})

				if (!res.ok) {
					notify(notificationsEnabled, 'error', 'Nie udało się pobrać kategorii wydatków!')
					return
				}

				const data: ExpenseCategory[] = await res.json()
				setCategories(data)
			} catch (err) {
			} finally {
				setLoading(false)
			}
		}

		fetchCategories()
	}, [user])

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
				title='Wydatki'
				description='Przeglądaj koszty gospodarstwa w wybranym roku oraz zarządzaj swoimi wydatkami.'
				buttonTitle='Dodaj wydatek'
				year={year}
				setYear={setYear}
				onAdd={() => {
					setActive(null)
					setMode('add')
				}}
			/>

			{/* Kategorie wydatków */}
			<div className='mt-6'>
				<ExpenseCategoryHeader
					categories={categories}
					activeCategoryId={activeCategoryId}
					onSelect={setActiveCategoryId}
					onAdd={() => {
						setEditingCategory(null)
						setShowCategoryFormModal(true)
					}}
					onManage={() => setShowManageModal(true)}
				/>
			</div>

			{showCategoryFormModal && (
				<ExpenseCategoryFormModal
					initial={
						editingCategory
							? {
									name: editingCategory.name,
									icon: editingCategory.icon ?? null,
								}
							: undefined
					}
					onClose={() => {
						setEditingCategory(null)
						setShowCategoryFormModal(false)
					}}
					onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
				/>
			)}

			{showManageModal && (
				<ExpenseCategoryManageModal
					categories={categories}
					onClose={() => setShowManageModal(false)}
					onEdit={cat => {
						setShowManageModal(false)
						setEditingCategory(cat)
						setShowCategoryFormModal(true)
					}}
					onDelete={cat => {
						setShowManageModal(false)
						setDeletingCategory(cat)
						setShowDeleteModal(true)
					}}
				/>
			)}

			{showDeleteModal && deletingCategory && (
				<ConfirmDeleteCategoryModal
					categoryName={deletingCategory.name}
					onCancel={() => {
						setDeletingCategory(null)
						setShowDeleteModal(false)
					}}
					onConfirm={handleDeleteCategory}
				/>
			)}

			{/* TU W KOLEJNYM KROKU:
			    - listy wydatków
			    - tabele per kategoria
			    - tryby add / edit
			*/}
		</div>
	)
}
