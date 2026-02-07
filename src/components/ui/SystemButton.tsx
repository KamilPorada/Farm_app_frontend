import React from 'react'
import { twMerge } from 'tailwind-merge'

type Variant = 'primary' | 'outline' | 'danger'

type SystemButtonProps = {
	children: React.ReactNode
	onClick?: () => void
	disabled?: boolean
	className?: string
	type?: 'button' | 'submit'
	variant?: Variant
}

export default function SystemButton({
	children,
	onClick,
	disabled = false,
	className,
	type = 'button',
	variant = 'primary',
}: SystemButtonProps) {
	const base =
		'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm text-center font-medium transition focus:outline-none focus:ring-2 focus:ring-mainColor/30 disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer'

	const variants: Record<Variant, string> = {
		primary:
			'bg-mainColor text-white hover:bg-mainColor/90',

		outline:
			'border border-mainColor bg-white text-mainColor hover:bg-mainColor/5',

		danger:
			'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/40',
	}

	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled}
			className={twMerge(base, variants[variant], className)}
		>
			{children}
		</button>
	)
}
