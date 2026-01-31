import { useEffect, useState } from 'react'

export function useCountUp(value: number, duration = 700) {
	const [display, setDisplay] = useState(0)

	useEffect(() => {
		let start = 0
		const startTime = performance.now()

		function tick(now: number) {
			const progress = Math.min((now - startTime) / duration, 1)
			const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
			setDisplay(start + eased * (value - start))

			if (progress < 1) requestAnimationFrame(tick)
		}

		requestAnimationFrame(tick)
	}, [value, duration])

	return display
}
