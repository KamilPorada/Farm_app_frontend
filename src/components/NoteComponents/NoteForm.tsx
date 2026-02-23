import { useState } from 'react'
import SystemButton from '../ui/SystemButton'
import type { Note } from '../../types/Note'

type Props = {
	initial: Note | null
	onSave: (note: Note) => void
	onCancel: () => void
}

type Errors = {
	noteDate?: string
	title?: string
	content?: string
}

export default function NoteForm({ initial, onSave, onCancel }: Props) {
	const MAX_CONTENT_LENGTH = 1000
	const [errors, setErrors] = useState<Errors>({})

	const [form, setForm] = useState<Note>({
		id: initial?.id,
		farmerId: initial?.farmerId ?? 0,
		title: initial?.title ?? '',
		content: initial?.content ?? '',
		noteDate: initial?.noteDate ?? new Date().toISOString().split('T')[0],
	})

	/* =======================
	   VALIDATION
	======================= */
	function validate(): boolean {
		const e: Errors = {}

		if (!form.noteDate) {
			e.noteDate = 'Wybierz datę'
		}

		if (!form.title.trim()) {
			e.title = 'Podaj tytuł'
		} else if (form.title.trim().length < 3) {
			e.title = 'Tytuł musi mieć minimum 3 znaki'
		}

		if (!form.content.trim()) {
			e.content = 'Treść notatki nie może być pusta'
		} else if (form.content.trim().length < 5) {
			e.content = 'Treść musi mieć minimum 5 znaków'
		}

		setErrors(e)
		return Object.keys(e).length === 0
	}

	function handleSave() {
		if (!validate()) return
		onSave(form)
	}

	return (
		<section className='mt-6 border-t pt-4'>
			<h2 className='text-xl font-semibold'>{initial ? 'Edytuj notatkę' : 'Dodaj notatkę'}</h2>

			<div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-2'>
				{/* DATE */}
				<Input
					label='Data'
					type='date'
					value={form.noteDate}
					error={errors.noteDate}
					onChange={e => setForm(p => ({ ...p, noteDate: e.target.value }))}
				/>

				{/* TITLE */}
				<Input
					label='Tytuł'
					value={form.title}
					error={errors.title}
					onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
				/>

				{/* CONTENT */}
				<div className='md:col-span-2'>
					<div>
						<Textarea
							label='Treść notatki'
							rows={6}
							maxLength={MAX_CONTENT_LENGTH}
							placeholder='Zapisz ważne informacje z uprawy, obserwacje lub wydarzenia...'
							value={form.content}
							error={errors.content}
							onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
						/>

						<div className='mt-1 text-right text-xs text-gray-500'>
							<span
								className={
									form.content.length > MAX_CONTENT_LENGTH
										? 'text-red-600'
										: form.content.length > MAX_CONTENT_LENGTH * 0.9
											? 'text-orange-500'
											: ''
								}>
								{form.content.length} / {MAX_CONTENT_LENGTH}
							</span>
						</div>
					</div>
				</div>
			</div>

			<div className='mt-6 flex gap-3'>
				<SystemButton onClick={handleSave}>Zapisz</SystemButton>

				<SystemButton variant='outline' onClick={onCancel}>
					Anuluj
				</SystemButton>
			</div>
		</section>
	)
}

/* =======================
   INPUT
======================= */
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
	label: string
	error?: string
}

function Input({ label, error, ...props }: InputProps) {
	return (
		<div>
			<label className='block text-sm font-medium text-gray-700'>{label}</label>

			<input
				{...props}
				className={`mt-1 w-full rounded-md border px-3 py-2 text-sm ${error ? 'border-red-500' : ''}`}
			/>

			{error && <p className='mt-1 text-xs text-red-600'>{error}</p>}
		</div>
	)
}

/* =======================
   TEXTAREA
======================= */
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
	label: string
	error?: string
}

function Textarea({ label, error, ...props }: TextareaProps) {
	return (
		<div>
			<label className='block text-sm font-medium text-gray-700'>{label}</label>

			<textarea
				{...props}
				className={`mt-1 w-full rounded-md border px-3 py-2 text-sm resize-none ${error ? 'border-red-500' : ''}`}
			/>

			{error && <p className='mt-1 text-xs text-red-600'>{error}</p>}
		</div>
	)
}
