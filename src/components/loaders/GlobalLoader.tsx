import { MoonLoader } from 'react-spinners'

export default function GlobalLoader() {
	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur'>
			<MoonLoader size={50} />
		</div>
	)
}
