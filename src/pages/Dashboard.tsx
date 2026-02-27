import { useState, useEffect } from 'react'
import { useAuthUser } from '../hooks/useAuthUser'
import { useMeData } from '../hooks/useMeData'
import { notify } from '../utils/notify'

import DashboardHeader from '../components/DashboardComponents/DashboardHeader'
import SeasonOverviewCard from '../components/DashboardComponents/SeasonOverviewCard'
import DashboardStats from '../components/DashboardComponents/DashboardStats'
import AveragePepperPriceAreaChart from '../components/DashboardComponents/AveragePepperPriceAreaChart'
import HarvestFromTradesBarChart from '../components/DashboardComponents/HarvestFromTradesBarChart'
import TreatmentTimeline from '../components/DashboardComponents/TreatmentTimeline'
import FertigationTimeline from '../components/DashboardComponents/FertigationTimeline'

function Dashboard() {
	const today = new Date()
	const todayISO = today.toISOString().slice(0, 10)

	const [year, setYear] = useState(today.getFullYear())
	const [toDate, setToDate] = useState(todayISO)

	const [seasonStarted, setSeasonStarted] = useState<boolean | null>(null)

	const { user, getToken } = useAuthUser()
	const { appSettings } = useMeData()
	const notificationsEnabled = appSettings?.notificationsEnabled

	/* ===============================
	   SPRAWDZENIE CZY SEZON RUSZYŁ
	================================ */
	useEffect(() => {
		if (!user?.id) return

		const checkSeason = async () => {
			try {
				const token = await getToken()

				const res = await fetch(
					`http://localhost:8080/api/cultivation-calendar?farmerId=${user.id}&seasonYear=${year}`,
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				)

				// brak kalendarza → sezon nie rozpoczęty
				if (res.status === 404) {
					setSeasonStarted(false)
					return
				}

				if (!res.ok) throw new Error()

				const data = await res.json()

				// jeżeli brak daty pikowania → sezon nie ruszył
				setSeasonStarted(!!data?.prickingStartDate)
			} catch {
				notify(notificationsEnabled, 'error', 'Nie udało się sprawdzić statusu sezonu')
			}
		}

		checkSeason()
	}, [user, year])

	return (
		<div className='flex flex-col gap-6 container p-8'>
			{/* HEADER */}
			<DashboardHeader
				year={year}
				setYear={setYear}
				toDate={toDate}
				setToDate={setToDate}
			/>

			{/* KARTA SEZONU */}
			<SeasonOverviewCard seasonYear={year} currentDate={toDate} />

			{/* ===== JEŚLI SEZON NIE ROZPOCZĘTY ===== */}
			{seasonStarted === false && (
				<div className='rounded-2xl bg-white border border-gray-100 shadow-sm p-10 text-center'>
					<p className='text-lg font-semibold text-gray-800'>
						Sezon nie został jeszcze rozpoczęty
					</p>

					<p className='mt-3 text-sm text-gray-500 max-w-md mx-auto'>
						Aby wyświetlić analizy, statystyki oraz podsumowanie produkcji,
						rozpocznij sezon w kalendarzu uprawy ustawiając datę rozpoczęcia pikowania!
					</p>
				</div>
			)}

			{/* ===== DASHBOARD (tylko po starcie sezonu) ===== */}
			{seasonStarted && (
				<>
					<DashboardStats seasonYear={year} currentDate={toDate} />

					<div className='grid grid-cols-1 xl:grid-cols-4 gap-3 w-full xl:h-117'>
						{/* LEWA KOLUMNA — wykresy */}
						<div className='xl:col-span-2 flex flex-col gap-3'>
							<AveragePepperPriceAreaChart
								seasonYear={year}
								currentDate={toDate}
							/>
							<HarvestFromTradesBarChart
								seasonYear={year}
								currentDate={toDate}
							/>
						</div>

						{/* PRAWA STRONA */}
						<div className='xl:col-span-1'>
							<TreatmentTimeline
								seasonYear={year}
								currentDate={toDate}
							/>
						</div>

						<div className='xl:col-span-1'>
							<FertigationTimeline
								seasonYear={year}
								currentDate={toDate}
							/>
						</div>
					</div>
				</>
			)}
		</div>
	)
}

export default Dashboard