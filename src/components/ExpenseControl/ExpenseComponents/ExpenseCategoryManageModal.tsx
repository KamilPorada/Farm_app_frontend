import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
import { EXPENSE_CATEGORY_ICON_MAP } from '../../../constans/expenseCategoryIcons'
import type { ExpenseCategory } from '../../../types/Expense'
import SystemButton from '../../ui/SystemButton'

type Props = {
	categories: ExpenseCategory[]
	onEdit: (category: ExpenseCategory) => void
	onDelete: (category: ExpenseCategory) => void
	onClose: () => void
}

export default function ExpenseCategoryManageModal({ categories, onEdit, onDelete, onClose }: Props) {
	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
			<div className='w-full max-w-lg rounded-lg bg-white p-6 shadow-lg'>
				<h3 className='text-lg font-semibold'>Zarządzaj kategoriami</h3>
				<p className='mt-1 text-sm text-gray-500'>Edytuj lub usuń istniejące kategorie wydatków.</p>

				<div className='mt-4 space-y-2'>
					{categories.map(cat => (
						<div key={cat.id} className='flex items-center justify-between rounded-md border border-gray-400 px-3 py-2'>
							<div className='flex items-center gap-2'>
								<FontAwesomeIcon
									icon={
										cat.icon
											? (EXPENSE_CATEGORY_ICON_MAP[cat.icon] ?? EXPENSE_CATEGORY_ICON_MAP['fa-ellipsis'])
											: EXPENSE_CATEGORY_ICON_MAP['fa-ellipsis']
									}
								/>
								<span className='text-sm font-medium'>{cat.name}</span>
							</div>

							<div className='flex items-center gap-2'>
								<button
									onClick={() => onEdit(cat)}
									className='text-gray-500 hover:text-yellow-500 hover:cursor-pointer'>
									<FontAwesomeIcon icon={faPen} />
								</button>
								<button onClick={() => onDelete(cat)} className='text-gray-500 hover:text-red-500 hover:cursor-pointer'>
									<FontAwesomeIcon icon={faTrash} />
								</button>
							</div>
						</div>
					))}
				</div>

				<div className='mt-6 flex justify-end'>
					<SystemButton variant='outline' onClick={onClose}>
						Zamknij
					</SystemButton>
				</div>
			</div>
		</div>
	)
}
