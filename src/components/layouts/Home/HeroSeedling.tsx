import heroSeedlingSmall from '../../../assets/img/seedling-small.jpg'
import heroSeedlingBig from '../../../assets/img/seedling-big.jpg'

const HeroSeedling = () => {
	return (
		<div className='relative w-screen h-96'>
			<img
				src={heroSeedlingSmall}
				alt='Hero Seedling Image Small'
				className='md:hidden absolute inset-0 w-full h-full object-cover'
			/>
			<img
				src={heroSeedlingBig}
				alt='Hero Seedling Image Big'
				className='hidden md:block absolute inset-0 w-full h-full object-cover'
			/>

			{/* overlay */}
			<div className='absolute inset-0 bg-black/60'></div>

			{/* tekst */}
			<div className='absolute inset-0 flex items-center justify-center px-6'>
				<div className='max-w-4xl text-center text-white'>
					<h2 className='text-3xl md:text-4xl lg:text-5xl font- leading-12'>
						Uprawiaj paprykę z asystentem <br /> który analizuje za Ciebie
					</h2>

					<div className='mt-10 flex flex-wrap justify-center gap-6 text-sm'>
						{['Sprzedaż', 'Wydatki', 'Zbiory', 'Analiza', 'Zabiegi'].map(step => (
							<div key={step} className='px-6 py-3 rounded-full border border-white/40 backdrop-blur-sm'>
								{step}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}

export default HeroSeedling
