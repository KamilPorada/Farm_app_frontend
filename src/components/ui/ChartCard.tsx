import React from 'react'

type Props = {
	title?: string
	children: React.ReactNode
	className?: string
}

export default function ChartCard({ title, children, className = '' }: Props) {
	return (
		<div
			className={`
				relative
				bg-white
				p-3 md:p-6
				border border-gray-300 shadow-md
				rounded-lg
				${className}
			`}
		>
			{title && (
				<div className="mb-5 flex items-center gap-1">
					<span className="h-4 w-0.75 bg-mainColor rounded-full" />
					<h3 className="text-xs font-semibold uppercase tracking-wide text-black">
						{title}
					</h3>
				</div>
			)}

			<div className="w-full">{children}</div>
		</div>
	)
}
