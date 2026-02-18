import { useEffect, useState } from 'react'
import SectionHeader from '../../components/ui/SectionHeader'
import ConfirmDeleteModal from '../../components/PointOfSaleComponents/ConfirmDeleteModal'
import EmployeeForm from '../../components/EmployeeComponents/EmployeeForm'
import EmployeeList from '../../components/EmployeeComponents/EmployeeList'
import EmployeeHeaderBar from '../../components/EmployeeComponents/EmployeeHeaderBar'
import WorkTimeTable from '../../components/EmployeeComponents/WorkTimeTable'
import WorkSummary from '../../components/EmployeeComponents/WorkSummary'
import FinishWorkModal from '../../components/EmployeeComponents/FinishWorkModal'

import type { Employee, WorkTime } from '../../types/Employee'
import { useFormatUtils } from '../../hooks/useFormatUtils'

import { useAuthUser } from '../../hooks/useAuthUser'
import { MoonLoader } from 'react-spinners'
import { notify } from '../../utils/notify'
import { useMeData } from '../../hooks/useMeData'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons'

export default function EmployeePage() {
	const { user, getToken, isLoading } = useAuthUser()
	const { appSettings } = useMeData()
	const notificationsEnabled = appSettings?.notificationsEnabled
	const { userCurrency, toEURO, getCurrencySymbol } = useFormatUtils()

	const [year, setYear] = useState(new Date().getFullYear())
	const [employees, setEmployees] = useState<Employee[]>([])
	const [workTimes, setWorkTimes] = useState<WorkTime[]>([])
	const [toDelete, setToDelete] = useState<Employee | null>(null)
	const [showFinishModal, setShowFinishModal] = useState(false)

	const [mode, setMode] = useState<'list' | 'add' | 'edit' | 'details'>('list')
	const [active, setActive] = useState<Employee | null>(null)

	const [loading, setLoading] = useState(false)

	/* =======================
	   FETCH EMPLOYEES
	======================= */
	const fetchEmployees = async () => {
		try {
			setLoading(true)
			const token = await getToken()

			const res = await fetch(`http://localhost:8080/api/employees?farmerId=${user?.id}&seasonYear=${year}`, {
				headers: { Authorization: `Bearer ${token}` },
			})

			if (!res.ok) throw new Error()

			const data: Employee[] = await res.json()

			const converted = data.map(emp => ({
				...emp,
				salary: userCurrency === 'EUR' ? toEURO(emp.salary) : emp.salary,
			}))

			setEmployees(converted)
		} catch {
			notify(notificationsEnabled, 'error', 'Nie udało się pobrać pracowników')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (!user || !appSettings) return
		fetchEmployees()
	}, [year, user, appSettings])

	useEffect(() => {
		setMode('list')
	}, [year])

	/* =======================
	   FETCH WORK TIME
	======================= */
	const fetchWorkTimes = async (employeeId: number) => {
		try {
			setLoading(true)
			const token = await getToken()

			const res = await fetch(`http://localhost:8080/api/work-time/employee/${employeeId}`, {
				headers: { Authorization: `Bearer ${token}` },
			})

			if (!res.ok) throw new Error()

			const data: WorkTime[] = await res.json()

			const converted = data.map(time => ({
				...time,
				paidAmount: userCurrency === 'EUR' && time.paidAmount != null ? toEURO(time.paidAmount) : time.paidAmount,
			}))

			setWorkTimes(converted)
		} catch {
			notify(notificationsEnabled, 'error', 'Nie udało się pobrać ewidencji pracy')
		} finally {
			setLoading(false)
		}
	}

	/* =======================
	   CREATE WORK TIME ENTRY
	======================= */
	const createWorkTime = async (hoursWorked: number, paidAmount: number | null, workDate: string) => {
		if (!active) return
		const exists = workTimes.some(w => w.workDate === workDate)
		const dateYear = new Date(workDate).getFullYear()

		if (exists) {
			notify(
				notificationsEnabled,
				'info',
				`Zdefiniowano już czas pracy dla ${active.firstName} ${active.lastName} tego dnia!`,
			)
			return
		}

		if (dateYear !== year) {
			notify(notificationsEnabled, 'info', `Data musi należeć do sezonu ${year}.`)
			return
		}

		try {
			const token = await getToken()

			const payload = {
				farmerId: user?.id,
				employeeId: active.id,
				workDate,
				hoursWorked,
				paidAmount,
			}

			const res = await fetch('http://localhost:8080/api/work-time', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(payload),
			})

			if (!res.ok) throw new Error()

			await fetchWorkTimes(active.id)

			notify(notificationsEnabled, 'success', 'Dodano wpis')
		} catch {
			notify(notificationsEnabled, 'error', 'Nie udało się dodać wpisu')
		}
	}

	const updateWorkTime = async (id: number, data: { type: 'hours' | 'amount'; value: number | null }) => {
		try {
			const token = await getToken()

			const url =
				data.type === 'hours'
					? `http://localhost:8080/api/work-time/${id}/hours`
					: `http://localhost:8080/api/work-time/${id}/amount`

			const body = data.type === 'hours' ? { hoursWorked: data.value } : { paidAmount: data.value }

			const res = await fetch(url, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(body),
			})

			if (!res.ok) throw new Error()

			await fetchWorkTimes(active!.id)

			notify(notificationsEnabled, 'success', 'Zapisano zmiany')
		} catch {
			notify(notificationsEnabled, 'error', 'Nie udało się zapisać zmian')
		}
	}

	const deleteWorkTime = async (id: number) => {
		try {
			const token = await getToken()

			const res = await fetch(`http://localhost:8080/api/work-time/${id}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			})

			if (!res.ok) throw new Error()

			await fetchWorkTimes(active!.id)

			notify(notificationsEnabled, 'success', 'Usunięto wpis')
		} catch {
			notify(notificationsEnabled, 'error', 'Nie udało się usunąć wpisu')
		}
	}

	const finishEmployeeWork = async (finishDate: string) => {
		const dateYear = new Date(finishDate).getFullYear()
		if (!active) return

		if (dateYear !== year) {
			notify(notificationsEnabled, 'info', `Data musi należeć do sezonu ${year}.`)
			return
		}

		try {
			const token = await getToken()

			const res = await fetch(`http://localhost:8080/api/employees/${active.id}/finish-date?finishDate=${finishDate}`, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (!res.ok) throw new Error()

			notify(notificationsEnabled, 'success', 'Zakończono pracę pracownika')

			await fetchEmployees()
			setShowFinishModal(false)
			setMode('list')
			setActive(null)
		} catch {
			notify(notificationsEnabled, 'error', 'Nie udało się zakończyć pracy')
		}
	}

	/* =======================
	   SAVE EMPLOYEE
	======================= */
	const saveEmployee = async (payload: Employee) => {
		try {
			setLoading(true)
			const token = await getToken()

			const method = payload.id ? 'PUT' : 'POST'
			const url = payload.id
				? `http://localhost:8080/api/employees/${payload.id}`
				: 'http://localhost:8080/api/employees'

			const res = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(payload),
			})

			if (!res.ok) throw new Error()

			await fetchEmployees()

			notify(notificationsEnabled, 'success', payload.id ? 'Zaktualizowano pracownika' : 'Dodano pracownika')

			setMode('list')
			setActive(null)
		} catch {
			notify(notificationsEnabled, 'error', 'Nie udało się zapisać pracownika')
		} finally {
			setLoading(false)
		}
	}

	/* =======================
	   DELETE EMPLOYEE
	======================= */
	const deleteEmployee = async () => {
		if (!toDelete) return

		try {
			setLoading(true)
			const token = await getToken()

			const res = await fetch(`http://localhost:8080/api/employees/${toDelete.id}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			})

			if (!res.ok) throw new Error()

			await fetchEmployees()

			notify(notificationsEnabled, 'success', 'Usunięto pracownika')
			setToDelete(null)
		} catch {
			notify(notificationsEnabled, 'error', 'Nie udało się usunąć pracownika')
		} finally {
			setLoading(false)
		}
	}

	function exportWorkTimeCSV(workTimes: WorkTime[], employee: Employee, year: number) {
		if (!workTimes.length) return

		const headers = ['Data', 'Czas pracy (h)', `Wypłata (${getCurrencySymbol()})`]

		const rows = workTimes.map(w => [w.workDate, w.hoursWorked, w.paidAmount ?? ''])

		const csv = [headers.join(';'), ...rows.map(r => r.map(v => `"${v}"`).join(';'))].join('\n')

		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
		const url = URL.createObjectURL(blob)

		const a = document.createElement('a')
		a.href = url
		a.download = `${employee.firstName}_${employee.lastName}_${year}-ewidencja_pracy.csv`
		a.click()

		URL.revokeObjectURL(url)
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
				title='Pracownicy'
				description='Zarządzaj pracownikami sezonowymi oraz kontroluj czas pracy i wypłaty.'
				buttonTitle='Dodaj pracownika'
				year={year}
				setYear={setYear}
				onAdd={() => {
					setActive(null)
					setMode('add')
				}}
			/>

			{/* DETAILS VIEW */}
			{mode === 'details' && active && (
				<>
					<div className='flex flex-col md:flex-row justify-between items-center gap-4'>
						<button
							onClick={() => {
								setMode('list')
								setActive(null)
							}}
							className='text-sm mt-3 text-mainColor underline underline-offset-4 font-medium hover:opacity-80 transition cursor-pointer'>
							← Wróć do listy pracowników
						</button>
						<button
							onClick={() => exportWorkTimeCSV(workTimes, active, year)}
							className='inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:cursor-pointer'>
							<FontAwesomeIcon icon={faDownload} />
							Eksport CSV
						</button>
					</div>
					<div className='flex flex-col mt-4 border border-gray-200 rounded-2xl shadow-md overflow-hidden'>
						<EmployeeHeaderBar employee={active} onFinish={() => setShowFinishModal(true)} />
						<div className='flex flex-col md:flex-row justify-start items-start gap-5 w-full '>
							<div className='w-full md:w-1/2 border-gray-200 border-b md:border-b-0 md:border-r'>
								<WorkSummary items={workTimes} employee={active} />
							</div>
							<div className='w-full md:w-1/2 pr-5'>
								<WorkTimeTable
									items={workTimes}
									onCreate={(h, p, d) => createWorkTime(h, p, d)}
									onUpdate={updateWorkTime}
									onDelete={id => deleteWorkTime(id)}
									isFinished={!!active.finishDate}
									notify={(type, message) => notify(notificationsEnabled, type, message)}
								/>
							</div>
						</div>
					</div>
					{showFinishModal && (
						<FinishWorkModal onClose={() => setShowFinishModal(false)} onConfirm={finishEmployeeWork} />
					)}
				</>
			)}

			{/* FORM */}
			{(mode === 'add' || mode === 'edit') && (
				<EmployeeForm
					initial={active}
					farmerId={user.id}
					seasonYear={year}
					onSave={saveEmployee}
					onCancel={() => {
						setMode('list')
						setActive(null)
					}}
				/>
			)}

			{/* LIST */}
			{mode === 'list' && (
				<EmployeeList
					items={employees}
					onEdit={emp => {
						setActive(emp)
						setMode('edit')
					}}
					onDelete={emp => setToDelete(emp)}
					onWorkTime={emp => {
						setActive(emp)
						setMode('details')
						fetchWorkTimes(emp.id)
					}}
				/>
			)}

			{/* DELETE MODAL */}
			{toDelete && (
				<ConfirmDeleteModal
					title='Usunąć pracownika?'
					description={`Czy na pewno chcesz usunąć ${toDelete.firstName} ${toDelete.lastName}?`}
					onConfirm={deleteEmployee}
					onCancel={() => setToDelete(null)}
				/>
			)}
		</div>
	)
}
