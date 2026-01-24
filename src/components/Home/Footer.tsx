'use client'
import Brand from '../ui/Brand'

const Footer = () => {
	return (
		<footer className='bg-white text-black pt-8 pb-4 px-6 mt-10  md:mt-30 container '>
			<div className='max-w-6xl mx-auto flex flex-col lg:flex-row lg:justify-between gap-8 text-center lg:text-left'>
				{/* Logo & motto */}
				<div className='flex flex-col items-center lg:items-start space-y-3'>
					<Brand />
					<div>
						<p className='font-thin max-w-xs'>Asystent producenta do pierwszych decyzji aż po zbiory.</p>
					</div>
				</div>

				{/* Linki nawigacyjne */}
				<div>
					<h3 className='text-lg font-semibold text-black mb-2'>Nawigacja</h3>
					<ul className='space-y-2 font-thin'>
						<li>
							<a href='#aboutRegion' className='hover:text-mainColor transition'>
								Misja
							</a>
						</li>
						<li>
							<a href='#timeline' className='hover:text-mainColor transition'>
								Historia regionu
							</a>
						</li>
						<li>
							<a href='#tools' className='hover:text-mainColor transition'>
								Narzędzia systemu
							</a>
						</li>
						<li>
							<a href='#keyFeatures' className='hover:text-mainColor transition'>
								Cechy platformy
							</a>
						</li>
					</ul>
				</div>

				{/* Portale warzywnicze */}
				<div>
					<h3 className='text-lg font-semibold text-black mb-2'>Portale warzywnicze</h3>
					<ul className='space-y-2 font-thin'>
						<li>
							<a
								href='https://www.producencipapryki.pl'
								target='_blank'
								rel='noopener noreferrer'
								className='hover:text-mainColor transition'>
								Zrzeszenie producentów papryki RP
							</a>
						</li>
						<li>
							<a
								href='https://www.mocpolskichwarzyw.pl'
								target='_blank'
								rel='noopener noreferrer'
								className='hover:text-mainColor transition'>
								Moc polskich warzyw
							</a>
						</li>
						<li>
							<a
								href='https://www.warzywa.pl'
								target='_blank'
								rel='noopener noreferrer'
								className='hover:text-mainColor transition'>
								Warzywa.pl
							</a>
						</li>
						<li>
							<a
								href='https://www.e-warzywnictwo.pl'
								target='_blank'
								rel='noopener noreferrer'
								className='hover:text-mainColor transition'>
								E-warzywnictwo.pl
							</a>
						</li>
					</ul>
				</div>
			</div>

			{/* Prawa autorskie na pełną szerokość */}
			<div className='text-center text-sm text-gblack mt-8 border-t border-gray-500 pt-4'>
				<p>
					©{new Date().getFullYear()} Asystent producenta papryki
					<br />
					Wszelkie prawa zastrzeżone
				</p>
			</div>
		</footer>
	)
}

export default Footer
