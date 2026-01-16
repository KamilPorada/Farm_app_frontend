import React from 'react'
import logo from '../../assets/img/logoo.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons'
import Button from '../ui/Button'

/* ===== MENU BOCZNE ===== */
function SideMenu({ onClose }: { onClose: () => void }) {
	return (
		<div className='fixed inset-0 z-50'>
			{/* OVERLAY */}
			<div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={onClose} />

			{/* PANEL */}
			<div
				className='
					absolute top-0 right-0 h-full w-80 max-w-[85vw]
					bg-gradient-to-b from-white to-gray-50
					navigation-shadow
					flex flex-col
					animate-slide-in
					overflow-hidden
				'>
				{/* AKCENT KOLORU */}
				<div className='absolute left-0 top-0 h-full w-1 bg-mainColor' />

				{/* HEADER */}
				<div className='flex justify-between items-center p-5 border-b border-gray-200'>
					<img src={logo} alt='Logo' className='h-14 md:h-15 w-auto cursor-pointer' />

					<button onClick={onClose}>
						<FontAwesomeIcon
							icon={faXmark}
							className='text-2xl text-gray-700 hover:rotate-90 hover:cursor-pointer transition-transform'
						/>
					</button>
				</div>

				{/* NAV LINKI */}
				<div className='flex flex-col gap-6 px-6 mt-10'>
					<div className='mobile-nav-item delay-75'>
						<button className='mobile-nav-link'>O nas</button>
					</div>

					<div className='mobile-nav-item delay-100'>
						<button className='mobile-nav-link'>Funkcje</button>
					</div>

					<div className='mobile-nav-item delay-150'>
						<button className='mobile-nav-link'>Dane</button>
					</div>

					<div className='mobile-nav-item delay-200'>
						<button className='mobile-nav-link'>Kontakt</button>
					</div>
				</div>

				{/* CTA */}
				<div className='mt-auto p-6 border-t border-gray-200'>
					<Button className='w-full'>Zaloguj się</Button>
				</div>
			</div>
		</div>
	)
}

/* ===== NAVBAR ===== */
function Navbar() {
	const [menuOpen, setMenuOpen] = React.useState(false)

	return (
		<>
			<nav className='fixed top-5 left-0 w-full z-50 flex justify-center'>
				{/* CONTAINER = JEDYNA KONTROLA SZEROKOŚCI */}
				<div className='container flex items-center'>
					{/* LEWA / ŚRODEK – LOGO + MENU */}
					<div className='flex flex-1 items-center justify-between h-20 navigation-shadow bg-white px-4'>
						{/* LOGO + HAMBURGER (MOBILE) */}
						<div className='flex items-center justify-around gap-4 w-full sm:w-auto'>
							<img src={logo} alt='Logo' className='h-14 md:h-15 w-auto cursor-pointer' />

							{/* HAMBURGER – < sm */}
							<button onClick={() => setMenuOpen(true)} className='sm:hidden'>
								<FontAwesomeIcon icon={faBars} className='text-2xl text-gray-800 hover:cursor-pointer' />
							</button>
						</div>

						{/* MENU DESKTOP – lg+ */}
						<div className='hidden lg:flex'>
							<button className='nav-link border-r border-r-gray-200'>O nas</button>
							<button className='nav-link border-r border-r-gray-200'>Funkcje</button>
							<button className='nav-link border-r border-r-gray-200'>Dane</button>
							<button className='nav-link'>Kontakt</button>
						</div>
					</div>

					{/* PRAWA CZĘŚĆ – LOGIN + HAMBURGER (sm → lg) */}
					<div
						className="
          hidden sm:flex
          h-20
          items-center
          gap-7
          px-10
          bg-white
          navigation-shadow-2
          relative
          -top-2
          left-2
          before:content-['']
          before:absolute
          before:h-full
          before:w-2
          before:bg-[#e3e3e3]
          before:-left-2
          before:top-1
          before:[transform:skewX(0deg)_skewY(-45deg)]
        ">
						<Button>Zaloguj się</Button>

						{/* HAMBURGER – sm → lg */}
						<button onClick={() => setMenuOpen(true)} className='sm:flex lg:hidden'>
							<FontAwesomeIcon icon={faBars} className='text-2xl text-gray-800 hover:cursor-pointer' />
						</button>
					</div>
				</div>
			</nav>

			{/* MENU BOCZNE */}
			{menuOpen && <SideMenu onClose={() => setMenuOpen(false)} />}
		</>
	)
}

export default Navbar
