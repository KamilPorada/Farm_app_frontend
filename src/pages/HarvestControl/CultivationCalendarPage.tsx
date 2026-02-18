import { useEffect, useState } from 'react'
import SectionHeader from '../../components/ui/SectionHeader'
import SeasonHeaderBar from '../../components/CultivationCalendar/SeasonHeaderBar'
import CultivationSeasonTimeline from '../../components/CultivationCalendar/CultivationSeasonTimeline'
import ManageProductionStagesModal from '../../components/CultivationCalendar/ManageProductionStagesModal'
import CultivationSeasonReportCard from '../../components/CultivationCalendar/CultivationSeasonReportCard'

import type { CultivationCalendar } from '../../types/CultivationCalendar'
import AddProductionStageModal from '../../components/CultivationCalendar/AddProductionStageModal'

import { useAuthUser } from '../../hooks/useAuthUser'
import { MoonLoader } from 'react-spinners'
import { notify } from '../../utils/notify'
import { useMeData } from '../../hooks/useMeData'

type StageType = 'PRICKING' | 'PLANTING' | 'HARVEST_START' | 'HARVEST_END' | 'DONE'

export default function CultivationCalendarPage() {
	const { user, getToken, isLoading } = useAuthUser()
	const { appSettings } = useMeData()
	const notificationsEnabled = appSettings?.notificationsEnabled

	const [year, setYear] = useState(new Date().getFullYear())
	const [item, setItem] = useState<CultivationCalendar | null>(null)
	const [loading, setLoading] = useState(false)
	const [editingItem, setEditingItem] = useState<CultivationCalendar | null>(null)
	const [activeStage, setActiveStage] = useState<StageType | null>(null)
	const [showDoneDialog, setShowDoneDialog] = useState(false)
	const [showManageDialog, setShowManageDialog] = useState(false)

	const hasCalendar = item !== null

	/* =======================
	   DETERMINE NEXT STAGE
	======================= */
	const getNextStage = (): StageType => {
		if (!item) return 'PRICKING'
		if (!item.prickingStartDate) return 'PRICKING'
		if (!item.plantingStartDate) return 'PLANTING'
		if (!item.harvestStartDate) return 'HARVEST_START'
		if (!item.harvestEndDate) return 'HARVEST_END'
		return 'DONE'
	}

	/* =======================
	   FETCH
	======================= */
	const fetchCalendar = async () => {
		if (!user) return

		try {
			setLoading(true)
			const token = await getToken()

			const res = await fetch(`http://localhost:8080/api/cultivation-calendar?farmerId=${user.id}&seasonYear=${year}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (res.status === 404) {
				setItem(null)
				return
			}

			if (!res.ok) throw new Error()

			const data = await res.json()
			setItem(data)
		} catch {
			notify(notificationsEnabled, 'error', 'Nie udało się pobrać kalendarza')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchCalendar()
	}, [year, user])

	/* =======================
	   CREATE
	======================= */
	const createCalendar = async (payload: Omit<CultivationCalendar, 'id'>) => {
		const token = await getToken()

		const res = await fetch('http://localhost:8080/api/cultivation-calendar', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(payload),
		})

		if (!res.ok) throw new Error()
		return await res.json()
	}

	/* =======================
	   UPDATE
	======================= */
	const updateCalendar = async (updated: CultivationCalendar) => {
		const token = await getToken()

		const res = await fetch(`http://localhost:8080/api/cultivation-calendar/${updated.id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(updated),
		})

		if (!res.ok) throw new Error()
		return await res.json()
	}

	/* =======================
	   HANDLE SAVE STAGE
	======================= */
	const handleSaveStage = async (data: { startDate: string; endDate?: string }) => {
		try {
			setLoading(true)
			const stage = getNextStage()

			// ---------- FIRST STAGE ----------
			if (!item) {
				const newCalendar: Omit<CultivationCalendar, 'id'> = {
					farmerId: user!.id,
					seasonYear: year,

					prickingStartDate: data.startDate,
					prickingEndDate: data.endDate ?? null,

					plantingStartDate: null,
					plantingEndDate: null,

					harvestStartDate: null,
					harvestEndDate: null,
				}

				const created = await createCalendar(newCalendar)
				setItem(created)
			}
			// ---------- NEXT STAGES ----------
			else {
				const updated = { ...item }

				if (stage === 'PLANTING') {
					updated.plantingStartDate = data.startDate
					updated.plantingEndDate = data.endDate ?? null
				}

				if (stage === 'HARVEST_START') {
					updated.harvestStartDate = data.startDate
				}

				if (stage === 'HARVEST_END') {
					updated.harvestEndDate = data.startDate
				}

				const saved = await updateCalendar(updated)
				setItem(saved)
			}

			setActiveStage(null)
			notify(notificationsEnabled, 'success', 'Etap zapisany')
		} catch {
			notify(notificationsEnabled, 'error', 'Błąd zapisu etapu')
		} finally {
			setLoading(false)
		}
	}

	/* =======================
	   HANDLE ADD BUTTON
	======================= */
	const handleAddClick = () => {
		const nextStage = getNextStage()

		if (nextStage === 'DONE') {
			setShowDoneDialog(true)
			return
		}

		setActiveStage(nextStage)
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
				title='Kalendarz uprawy'
				description='Zarządzaj etapami produkcji w wybranym sezonie.'
				buttonTitle='Dodaj etap produkcji'
				year={year}
				setYear={setYear}
				onAdd={handleAddClick}
			/>

			{/* Modal dodawania etapu */}
			{activeStage && activeStage !== 'DONE' && (
				<AddProductionStageModal
					stage={activeStage}
					year={year}
					onClose={() => setActiveStage(null)}
					onSave={handleSaveStage}
				/>
			)}
			{hasCalendar && (
				<div className='flex flex-col mt-4 border border-gray-200 rounded-2xl shadow-md overflow-auto'>
					<SeasonHeaderBar
						seasonYear={year}
						startDate={item?.prickingStartDate ?? null}
						endDate={item?.harvestEndDate ?? null}
					/>
					<div className='flex flex-col md:flex-row justify-start items-start gap-5 w-full '>
						<div className='w-full md:w-1/2 border-gray-200 border-b md:border-b-0 md:border-r px-10 py-5'>
							<CultivationSeasonTimeline item={item} />
							<button
								onClick={() => {
									setEditingItem(item)
									setShowManageDialog(true)
								}}
								className='text-mainColor mt-3 mb-6 underline text-sm font-medium hover:opacity-80 cursor-pointer'>
								Zarządzaj etapami produkcji
							</button>
						</div>
						<div className='w-full md:w-1/2 pr-8 pl-4 py-5'>
							<CultivationSeasonReportCard item={item} />
						</div>
					</div>
				</div>
			)}

			{!hasCalendar && (
				<div className='flex flex-col items-center justify-center py-24 text-center'>
					<p className='text-base font-medium text-gray-700'>Brak zdefiniowanych etapów sezonu</p>
					<p className='mt-2 text-sm text-gray-500'>Dodaj pierwszy etap produkcji, aby rozpocząć ewidencję.</p>
				</div>
			)}

			{showManageDialog && editingItem && (
				<ManageProductionStagesModal
					item={editingItem}
					year={year}
					onClose={() => setShowManageDialog(false)}
					onSave={async updated => {
						const saved = await updateCalendar(updated)
						setItem(saved)
						setShowManageDialog(false)
						notify(notificationsEnabled, 'success', 'Pomyślnie edytowano etapy produkcji!')
					}}
				/>
			)}

			{/* Dialog końcowy */}
			{showDoneDialog && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
					<div className='w-full max-w-md rounded-lg bg-white p-6 shadow-lg'>
						<h3 className='text-lg font-semibold mb-4'>Sezon kompletny</h3>
						<p className='text-sm text-gray-600'>Wszystkie etapy sezonu zostały już zdefiniowane.</p>

						<div className='mt-6 flex justify-end'>
							<button
								onClick={() => setShowDoneDialog(false)}
								className='rounded-md bg-mainColor px-4 py-2 text-sm text-white cursor-pointer'>
								OK
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

