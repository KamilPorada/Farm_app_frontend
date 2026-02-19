import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuthUser } from '../../hooks/useAuthUser'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faChartLine,
	faSeedling,
	faGears,
	faUsers,
	faWarehouse,
	faFlask,
	faCoins,
	faBook,
	faChevronDown,
	faChevronUp,
	faRightFromBracket,
	faBars,
	faXmark,
} from '@fortawesome/free-solid-svg-icons'
import logotype from '../../assets/img/logotype.png'
import { useSidebar } from '../../context/SidebarContext'

type Section = {
	label: string
	icon: any
	items: { label: string; path: string }[]
}

const sections: Section[] = [
	{
		label: 'Sprzedaż papryki',
		icon: faSeedling,
		items: [
			{ label: 'Transakcje', path: '/app/trade' },
			{ label: 'Punkty sprzedaży', path: '/app/point-of-sale' },
			{ label: 'Analiza sprzedaży', path: '/app/sales-analysis' },
		],
	},
	{
		label: 'Kontrola finansów',
		icon: faCoins,
		items: [
			{ label: 'Wydatki', path: '/app/expense' },
			{ label: 'Faktury', path: '/app/invoice' },
			{ label: 'Przepływy finansowe', path: '/app/cash-flow' },
		],
	},
	{
		label: 'Kontrola zbiorów',
		icon: faWarehouse,
		items: [
			{ label: 'Odmiany', path: '/app/variete' },
			{ label: 'Zbiory', path: '/app/harvest' },
			{ label: 'Kalendarz uprawy', path: '/app/cultivation-calendar' },
		],
	},
	{
		label: 'Pracownicy',
		icon: faUsers,
		items: [{ label: 'Pracownicy sezonowi', path: '/app/employe' }],
	},
	{
		label: 'Ochrona roślin',
		icon: faFlask,
		items: [
			{ label: 'Pestycydy', path: '/app/pesticide' },
			{ label: 'Zabiegi', path: '/app/treatment' },
		],
	},
	{
		label: 'Nawożenie',
		icon: faSeedling,
		items: [
			{ label: 'Nawozy', path: '/app/fertilizer' },
			{ label: 'Fertygacja', path: '/app/fertilisation' },
		],
	},
	{
		label: 'Dziennik',
		icon: faBook,
		items: [{ label: 'Notatki', path: '/app/note' }],
	},
]

function Sidebar() {
	const { user, logout } = useAuthUser()
	const [open, setOpen] = useState<string | null>(null)
	const { isOpen, toggle } = useSidebar()

	function getInitials(firstName?: string, lastName?: string) {
		if (!firstName && !lastName) return '?'

		const first = firstName?.charAt(0) ?? ''
		const last = lastName?.charAt(0) ?? ''

		return (first + last).toUpperCase()
	}

	function hasRealAvatar(picture?: string) {
		if (!picture) return false

		return !picture.includes('gravatar.com') && !picture.includes('d=blank')
	}

	return (
		<>
			<button
				onClick={toggle}
				className={`fixed left-4 top-4 z-50 rounded-md  p-2 ${
					isOpen ? 'text-white hover:bg-white/10 ' : 'text-black hover:bg-black/10 '
				} transition-transform duration-300 hover:cursor-pointer`}
				aria-label='Toggle menu'>
				<FontAwesomeIcon icon={isOpen ? faXmark : faBars} />
			</button>

			<aside
				className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-mainColor px-1 py-6 text-white
	transition-transform duration-300
	${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
				{/* ===== USER ===== */}
				<div className='mb-6 flex flex-col items-center text-center'>
					<div className='relative'>
						{/* AVATAR USERA */}
						<div className='h-28 w-28 rounded-full border-2 border-white overflow-hidden flex items-center justify-center bg-white'>
							{hasRealAvatar(user?.picture ?? undefined) ? (
								<img src={user!.picture!} alt='Avatar' className='h-full w-full object-cover' />
							) : (
								<span className='text-mainColor text-5xl font-bold select-none'>
									{getInitials(user?.firstName, user?.lastName)}
								</span>
							)}
						</div>

						{/* LOGOTYP APLIKACJI (BADGE) */}
						<div className='absolute -bottom-3 -right-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-white shadow'>
							<img src={logotype} alt='App logo' className='h-8 w-8 object-contain' />
						</div>
					</div>

					<p className='mt-5 font-semibold text-white'>
						{user?.firstName} {user?.lastName}
					</p>
					<p className='text-sm text-white/80'>{user?.email}</p>
				</div>

				{/* ===== NAV ===== */}
				<NavLink
					to='/app'
					end
					className='flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm md:text-base hover:bg-white/10'>
					<FontAwesomeIcon icon={faChartLine} className='text-white' />
					Dashboard
				</NavLink>
				<nav className='flex-1 space-y-1'>
					{sections.map(section => (
						<div key={section.label}>
							<button
								onClick={() => setOpen(open === section.label ? null : section.label)}
								className='flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm md:text-base hover:bg-white/10 hover:cursor-pointer'>
								<FontAwesomeIcon icon={section.icon} className='w-4 text-white' />
								<span className='flex-1'>{section.label}</span>
								<FontAwesomeIcon
									icon={open === section.label ? faChevronUp : faChevronDown}
									className='text-xs opacity-70'
								/>
							</button>

							{/* ===== SUBMENU (TREE) ===== */}
							{open === section.label && (
								<div className='relative ml-6 mt-1 border-l border-white/30 pl-4'>
									{section.items.map(item => (
										<NavLink
											key={item.path}
											to={item.path}
											onClick={() => setOpen(null)}
											className={({ isActive }) =>
												`relative block py-1.5 text-sm
											before:absolute before:-left-4 before:top-1/2 before:h-px before:w-3 before:bg-white/30
											${isActive ? 'text-white font-medium' : 'text-white/80 hover:text-white'}`
											}>
											{item.label}
										</NavLink>
									))}
								</div>
							)}
						</div>
					))}
				</nav>

				{/* ===== LOGOUT ===== */}
				<div>
					<NavLink
						to='/app/settings'
						className='flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm md:text-base hover:bg-white/10 hover:cursor-pointer'>
						<FontAwesomeIcon icon={faGears} className='text-white' />
						Ustawienia
					</NavLink>
					<button
						onClick={() => logout()}
						className='flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm md:text-base hover:bg-white/10 hover:cursor-pointer'>
						<FontAwesomeIcon icon={faRightFromBracket} className='text-white' />
						Wyloguj się
					</button>
				</div>
				<div className='mt-2 border-t border-white/20 pt-4 text-center text-xs text-white'>
					© {new Date().getFullYear()} Asystent Producenta Papryki
				</div>
			</aside>
		</>
	)
}

export default Sidebar
