import { useEffect, useState, useMemo } from 'react'
import SectionHeader from '../../components/ui/SectionHeader'
import InvoiceForm from '../../components/ExpenseControl/InvoiceComponents/InvoiceForm'
import InvoiceList from '../../components/ExpenseControl/InvoiceComponents/InvoiceList'
import ConfirmDeleteModal from '../../components/PointOfSaleComponents/ConfirmDeleteModal'

import type { Invoice } from '../../types/Invoice'
import type { PointOfSale } from '../../types/PointOfSale'

import { useAuthUser } from '../../hooks/useAuthUser'
import { MoonLoader } from 'react-spinners'
import { notify } from '../../utils/notify'
import { useMeData } from '../../hooks/useMeData'

export default function InvoicePage() {
	const { user, getToken, isLoading } = useAuthUser()
	const { appSettings } = useMeData()
	const notificationsEnabled = appSettings?.notificationsEnabled

	const [year, setYear] = useState(new Date().getFullYear())
	const [invoices, setInvoices] = useState<Invoice[]>([])
	const [points, setPoints] = useState<PointOfSale[]>([])
	const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list')
	const [toDelete, setToDelete] = useState<Invoice | null>(null)
	const [active, setActive] = useState<Invoice | null>(null)
	const [loading, setLoading] = useState(false)

	const hasInvoices = invoices.length > 0

	async function handleSaveInvoice(invoice: Invoice) {
		setLoading(true)
		try {
			const token = await getToken()

			const isEdit = invoice.id !== 0

			const url = isEdit
				? `http://localhost:8080/api/invoices/${invoice.id}`
				: `http://localhost:8080/api/invoices/farmer/${user!.id}`

			const method = isEdit ? 'PUT' : 'POST'

			const res = await fetch(url, {
				method,
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(invoice),
			})

			if (!res.ok) {
				notify(notificationsEnabled, 'error', 'Nie udało się zapisać faktury!')
				return
			}

			notify(notificationsEnabled, 'success', isEdit ? 'Faktura została zaktualizowana!' : 'Utworzono nową fakturę!')
			await fetchInvoices()
			setMode('list')
			setActive(null)
		} catch (e) {
			notify(notificationsEnabled, 'error', 'Błąd zapisu faktury!')
		} finally {
			setLoading(false)
		}
	}

	async function handleDeleteInvoice(invoice: Invoice) {
		setLoading(true)
		try {
			const token = await getToken()

			const res = await fetch(`http://localhost:8080/api/invoices/${invoice.id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (!res.ok) {
				notify(notificationsEnabled, 'error', 'Nie udało się usunąć faktury!')
				return
			}

			setInvoices(prev => prev.filter(i => i.id !== invoice.id))
			notify(notificationsEnabled, 'success', 'Faktura została usunięta!')
		} catch (e) {
			notify(notificationsEnabled, 'error', 'Błąd usuwania faktury!')
		} finally {
			setLoading(false)
		}
	}

	async function handleMarkAsRealized(invoice: Invoice) {
		setLoading(true)
		try {
			const token = await getToken()

			const res = await fetch(`http://localhost:8080/api/invoices/${invoice.id}/status?status=true`, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (!res.ok) {
				notify(notificationsEnabled, 'error', 'Nie udało się zmienić statusu faktury!')
				return
			}

			// 🔥 najlepsze: refresh z backendu
			await fetchInvoices()

			notify(notificationsEnabled, 'success', 'Faktura została oznaczona jako zrealizowana!')
		} catch {
			notify(notificationsEnabled, 'error', 'Błąd zmiany statusu!')
		} finally {
			setLoading(false)
		}
	}

	async function fetchInvoices() {
		if (!user?.id) return

		setLoading(true)
		try {
			const token = await getToken()

			const res = await fetch(`http://localhost:8080/api/invoices/farmer/${user.id}/year/${year}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (!res.ok) {
				notify(notificationsEnabled, 'error', 'Nie udało się pobrać faktur!')
				return
			}

			const data: Invoice[] = await res.json()
			setInvoices(data)
		} catch {
			notify(notificationsEnabled, 'error', 'Błąd pobierania faktur!')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchInvoices()
	}, [user, year])

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
				title='Faktury'
				description='Zarządzaj fakturami sprzedaży w wybranym roku oraz kontroluj ich realizację.'
				buttonTitle='Dodaj fakturę'
				year={year}
				setYear={setYear}
				onAdd={() => {
					setActive(null)
					setMode('add')
				}}
			/>

			{/* ===== FORMULARZ ===== */}
			{(mode === 'add' || mode === 'edit') && (
				<InvoiceForm
					initial={active}
					points={points}
					onSave={handleSaveInvoice}
					onCancel={() => {
						setMode('list')
						setActive(null)
					}}
				/>
			)}

			{!hasInvoices && mode === 'list' ? (
				<div className='flex flex-col items-center justify-center py-24 text-center'>
					<p className='text-base font-medium text-gray-700'>Brak faktur w wybranym okresie!</p>

					<p className='mt-2 text-sm text-gray-500 max-w-md'>
						Dla wybranego roku nie znaleziono żadnych faktur sprzedaży. Dodaj
						nową fakturę, aby rozpocząć pracę.
					</p>
				</div>
			) : (
				<>
					{/* ===== LISTA FAKTUR ===== */}
					{mode === 'list' && (
						<InvoiceList
							items={invoices}
							points={points}
							onEdit={i => {
								setActive(i)
								setMode('edit')
							}}
							onDelete={handleDeleteInvoice}
							onMarkAsRealized={handleMarkAsRealized}
						/>
					)}
				</>
			)}

			{toDelete && (
				<ConfirmDeleteModal
					title='Usuń fakturę'
					description={`Czy na pewno chcesz usunąć fakturę ${toDelete.invoiceNumber}?`}
					onCancel={() => setToDelete(null)}
					onConfirm={async () => {
						await handleDeleteInvoice(toDelete)
						setToDelete(null)
					}}
				/>
			)}
		</div>
	)
}
