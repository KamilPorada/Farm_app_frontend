import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './routes/ProtectedRoute'
import AppLayout from './components/layouts/AppLayout'

import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import TradeOfPepper from './pages/TradeOfPepper'
import { SidebarProvider } from './context/SidebarContext'

function App() {
	return (
		<SidebarProvider>
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
					</Route>
				</Routes>
			</BrowserRouter>
		</SidebarProvider>
	)
}

export default App
