import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuthUser } from './hooks/useAuthUser'
import ProtectedRoute from './routes/ProtectedRoute'
import AppLayout from './components/layouts/AppLayout'

import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import TradeOfPepper from './pages/TradeOfPepper'
import SettingsPage from './pages/SettingsPage'
import { SidebarProvider } from './context/SidebarContext'
import { Toaster } from 'sonner'
import GlobalLoader from './components/loaders/GlobalLoader'

function App() {
	const { isAuthenticated, isLoading } = useAuthUser()

	useEffect(() => {
		const html = document.documentElement

		if (isAuthenticated) {
			html.classList.add('is-authenticated')
		} else {
			html.classList.remove('is-authenticated')
		}

		return () => {
			html.classList.remove('is-authenticated')
		}
	}, [isAuthenticated])

	return (
		<>
			{isLoading && <GlobalLoader />}
			<SidebarProvider>
				<Toaster richColors closeButton offset={25} position='top-right' />

				<BrowserRouter>
					<Routes>
						<Route path='/' element={<LandingPage />} />

						<Route
							path='/app'
							element={
								<ProtectedRoute>
									<AppLayout />
								</ProtectedRoute>
							}>
							<Route index element={<Dashboard />} />
							<Route path='trade' element={<TradeOfPepper />} />
							<Route path='settings' element={<SettingsPage />} />
						</Route>
					</Routes>
				</BrowserRouter>
			</SidebarProvider>
		</>
	)
}

export default App
