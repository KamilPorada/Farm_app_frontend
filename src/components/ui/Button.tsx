import React from 'react'

type ButtonProps = {
	className?: string
	href?: string
	onClick?: () => void
	disabled?: boolean
	children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({ className = '', href, onClick, disabled = false, children }) => {
	const baseClasses = `
		relative overflow-hidden
		bg-mainColor text-white
		uppercase font-bold
		rounded-md
        cursor-pointer

		/* RESPONSYWNOŚĆ */
		px-3 py-2 text-sm
		sm:px-4 sm:py-2 
		lg:px-6 lg:py-3

		/* ANIMACJA */
		transition-all duration-200

		/* SLIDE LIGHT */
		before:content-['']
		before:absolute
		before:top-0
		before:left-[-130%]
		before:w-[50%]
		before:h-full
		before:bg-white/25
		before:skew-x-[-20deg]

		before:transition-all
		before:duration-1000
		hover:before:left-[120%]
        hover:scale-95
	`

	const disabledClasses = `
		bg-zinc-500
		cursor-not-allowed
		before:hidden
        hover:scale-100
        hover:cursor-auto

	`

	const finalClassName = `
		${baseClasses}
		${disabled ? disabledClasses : ''}
		${className}
	`

	if (href) {
		return (
			<a href={href} className={finalClassName}>
				{children}
			</a>
		)
	}

	return (
		<button className={finalClassName} onClick={onClick} disabled={disabled}>
			<span className='relative z-10'>{children}</span>
		</button>
	)
}

export default Button
