import { useState } from 'react'
import { FaFileAlt, FaSpinner } from 'react-icons/fa'
import type { CultivationCalendar } from '../../types/CultivationCalendar'

type Props = {
	item: CultivationCalendar | null
	onGenerateReport?: () => Promise<void> | void
}

const daysBetween = (start: string, end: string) => {
	const s = new Date(start)
	const e = new Date(end)

	const diff = Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24))
	return diff + 1 // ✅ inclusive
}

const formatDays = (days: number) => {
	if (days === 1) return '1 dzień'
	return `${days} dni`
}

export default function CultivationSeasonReportCard({ item, onGenerateReport }: Props) {
	const [loading, setLoading] = useState(false)

	if (!item || !item.prickingStartDate) return null

	const { prickingStartDate, prickingEndDate, plantingStartDate, plantingEndDate, harvestStartDate, harvestEndDate } =
		item

	const sections = [
		prickingEndDate && {
			label: 'Pikowanie',
			value: formatDays(daysBetween(prickingStartDate!, prickingEndDate)),
		},
		plantingStartDate && {
			label: 'Wzrost w pikówce',
			value: formatDays(daysBetween(prickingStartDate!, plantingStartDate)),
		},
		plantingEndDate && {
			label: 'Sadzenie',
			value: formatDays(daysBetween(plantingStartDate!, plantingEndDate)),
		},
		harvestStartDate &&
			plantingStartDate && {
				label: 'Wzrost w tunelach',
				value: formatDays(daysBetween(plantingStartDate!, harvestStartDate)),
			},
		harvestEndDate &&
			harvestStartDate && {
				label: 'Zbiory',
				value: formatDays(daysBetween(harvestStartDate!, harvestEndDate)),
			},
	].filter(Boolean)

	const handleGenerate = async () => {
		if (!onGenerateReport || loading) return

		try {
			setLoading(true)
			await onGenerateReport()
		} finally {
			setLoading(false)
		}
	}

	return (
		<div>
			<h2 className='text-xl font-semibold mb-5'>Sezon w liczbach</h2>

			<div className='mt-2'>
				{sections.map((section: any, i) => (
					<div key={i} className='flex justify-between items-center border-b border-gray-200 mb-3 pb-3'>
						<p className='text-gray-600'>{section.label}</p>
						<p className='font-semibold text-gray-800'>{section.value}</p>
					</div>
				))}
			</div>

			{/* PRZYCISK RAPORTU */}
			{item.harvestEndDate && (
				<div className='mt-6'>
					<button
						onClick={handleGenerate}
						disabled={loading}
						className={`w-full rounded-lg px-4 py-3 text-white font-medium flex items-center justify-center gap-2 cursor-pointer
							${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-mainColor hover:opacity-90'}`}>
						{loading ? (
							<>
								<FaSpinner className='animate-spin' />
								Generowanie raportu...
							</>
						) : (
							<>
								<FaFileAlt />
								Wygeneruj raport sezonu
							</>
						)}
					</button>
				</div>
			)}
		</div>
	)
}
