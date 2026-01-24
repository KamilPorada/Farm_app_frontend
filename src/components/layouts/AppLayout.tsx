import { Outlet } from 'react-router-dom'
import Sidebar from '../navigation/Sidebar'
import { useSidebar } from '../../context/SidebarContext'

function AppLayout() {
	const { isOpen } = useSidebar()

	return (
		<div className='flex min-h-screen bg-mainColor'>
			<Sidebar />
			<main className={`flex-1 ${isOpen ? 'ml-67' : 'ml-3'} m-3 p-6 bg-white rounded-xl`}>
				<Outlet />
			</main>
		</div>
	)
}

export default AppLayout
