import { useState, useMemo } from 'react'
import type { FinancialDecrease, FinancialDecreaseType } from '../../../types/financial'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrash, faArrowTrendDown, faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons'

import AddDecreaseTypeModal from './AddDecreaseTypeModal '
import AddDecreaseItemModal from './AddDecreaseItemModal'
import ConfirmDeleteModal from '../../PointOfSaleComponents/ConfirmDeleteModal'
import CannotDeleteTypeModal from './CannotDeleteTypeModal'
import { useFormatUtils } from '../../../hooks/useFormatUtils'

type Props = {
	types: FinancialDecreaseType[]
	items: FinancialDecrease[]
	onAddType: (name: string) => void
	onDeleteType: (typeId: number) => void
	onAddItem: (typeId: number, title: string, amount: number) => void
	onUpdateItem: (id: number, amount: number) => void
	onDeleteItem: (id: number) => void
}

export default function DecreaseSection({
	types,
	items,
	onAddType,
	onDeleteType,
	onAddItem,
	onUpdateItem,
	onDeleteItem,
}: Props) {
	const { formatNumber, userCurrency, toPLN, toEURO } = useFormatUtils()
	const [editingId, setEditingId] = useState<number | null>(null)
	const [editValue, setEditValue] = useState('')

	const [showAddType, setShowAddType] = useState(false)
	const [newTypeName, setNewTypeName] = useState('')

	const [showAddItem, setShowAddItem] = useState(false)
	const [activeTypeId, setActiveTypeId] = useState<number | null>(null)
	const [newItemTitle, setNewItemTitle] = useState('')
	const [newItemAmount, setNewItemAmount] = useState('')

	const [deleteTypeId, setDeleteTypeId] = useState<number | null>(null)
	const [deleteItemId, setDeleteItemId] = useState<number | null>(null)

	const [cannotDeleteType, setCannotDeleteType] = useState<{
		id: number
		name: string
	} | null>(null)

	const [expandedTypes, setExpandedTypes] = useState<Record<number, boolean>>({})
	const isExpanded = (id: number) => expandedTypes[id] === true

	const toggleExpanded = (id: number) => setExpandedTypes(prev => ({ ...prev, [id]: !prev[id] }))

	const totalIncome = useMemo(() => items.reduce((sum, i) => sum + i.amount, 0), [items])

	const startEdit = (item: FinancialDecrease) => {
		setEditingId(item.id)
		const editingValue = userCurrency === 'EUR' ? toEURO(item.amount) : item.amount
		setEditValue(String(editingValue))
	}

	const saveEdit = (id: number) => {
		const value = Number(editValue)

		const valueInPLN = userCurrency === 'EUR' ? toPLN(value) : value

		onUpdateItem(id, valueInPLN)
		setEditingId(null)
	}

	return (
		<div className='w-full md:w-1/2 rounded-xl p-4 mt-4 shadow-sm border border-gray-200 bg-white'>
			{/* HEADER */}
			<div className='mb-4 flex flex-col gap-2 border-b border-gray-200 pb-3 sm:flex-row sm:items-center sm:justify-between'>
				<div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3'>
					<h2 className='flex items-center gap-2 text-lg font-semibold'>
						<FontAwesomeIcon icon={faArrowTrendDown} className='text-red-600 text-xl' />
						Koszty
					</h2>

					<span className='font-semibold text-red-600 text-lg sm:text-base'>
						{userCurrency === 'EUR' ? formatNumber(toEURO(totalIncome)) : formatNumber(totalIncome)}{' '}
						{userCurrency === 'EUR' ? '€' : 'zł'}
					</span>
				</div>

				<button
					onClick={() => setShowAddType(true)}
					className='self-start sm:self-auto flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white shadow-sm border border-gray-200 cursor-pointer'>
					<FontAwesomeIcon icon={faPlus} />
				</button>
			</div>

			<div className='rounded-md border border-gray-200 shadow-sm bg-white'>
				{types.map((type, index) => {
					const typeItems = items.filter(i => i.typeId === type.id)
					const sum = typeItems.reduce((a, b) => a + b.amount, 0)

					return (
						<div key={type.id} className={`overflow-hidden ${index !== 0 ? 'border-t border-gray-200' : ''}`}>
							{/* TYPE HEADER */}
							<div
								className='flex flex-col gap-1 px-4 py-2 cursor-pointer
								           sm:flex-row sm:items-center sm:justify-between'
								onClick={() => toggleExpanded(type.id)}>
								<div className='flex items-center gap-2'>
									<FontAwesomeIcon
										icon={isExpanded(type.id) ? faChevronDown : faChevronRight}
										className='text-xs text-gray-400'
									/>
									<span className='font-medium'>{type.name}</span>
								</div>

								<div className='flex items-center justify-between sm:justify-end gap-3'>
									<span className='font-semibold text-red-600'>
										{userCurrency === 'EUR' ? formatNumber(toEURO(sum)) : formatNumber(sum)}{' '}
										{userCurrency === 'EUR' ? '€' : 'zł'}
									</span>
									<button
										onClick={e => {
											e.stopPropagation()
											if (typeItems.length > 0) {
												setCannotDeleteType({
													id: type.id,
													name: type.name,
												})
											} else {
												setDeleteTypeId(type.id)
											}
										}}
										className='flex h-7 w-7 items-center justify-center text-gray-500 hover:text-red-600 cursor-pointer'>
										<FontAwesomeIcon icon={faTrash} />
									</button>
								</div>
							</div>

							{/* SUBITEMS */}
							{isExpanded(type.id) && (
								<div className='relative ml-6 border-l border-gray-200'>
									{typeItems.map(item => (
										<div
											key={item.id}
											className='relative flex flex-col gap-1 pl-6 pr-4 py-2 hover:bg-gray-50
											           sm:flex-row sm:items-center sm:justify-between'>
											<span className='absolute left-[-9px] top-4 sm:top-1/2 sm:-translate-y-1/2 flex h-4 w-4 items-center justify-center rounded-full bg-white border border-gray-200'>
												<span className='h-2 w-2 rounded-full bg-red-600' />
											</span>

											<span className='text-sm break-words'>{item.title}</span>

											<div className='flex items-center justify-between sm:justify-end gap-2'>
												{editingId === item.id ? (
													<input
														type='number'
														className='w-32 sm:w-24 rounded border border-gray-200 px-1 py-1 text-right text-sm'
														value={editValue}
														autoFocus
														onChange={e => {
															const v = e.target.value
															if (v === '') {
																setEditValue('')
																return
															}
															const num = Number(v)
															if (num < 0) return

															setEditValue(v)
														}}
														onBlur={() => {
															if (editValue === '' || Number(editValue) < 0) return
															saveEdit(item.id)
														}}
														onKeyDown={e => {
															if (e.key === 'Enter') {
																if (editValue === '' || Number(editValue) < 0) return
																saveEdit(item.id)
															}
														}}
														onWheel={e => e.currentTarget.blur()}
													/>
												) : (
													<span className='cursor-pointer text-sm font-medium' onClick={() => startEdit(item)}>
														{userCurrency === 'EUR' ? formatNumber(toEURO(item.amount)) : formatNumber(item.amount)}{' '}
														{userCurrency === 'EUR' ? '€' : 'zł'}
													</span>
												)}

												<button
													onClick={() => setDeleteItemId(item.id)}
													className='flex h-7 w-7 items-center justify-center text-gray-500 hover:text-red-600 cursor-pointer'>
													<FontAwesomeIcon icon={faTrash} />
												</button>
											</div>
										</div>
									))}

									<button
										onClick={() => {
											setActiveTypeId(type.id)
											setShowAddItem(true)
										}}
										className='ml-3 mt-2 mb-3 text-sm text-red-600 hover:underline cursor-pointer'>
										+ Dodaj pozycję
									</button>
								</div>
							)}
						</div>
					)
				})}
			</div>

			{/* MODALS */}
			{showAddType && (
				<AddDecreaseTypeModal
					value={newTypeName}
					onChange={setNewTypeName}
					onSubmit={() => {
						onAddType(newTypeName)
						setShowAddType(false)
						setNewTypeName('')
					}}
					onClose={() => setShowAddType(false)}
				/>
			)}

			{showAddItem && activeTypeId && (
				<AddDecreaseItemModal
					title={newItemTitle}
					amount={newItemAmount}
					onTitleChange={setNewItemTitle}
					onAmountChange={setNewItemAmount}
					onSubmit={() => {
						onAddItem(activeTypeId, newItemTitle, Number(newItemAmount))
						setShowAddItem(false)
						setNewItemTitle('')
						setNewItemAmount('')
					}}
					onClose={() => setShowAddItem(false)}
				/>
			)}

			{deleteTypeId !== null && (
				<ConfirmDeleteModal
					title='Usunąć kategorię przychodu?'
					description='Wszystkie pozycje w tej kategorii zostaną trwale usunięte.'
					onConfirm={() => {
						onDeleteType(deleteTypeId)
						setDeleteTypeId(null)
					}}
					onCancel={() => setDeleteTypeId(null)}
				/>
			)}

			{deleteItemId !== null && (
				<ConfirmDeleteModal
					title='Usunąć pozycję przychodu?'
					description='Ta pozycja przychodu zostanie trwale usunięta.'
					onConfirm={() => {
						onDeleteItem(deleteItemId)
						setDeleteItemId(null)
					}}
					onCancel={() => setDeleteItemId(null)}
				/>
			)}

			{cannotDeleteType && (
				<CannotDeleteTypeModal
					description={`Kategoria "${cannotDeleteType.name}" zawiera przypisane pozycje przychodów. Usuń najpierw wszystkie pozycje w tej kategorii.`}
					onClose={() => setCannotDeleteType(null)}
				/>
			)}
		</div>
	)
}
