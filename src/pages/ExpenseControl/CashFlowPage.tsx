import { useEffect, useState, useMemo } from 'react'
import CashFlowHeader from '../../components/ExpenseControl/CashFlowComponents/CashFlowHeader'
import CashFlowSummary from '../../components/ExpenseControl/CashFlowComponents/CashFlowSummary'
import IncreaseSection from '../../components/ExpenseControl/CashFlowComponents/IncreaseSection'
import DecreaseSection from '../../components/ExpenseControl/CashFlowComponents/DecreaseSection'
import AddIncreaseTypeModal from '../../components/ExpenseControl/CashFlowComponents/AddIncreaseTypeModal'
import AddDecreaseTypeModal from '../../components/ExpenseControl/CashFlowComponents/AddDecreaseTypeModal '
import { useFormatUtils } from '../../hooks/useFormatUtils'
import SystemButton from '../../components/ui/SystemButton'

import type {
	FinancialDecreaseType,
	FinancialDecrease,
	FinancialIncreaseType,
	FinancialIncrease,
} from '../../types/financial'

import { useAuthUser } from '../../hooks/useAuthUser'
import { MoonLoader } from 'react-spinners'
import { notify } from '../../utils/notify'
import { useMeData } from '../../hooks/useMeData'

export default function CashFlowPage() {
	const { userCurrency, toPLN } = useFormatUtils()
	const { user, getToken, isLoading } = useAuthUser()
	const { appSettings } = useMeData()
	const notificationsEnabled = appSettings?.notificationsEnabled

	const [year, setYear] = useState(new Date().getFullYear())
	const [loading, setLoading] = useState(false)

	const [decreaseTypes, setDecreaseTypes] = useState<FinancialDecreaseType[]>([])
	const [increaseTypes, setIncreaseTypes] = useState<FinancialIncreaseType[]>([])

	const [decreases, setDecreases] = useState<FinancialDecrease[]>([])
	const [increases, setIncreases] = useState<FinancialIncrease[]>([])

	const [showAddIncreaseType, setShowAddIncreaseType] = useState(false)
	const [showAddDecreaseType, setShowAddDecreaseType] = useState(false)

	const [newIncreaseTypeName, setNewIncreaseTypeName] = useState('')
	const [newDecreaseTypeName, setNewDecreaseTypeName] = useState('')

	const totalDecrease = useMemo(() => decreases.reduce((sum, d) => sum + d.amount, 0), [decreases])
	const totalIncrease = useMemo(() => increases.reduce((sum, i) => sum + i.amount, 0), [increases])

	const hasIncreases = increaseTypes.length > 0
	const hasDecreases = decreaseTypes.length > 0

	const addIncreaseType = async (name: string) => {
		try {
			const token = await getToken()

			const res = await fetch(`http://localhost:8080/api/financial/increase-types`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					farmerId: user!.id,
					name,
					seasonYear: year,
				}),
			})

			const created = await res.json()
			setIncreaseTypes(prev => [...prev, created])

			notify(notificationsEnabled, 'success', 'Pomyślnie utworzono kategorię przychodu!')
		} catch {
			notify(notificationsEnabled, 'error', 'Nie udało się dodać przychodu!')
		}
	}

	const deleteIncreaseType = async (typeId: number) => {
		try {
			const token = await getToken()

			await fetch(`http://localhost:8080/api/financial/increase-types/${typeId}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			setIncreaseTypes(prev => prev.filter(t => t.id !== typeId))
			setIncreases(prev => prev.filter(i => i.typeId !== typeId))

			notify(notificationsEnabled, 'success', 'Kategoria przychodu została usunięta!')
		} catch {
			notify(notificationsEnabled, 'error', 'Nie udało się usunąć kategorii przychodu!')
		}
	}

	const addIncreaseItem = async (typeId: number, title: string, amount: number) => {
		try {
			const token = await getToken()
			const payloadAmount = userCurrency === 'EUR' ? toPLN(amount) : amount

			const res = await fetch(`http://localhost:8080/api/financial/increases`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					farmerId: user!.id,
					typeId,
					title,
					amount: payloadAmount,
				}),
			})

			const created = await res.json()
			setIncreases(prev => [...prev, created])

			notify(notificationsEnabled, 'success', 'Pozycja przychodu została pomyślnie dodana!')
		} catch {
			notify(notificationsEnabled, 'error', 'Nie udało się dodać pozycji przychodu!')
		}
	}

	const updateIncreaseItem = async (id: number, amount: number) => {
		try {
			const token = await getToken()

			await fetch(`http://localhost:8080/api/financial/increases/${id}`, {
				method: 'PUT',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ amount }),
			})

			setIncreases(prev => prev.map(i => (i.id === id ? { ...i, amount } : i)))
		} catch {
			notify(notificationsEnabled, 'error', 'Nie udało się edytować kwoty przychodu!')
		}
	}

	const deleteIncreaseItem = async (id: number) => {
		try {
			const token = await getToken()

			await fetch(`http://localhost:8080/api/financial/increases/${id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			setIncreases(prev => prev.filter(i => i.id !== id))

			notify(notificationsEnabled, 'success', 'Pozycja przychodu została usunięta!')
		} catch {
			notify(notificationsEnabled, 'error', 'Nie udało się usunąć pozycji przychodu!')
		}
	}

	/* =======================
	   DECREASE ACTIONS
	======================= */

	const addDecreaseType = async (name: string) => {
		try {
			const token = await getToken()

			const res = await fetch(`http://localhost:8080/api/financial/decrease-types`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					farmerId: user!.id,
					name,
					seasonYear: year,
				}),
			})

			const created = await res.json()
			setDecreaseTypes(prev => [...prev, created])

			notify(notificationsEnabled, 'success', 'Pomyślnie utworzono kategorię kosztów!')
		} catch {
			notify(notificationsEnabled, 'error', 'Nie udało się dodać kosztu!')
		}
	}

	const deleteDecreaseType = async (typeId: number) => {
		try {
			const token = await getToken()

			await fetch(`http://localhost:8080/api/financial/decrease-types/${typeId}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			setDecreaseTypes(prev => prev.filter(t => t.id !== typeId))
			setDecreases(prev => prev.filter(i => i.typeId !== typeId))

			notify(notificationsEnabled, 'success', 'Kategoria kosztów została pomyślnie usunięta!')
		} catch {
			notify(notificationsEnabled, 'error', 'Nie udało się usunąć kategorii kosztów!')
		}
	}

	const addDecreaseItem = async (typeId: number, title: string, amount: number) => {
		try {
			const token = await getToken()
			const payloadAmount = userCurrency === 'EUR' ? toPLN(amount) : amount

			const res = await fetch(`http://localhost:8080/api/financial/decreases`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					farmerId: user!.id,
					typeId,
					title,
					amount: payloadAmount,
				}),
			})

			const created = await res.json()
			setDecreases(prev => [...prev, created])

			notify(notificationsEnabled, 'success', 'Pozycja kosztu została pomyślnie dodana!')
		} catch {
			notify(notificationsEnabled, 'error', 'Nie udało się dodać pozycji kosztu!')
		}
	}

	const updateDecreaseItem = async (id: number, amount: number) => {
		try {
			const token = await getToken()

			await fetch(`http://localhost:8080/api/financial/decreases/${id}`, {
				method: 'PUT',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ amount }),
			})

			setDecreases(prev => prev.map(i => (i.id === id ? { ...i, amount } : i)))
		} catch {
			notify(notificationsEnabled, 'error', 'Nie udało się zapisać kwoty kosztu!')
		}
	}

	const deleteDecreaseItem = async (id: number) => {
		try {
			const token = await getToken()

			await fetch(`http://localhost:8080/api/financial/decreases/${id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			setDecreases(prev => prev.filter(i => i.id !== id))

			notify(notificationsEnabled, 'success', 'Pozycja kosztu została usunięta!')
		} catch {
			notify(notificationsEnabled, 'error', 'Nie udało się usunąć pozycji kosztu!')
		}
	}

	/* =======================
	   FETCH DATA
	======================= */
	useEffect(() => {
		if (!user) return

		const fetchData = async () => {
			setLoading(true)
			try {
				const token = await getToken()
				const headers = { Authorization: `Bearer ${token}` }

				const [decreaseTypesRes, increaseTypesRes, decreasesRes, increasesRes] = await Promise.all([
					fetch(`http://localhost:8080/api/financial/decrease-types?farmerId=${user.id}&seasonYear=${year}`, {
						headers,
					}),
					fetch(`http://localhost:8080/api/financial/increase-types?farmerId=${user.id}&seasonYear=${year}`, {
						headers,
					}),
					fetch(`http://localhost:8080/api/financial/decreases?farmerId=${user.id}&seasonYear=${year}`, { headers }),
					fetch(`http://localhost:8080/api/financial/increases?farmerId=${user.id}&seasonYear=${year}`, { headers }),
				])

				setDecreaseTypes(await decreaseTypesRes.json())
				setIncreaseTypes(await increaseTypesRes.json())
				setDecreases(await decreasesRes.json())
				setIncreases(await increasesRes.json())
			} catch {
				notify(notificationsEnabled, 'error', 'Nie udało się pobrać przepływów finansowych!')
			} finally {
				setLoading(false)
			}
		}

		fetchData()
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
			<CashFlowHeader year={year} setYear={setYear} />

			{/* === EMPTY GLOBAL === */}
			{!hasIncreases && !hasDecreases && (
				<div className='flex flex-col items-center justify-center py-28 text-center'>
					<p className='text-lg font-medium text-gray-700'>Brak danych finansowych w wybranym roku</p>
					<p className='mt-2 text-sm text-gray-500 max-w-md'>
						Dodaj przychody lub koszty, aby rozpocząć ewidencję przepływów finansowych.
					</p>

					<div className='mt-6 flex flex-col md:flex-row justify-center items-center gap-3'>
						<SystemButton onClick={() => setShowAddIncreaseType(true)}>+ Dodaj przychód</SystemButton>
						<SystemButton onClick={() => setShowAddDecreaseType(true)}>+ Dodaj koszt</SystemButton>
					</div>
				</div>
			)}

			{(hasIncreases || hasDecreases) && (
				<CashFlowSummary totalIncrease={totalIncrease} totalDecrease={totalDecrease} />
			)}

			{(hasIncreases || hasDecreases) && (
				<div className='flex flex-col md:flex-row justify-center items-start gap-5'>
					{hasIncreases ? (
						<IncreaseSection
							types={increaseTypes}
							items={increases}
							onAddType={addIncreaseType}
							onDeleteType={deleteIncreaseType}
							onAddItem={addIncreaseItem}
							onUpdateItem={updateIncreaseItem}
							onDeleteItem={deleteIncreaseItem}
						/>
					) : (
						<div className='flex flex-col items-center justify-center w-full md:w-1/2 py-20 text-center'>
							<p className='text-base font-medium text-gray-700'>Brak przychodów w wybranym roku</p>
							<p className='mt-2 text-sm text-gray-500 max-w-md'>
								Nie dodano jeszcze żadnych przychodów. Dodaj pierwszą kategorię lub pozycję, aby rozpocząć ewidencję
								wpływów.
							</p>
							<SystemButton
								onClick={() => setShowAddIncreaseType(true)}
								className='mt-4'>
								+ Dodaj przychód
							</SystemButton>
						</div>
					)}

					{hasDecreases ? (
						<DecreaseSection
							types={decreaseTypes}
							items={decreases}
							onAddType={addDecreaseType}
							onDeleteType={deleteDecreaseType}
							onAddItem={addDecreaseItem}
							onUpdateItem={updateDecreaseItem}
							onDeleteItem={deleteDecreaseItem}
						/>
					) : (
						<div className='flex flex-col items-center justify-center w-full md:w-1/2 py-20 text-center'>
							<p className='text-base font-medium text-gray-700'>Brak kosztów w wybranym roku</p>
							<p className='mt-2 text-sm text-gray-500 max-w-md'>
								Nie dodano jeszcze żadnych kosztów. Dodaj pierwszą kategorię lub pozycję, aby rozpocząć ewidencję
								wydatków.
							</p>
							<SystemButton onClick={() => setShowAddDecreaseType(true)} className='mt-4'>
								+ Dodaj koszt
							</SystemButton>
						</div>
					)}
				</div>
			)}

			{/* === MODALE === */}
			{showAddIncreaseType && (
				<AddIncreaseTypeModal
					value={newIncreaseTypeName}
					onChange={setNewIncreaseTypeName}
					onSubmit={() => {
						addIncreaseType(newIncreaseTypeName)
						setShowAddIncreaseType(false)
						setNewIncreaseTypeName('')
					}}
					onClose={() => setShowAddIncreaseType(false)}
				/>
			)}

			{showAddDecreaseType && (
				<AddDecreaseTypeModal
					value={newDecreaseTypeName}
					onChange={setNewDecreaseTypeName}
					onSubmit={() => {
						addDecreaseType(newDecreaseTypeName)
						setShowAddDecreaseType(false)
						setNewDecreaseTypeName('')
					}}
					onClose={() => setShowAddDecreaseType(false)}
				/>
			)}
		</div>
	)
}
