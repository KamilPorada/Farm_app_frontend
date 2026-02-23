import { useEffect, useState } from 'react'
import SectionHeader from '../../components/ui/SectionHeader'
import NoteList from '../../components/NoteComponents/NoteList'
import NoteForm from '../../components/NoteComponents/NoteForm'
import type { Note } from '../../types/Note'
import { useAuthUser } from '../../hooks/useAuthUser'
import { MoonLoader } from 'react-spinners'
import { notify } from '../../utils/notify'
import { useMeData } from '../../hooks/useMeData'

export default function NotePage() {
	const { user, getToken, isLoading } = useAuthUser()
	const { appSettings: globalSettings } = useMeData()
	const notificationsEnabled = globalSettings?.notificationsEnabled

	const [year, setYear] = useState(new Date().getFullYear())
	const [notes, setNotes] = useState<Note[]>([])
	const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list')
	const [active, setActive] = useState<Note | null>(null)
	const [loading, setLoading] = useState(false)

	const hasItems = notes.length > 0

	/* =======================
	   FETCH NOTES
	======================= */
	async function fetchNotes() {
		if (!user) return

		setLoading(true)

		try {
			const token = await getToken()

			const res = await fetch(`http://localhost:8080/api/notes/farmer/${user.id}/year/${year}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (!res.ok) {
				notify(notificationsEnabled, 'error', 'Nie udało się pobrać notatek!')
				return
			}

			const data: Note[] = await res.json()

			// sort newest first
			data.sort((a, b) => b.noteDate.localeCompare(a.noteDate))

			setNotes(data)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (!user || !globalSettings) return
		fetchNotes()
	}, [year, user, globalSettings])

	/* =======================
	   SAVE (ADD / EDIT)
	======================= */
	async function handleSave(note: Note) {
		if (!user) return

		const isEdit = mode === 'edit'
		const token = await getToken()

		const payload = {
			...note,
			farmerId: user.id,
		}

		try {
			const res = await fetch(`http://localhost:8080/api/notes${isEdit ? `/${note.id}` : ''}`, {
				method: isEdit ? 'PUT' : 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			})

			if (!res.ok) {
				notify(notificationsEnabled, 'error', isEdit ? 'Nie udało się zapisać zmian!' : 'Nie udało się dodać notatki!')
				return
			}

			await fetchNotes()

			notify(notificationsEnabled, 'success', isEdit ? 'Notatka została zaktualizowana!' : 'Notatka została dodana!')

			setMode('list')
			setActive(null)
		} catch (err) {}
	}

	/* =======================
	   DELETE
	======================= */
	async function handleDelete(note: Note) {
		if (!user) return

		const token = await getToken()

		try {
			const res = await fetch(`http://localhost:8080/api/notes/${note.id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (!res.ok) {
				notify(notificationsEnabled, 'error', 'Nie udało się usunąć notatki!')
				return
			}

			setNotes(prev => prev.filter(x => x.id !== note.id))

			notify(notificationsEnabled, 'success', 'Notatka została usunięta!')
			setMode('list')
		} catch (err) {}
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
				title='Notatki'
				description='Zapisuj ważne informacje z sezonu uprawy papryki'
				buttonTitle='Dodaj notatkę'
				year={year}
				setYear={setYear}
				onAdd={() => {
					setActive(null)
					setMode('add')
				}}
			/>

			{!hasItems && mode === 'list' ? (
				<div className='flex flex-col items-center justify-center py-24 text-center'>
					<p className='text-base font-medium text-gray-700'>Brak notatek</p>

					<p className='mt-2 text-sm text-gray-500 max-w-md'>
						Dodaj notatki, aby zapisywać ważne wydarzenia z sezonu.
					</p>
				</div>
			) : (
				<>
					{mode === 'list' && (
						<NoteList
							items={notes}
							onEdit={n => {
								setActive(n)
								setMode('edit')
							}}
							onDelete={handleDelete}
						/>
					)}
				</>
			)}

			{(mode === 'add' || mode === 'edit') && (
				<NoteForm
					initial={active}
					onCancel={() => {
						setActive(null)
						setMode('list')
					}}
					onSave={handleSave}
				/>
			)}
		</div>
	)
}
