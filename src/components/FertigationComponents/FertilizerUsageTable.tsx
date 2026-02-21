import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faDownload } from '@fortawesome/free-solid-svg-icons'
import type { Fertigation } from '../../types/Fertigation'
import type { Fertilizer } from '../../types/Fertilizer'
import { useFormatUtils } from '../../hooks/useFormatUtils'

type Props = {
	fertigations: Fertigation[]
	fertilizers: Fertilizer[]
	tunnelsInSeason: number
}

export default function FertilizerUsageTable({ fertigations, fertilizers, tunnelsInSeason }: Props) {
	const { getCurrencySymbol } = useFormatUtils()
	const [query, setQuery] = useState('')

	const fertilizerMap = useMemo(() => {
		const map: Record<number, Fertilizer> = {}
		fertilizers.forEach(f => (map[f.id] = f))
		return map
	}, [fertilizers])

	const stats = useMemo(() => {
		const map: Record<
			number,
			{
				name: string
				form: string
				totalUsed: number
				totalCost: number
				uses: number
			}
		> = {}

		fertigations.forEach(f => {
			const fertilizer = fertilizerMap[f.fertilizerId]
			if (!fertilizer) return

			const used = f.dose * f.tunnelCount
			const cost = fertilizer.price ? used * fertilizer.price : 0

			if (!map[f.fertilizerId]) {
				map[f.fertilizerId] = {
					name: fertilizer.name,
					form: fertilizer.form,
					totalUsed: 0,
					totalCost: 0,
					uses: 0,
				}
			}

			map[f.fertilizerId].totalUsed += used
			map[f.fertilizerId].totalCost += cost
			map[f.fertilizerId].uses += 1
		})

		return Object.values(map).sort((a, b) => b.totalUsed - a.totalUsed)
	}, [fertigations, fertilizerMap])

	const filtered = useMemo(() => {
		if (!query.trim()) return stats
		const q = query.toLowerCase()
		return stats.filter(s => s.name.toLowerCase().includes(q))
	}, [stats, query])

	function getUnit(form: string) {
		return form.toLowerCase() === 'płynny' ? 'l' : 'kg'
	}

	function exportToCSV(items: typeof stats) {
		if (!items.length) return

		const headers = ['LP', 'Nawóz', 'Zużycie', 'Zużycie/tunel', 'Koszt', 'Koszt/tunel', 'Użycia']

		const rows = items.map((s, i) => {
			const avgPerTunnel = s.totalUsed / tunnelsInSeason
			const avgCostTunnel = s.totalCost / tunnelsInSeason

			return [
				i + 1,
				s.name,
				`${Math.round(s.totalUsed)} ${getUnit(s.form)}`,
				`${avgPerTunnel.toFixed(2)} ${getUnit(s.form)}`,
				`${Math.round(s.totalCost)} ${getCurrencySymbol()}`,
				`${avgCostTunnel.toFixed(2)} ${getCurrencySymbol()}`,
				s.uses,
			]
		})

		const csvContent = [headers.join(';'), ...rows.map(r => r.map(v => `"${String(v)}"`).join(';'))].join('\n')

		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = 'Zuzycie_nawozow.csv'
		link.click()
		URL.revokeObjectURL(url)
	}

	if (!stats.length) return null

	return (
		<div className='mt-4'>
			{/* SEARCH + EXPORT */}
			<div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
				<div className='relative w-full sm:max-w-xs'>
					<FontAwesomeIcon icon={faSearch} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
					<input
						type='text'
						placeholder='Szukaj nawozu...'
						value={query}
						onChange={e => setQuery(e.target.value)}
						className='w-full rounded-md border pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mainColor'
					/>
				</div>

				<button
					type='button'
					onClick={() => exportToCSV(filtered)}
					className='inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm cursor-pointer'>
					<FontAwesomeIcon icon={faDownload} />
					Eksport CSV
				</button>
			</div>

			{/* DESKTOP */}
			<div className='hidden md:block'>
				<div
					className='px-3 py-2 text-xs font-medium bg-mainColor text-white rounded-t-lg'
					style={{ display: 'grid', gridTemplateColumns: '0.5fr 2fr 1fr 1fr 1fr 1fr 0.6fr' }}>
					<div>LP</div>
					<div>Nawóz</div>
					<div>Zużycie</div>
					<div>Zużycie / tunel</div>
					<div>Koszt</div>
					<div>Koszt / tunel</div>
					<div>Użycia</div>
				</div>

				{filtered.map((s, index) => {
					const avgPerTunnel = s.totalUsed / tunnelsInSeason
					const avgCostTunnel = s.totalCost / tunnelsInSeason

					return (
						<div
							key={s.name}
							className='px-3 py-3 border-b border-gray-300 text-sm items-center bg-white'
							style={{ display: 'grid', gridTemplateColumns: '0.5fr 2fr 1fr 1fr 1fr 1fr 0.6fr' }}>
							<div className='text-gray-500'>{index + 1}</div>
							<div className='font-medium'>{s.name}</div>
							<div>
								{Math.round(s.totalUsed)} {getUnit(s.form)}
							</div>
							<div>
								{avgPerTunnel.toFixed(2)} {getUnit(s.form)}
							</div>
							<div>
								{Math.round(s.totalCost)} {getCurrencySymbol()}
							</div>
							<div>
								{avgCostTunnel.toFixed(2)} {getCurrencySymbol()}
							</div>
							<div>{s.uses}</div>
						</div>
					)
				})}
			</div>

			{/* MOBILE */}
			<div className='space-y-3 md:hidden'>
				{filtered.map((s, index) => {
					const avgPerTunnel = s.totalUsed / tunnelsInSeason
					const avgCostTunnel = s.totalCost / tunnelsInSeason

					return (
						<div key={s.name} className='rounded-lg border bg-white p-4 shadow-sm'>
							<p className='font-semibold'>
								{index + 1}. {s.name}
							</p>
							<p className='text-sm text-gray-600 mt-1'>
								Zużycie: {Math.round(s.totalUsed)} {getUnit(s.form)}
							</p>
							<p className='text-sm text-gray-600'>
								Zużycie/tunel: {avgPerTunnel.toFixed(2)} {getUnit(s.form)}
							</p>
							<p className='text-sm text-gray-600'>
								Koszt: {Math.round(s.totalCost)} {getCurrencySymbol()}
							</p>
							<p className='text-sm text-gray-600'>
								Koszt/tunel: {avgCostTunnel.toFixed(2)} {getCurrencySymbol()}
							</p>
							<p className='text-sm text-gray-600'>Użycia: {s.uses}</p>
						</div>
					)
				})}
			</div>
		</div>
	)
}
