import { useFormatUtils } from '../../hooks/useFormatUtils'
import type { Employee } from '../../types/Employee'

type Props = {
	employee: Employee
	onFinish: () => void
}

export default function EmployeeHeaderBar({ employee, onFinish }: Props) {
	const { formatDate } = useFormatUtils()

	const { firstName, lastName, nationality, age, startDate, finishDate } = employee

	if (!startDate) return null

	const start = new Date(startDate)
	const end = finishDate ? new Date(finishDate) : new Date()

	const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

	const finished = !!finishDate

	function formatAge(age: number) {
		if (age === 1) return '1 rok'

		const lastDigit = age % 10
		const lastTwo = age % 100

		if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) {
			return `${age} lata`
		}

		return `${age} lat`
	}

	return (
		<div className='bg-white border-b border-gray-200 px-10 py-5'>
			<div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
				{/* LEWA STRONA */}
				<div className='flex flex-col md:flex-row md:items-center gap-2 md:gap-4'>
					<div>
						<h2 className='text-lg md:text-xl font-semibold text-gray-800'>
							{firstName} {lastName}
						</h2>

						{(nationality || age) && (
							<p className='text-sm text-gray-500'>
								{nationality ?? ''}
								{nationality && age ? ', ' : ''}
								{age ? formatAge(age) : ''}
							</p>
						)}
					</div>

					<span className='hidden md:block text-gray-300'>|</span>

					<span className='text-sm text-gray-600'>
						{finished ? '' : 'od '}
						{formatDate(startDate)}
						{finishDate && ` — ${formatDate(finishDate)}`}
					</span>
				</div>

				{/* PRAWA STRONA */}
				<div className='flex flex-col gap-1'>
					<div className='flex flex-row items-end gap-2'>
						<span className='text-3xl font-bold text-mainColor leading-none'>{totalDays}</span>
						<span className='text-sm text-gray-500 pb-1'>{finished ? 'dni pracy' : 'dzień pracy'}</span>
					</div>
					{!finished && (
						<button
							onClick={onFinish}
							className='text-sm text-gray-500 hover:text-red-500 underline underline-offset-4 cursor-pointer'>
							Zakończ pracę
						</button>
					)}
				</div>
			</div>
		</div>
	)
}
