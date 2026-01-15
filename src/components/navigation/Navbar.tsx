import React from 'react'
import logo from '../../assets/img/logoo.png'

function Navbar() {
	return (
		<nav className='flex flex-row justify-between items-center w-full mt-6 container relative'>
			<div className='flex items-center justify-around h-20 w-4/5 navigation-shadow bg-white'>
				{/* LEWA CZĘŚĆ – LOGO */}
				<div className='flex items-center'>
					<img src={logo} alt='Logo' className='h-15 w-auto cursor-pointer' />
				</div>

				{/* ŚRODEK – MENU */}
				<div className='hidden md:flex'>
					<button className='nav-link border-r border-r-gray-200'>
						O nas
					</button>
					<button className='nav-link border-r border-r-gray-200'>
						Funkcje
					</button>
					<button className='nav-link border-r border-r-gray-200'>
						Dane
					</button>
					<button className='nav-link'>
						Kontakt
					</button>
				</div>
			</div>

			{/* PRAWA CZĘŚĆ – LOGIN */}
			<div
				className="w-1/5 h-20 flex justify-center items-center  bg-white -top-2 -right-2 navigation-shadow-2 relative before:content-[''] before:block before:absolute before:h-full before:w-2 before:bg-[#e3e3e3] before:-left-2 before:top-1 before:transform-[skewX(0deg)_skewY(-45deg)]
  ">
				<button
					className='
    bg-mainColor text-white
    px-4 py-2
    rounded-md
    uppercase font-bold
    cursor-pointer
    transition-transform duration-200
    hover:scale-105
  '>
					Zaloguj się
				</button>
			</div>
			{/* <div className='-skew-x-6 w-3 h-full bg-[#e3e3e3]'></div> */}
		</nav>
	)
}

export default Navbar
