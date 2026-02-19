import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import type { WorkTime } from '../../types/Employee'
import WorkTimeModal from './WorkTimeModal'
import ConfirmDeleteModal from '../ui/ConfirmDeleteModal'
import SystemButton from '../ui/SystemButton'
import { useFormatUtils } from '../../hooks/useFormatUtils'

type Props = {
	items: WorkTime[]
	onCreate: (hours: number, paid: number | null, date: string) => void
	onUpdate: (id: number, data: { type: 'hours' | 'amount'; value: number | null }) => void
	onDelete: (id: number) => void
	isFinished?: boolean
	notify?: (type: 'info' | 'success' | 'error', message: string) => void
}

export default function WorkTimeTable({ items, onCreate, onUpdate, onDelete, isFinished, notify }: Props) {
	const { getCurrencySymbol, formatDate } = useFormatUtils()
	const [editingId, setEditingId] = useState<number | null>(null)
	const [editingField, setEditingField] = useState<'hours' | 'paid' | null>(null)
	const [value, setValue] = useState('')
	const [showModal, setShowModal] = useState(false)

	const [toDeleteId, setToDeleteId] = useState<number | null>(null)

	function startEdit(id: number, field: 'hours' | 'paid', current: number | null) {
		setEditingId(id)
		setEditingField(field)
		setValue(current?.toString() ?? '')
	}

	function saveEdit() {
		if (editingId === null || !editingField) return

		if (editingField === 'hours') {
			onUpdate(editingId, { type: 'hours', value: Number(value) })
		} else {
			onUpdate(editingId, {
				type: 'amount',
				value: value === '' ? null : Number(value),
			})
		}

		setEditingId(null)
		setEditingField(null)
	}

	function blockedEditInfo() {
		notify?.('info', 'Pracownik zakończył pracę w tym sezonie!')
	}

	return (
		<div className='bg-white rounded-xl py-3'>
			{/* BRAK WPISÓW */}
			{items.length === 0 ? (
				<div className='flex flex-col items-center justify-center py-16 text-center h-[39vh]'>
					<p className='text-base font-medium text-gray-700'>Brak wpisów czasu pracy</p>

					<p className='mt-2 text-sm text-gray-500 max-w-md'>
						Dodaj pierwszy wpis, aby rozpocząć ewidencję pracy pracownika.
					</p>

					{!isFinished && (
						<SystemButton className='mt-5 normal-case' onClick={() => setShowModal(true)}>
							+ Dodaj wpis
						</SystemButton>
					)}
				</div>
			) : (
				<>
					{/* HEADER */}
					<div className='flex justify-between items-center gap-2 mb-4 px-5'>
						<h3 className='md:text-lg font-semibold'>Ewidencja pracy</h3>
						<SystemButton
							className='normal-case w-full justify-center md:w-auto'
							onClick={() => (isFinished ? blockedEditInfo() : setShowModal(true))}>
							+ Dodaj wpis
						</SystemButton>
					</div>

					{/* COLUMN HEADERS */}
					<div className='grid grid-cols-[3fr_2fr_2fr_1fr] bg-gray-50 text-gray-600 text-xs md:text-sm font-medium py-2 px-5'>
						<span>Data</span>
						<span>Godziny</span>
						<span>Wypłata</span>
						<span className='text-right'>Akcja</span>
					</div>

					{/* ROWS */}
					<div className='max-h-[39vh] overflow-y-auto'>
						{items.map(w => (
							<div
								key={w.id}
								className='grid grid-cols-[3fr_2fr_2fr_1fr] items-center py-2 px-5 border-t last:border-b border-gray-200 hover:bg-gray-50'>
								<span className='text-xs md:text-sm text-gray-800'>{formatDate(w.workDate)}</span>

								{/* HOURS */}
								<span
									className={`text-xs md:text-sm ${!isFinished ? 'cursor-pointer hover:text-mainColor' : ''}`}
									onClick={() => (isFinished ? blockedEditInfo() : startEdit(w.id, 'hours', w.hoursWorked))}>
									{editingId === w.id && editingField === 'hours' ? (
										<input
											autoFocus
											type='number'
											value={value}
											onChange={e => setValue(e.target.value)}
											onBlur={saveEdit}
											onKeyDown={e => e.key === 'Enter' && saveEdit()}
											className='border rounded px-2 py-1 w-16'
										/>
									) : (
										`${w.hoursWorked} h`
									)}
								</span>

								{/* PAID */}
								<span
									className={`text-xs md:text-sm ${!isFinished ? 'cursor-pointer hover:text-mainColor' : ''}`}
									onClick={() => (isFinished ? blockedEditInfo() : startEdit(w.id, 'paid', w.paidAmount ?? null))}>
									{editingId === w.id && editingField === 'paid' ? (
										<input
											autoFocus
											type='number'
											value={value}
											onChange={e => setValue(e.target.value)}
											onBlur={saveEdit}
											onKeyDown={e => e.key === 'Enter' && saveEdit()}
											className='border rounded px-2 py-1 w-20'
										/>
									) : w.paidAmount ? (
										`${w.paidAmount} ${getCurrencySymbol()}`
									) : (
										'—'
									)}
								</span>

								{/* DELETE */}
								<div className='flex justify-end text-xs md:text-sm'>
									<button
										onClick={() => (isFinished ? blockedEditInfo() : setToDeleteId(w.id))}
										className='text-gray-400 hover:text-red-500 cursor-pointer'>
										<FontAwesomeIcon icon={faTrash} />
									</button>
								</div>
							</div>
						))}
					</div>
				</>
			)}

			{/* ADD MODAL */}
			{showModal && (
				<WorkTimeModal
					onClose={() => setShowModal(false)}
					onSave={(h, p, d) => {
						onCreate(h, p, d)
						setShowModal(false)
					}}
				/>
			)}

			{/* DELETE CONFIRM */}
			{toDeleteId !== null && (
				<ConfirmDeleteModal
					title='Usunąć wpis?'
					description='Czy na pewno chcesz usunąć wpis czasu pracy pracownika?'
					onConfirm={() => {
						onDelete(toDeleteId)
						setToDeleteId(null)
					}}
					onCancel={() => setToDeleteId(null)}
				/>
			)}
		</div>
	)
}
