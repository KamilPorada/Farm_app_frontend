import { useFormatUtils } from '../../hooks/useFormatUtils'
type Props = {
	seasonYear: number
	startDate: string | null
	endDate: string | null
}

export default function SeasonHeaderBar({ seasonYear, startDate, endDate }: Props) {
	const { formatDate } = useFormatUtils()

	if (!startDate) return null

	const start = new Date(startDate)
	const end = endDate ? new Date(endDate) : new Date()

	const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

	const finished = !!endDate

	return (
		<div className='bg-white border-b border-gray-200 px-10 py-5'>
			<div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
				{/* LEWA STRONA */}
				<div className='flex flex-col md:flex-row md:items-center gap-2 md:gap-4'>
					<h2 className='text-lg md:text-xl font-semibold text-gray-800'>Sezon {seasonYear}</h2>

					<span className='hidden md:block text-gray-300'>|</span>

					<span className='text-sm text-gray-600'>
						{finished ? '' : 'od '}
						{formatDate(startDate)}
						{endDate && ` — ${formatDate(endDate)}`}
					</span>
				</div>

				{/* PRAWA STRONA */}
				<div className='flex flex-col items-start '>
					<span className='text-3xl font-bold text-mainColor leading-none'>{totalDays}</span>

					<span className='text-sm text-gray-500 pb-1'>{finished ? 'dni sezonu' : 'dzień sezonu'}</span>
				</div>
			</div>
		</div>
	)
}
