import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLayerGroup, faPlus, faGear } from '@fortawesome/free-solid-svg-icons'
import { EXPENSE_CATEGORY_ICON_MAP } from '../../../constans/expenseCategoryIcons'
import type { ExpenseCategory } from '../../../types/Expense'
import SystemButton from '../../../components/ui/SystemButton'

type Props = {
	categories: ExpenseCategory[]
	activeCategoryId: number | null
	onSelect: (categoryId: number | null) => void
	onAdd: () => void
	onManage: () => void 
}

export default function ExpenseCategoryHeader({ categories, activeCategoryId, onSelect, onAdd, onManage }: Props) {
	return (
		<div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
			<div className='flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-3'>
				<button
					onClick={() => onSelect(null)}
					className={`flex items-center justify-center md:justify-start gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition hover:cursor-pointer
		${
			activeCategoryId === null
				? 'bg-mainColor text-white border-mainColor'
				: 'bg-gray-50 text-gray-700 hover:bg-gray-200'
		}`}>
					<FontAwesomeIcon icon={faLayerGroup} />
					Wszystkie
				</button>

				{categories.map(cat => (
					<button
						key={cat.id}
						onClick={() => onSelect(cat.id)}
						className={`flex items-center justify-center md:justify-start gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition hover:cursor-pointer
		${
			activeCategoryId === cat.id
				? 'bg-mainColor text-white border-mainColor'
				: 'bg-gray-50 text-gray-700 hover:bg-gray-200'
		}`}>
						{cat.icon && (
							<FontAwesomeIcon icon={EXPENSE_CATEGORY_ICON_MAP[cat.icon] ?? EXPENSE_CATEGORY_ICON_MAP['fa-ellipsis']} />
						)}
						{cat.name}
					</button>
				))}
			</div>

			<div className='flex flex-col items-center md:items-start gap-1 md:self-start'>
				<SystemButton onClick={onAdd} className='normal-case w-full md:w-42 justify-center'>
					<FontAwesomeIcon icon={faPlus} className='hidden sm:inline' />
					Dodaj kategorię
				</SystemButton>

				<button
					type='button'
					onClick={onManage}
					className='flex items-center gap-1 text-xs text-gray-500 transition hover:text-mainColor hover:cursor-pointer'>
					<FontAwesomeIcon icon={faGear} className='text-[11px]' />
					Zarządzaj kategoriami
				</button>
			</div>
		</div>
	)
}
