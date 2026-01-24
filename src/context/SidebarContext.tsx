import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

type SidebarContextType = {
	isOpen: boolean
	toggle: () => void
	open: () => void
	close: () => void
}

const SidebarContext = createContext<SidebarContextType | null>(null)

export function SidebarProvider({ children }: { children: ReactNode }) {
	const [isOpen, setIsOpen] = useState(false)

	const value: SidebarContextType = {
		isOpen,
		toggle: () => setIsOpen(prev => !prev),
		open: () => setIsOpen(true),
		close: () => setIsOpen(false),
	}

	return (
		<SidebarContext.Provider value={value}>
			{children}
		</SidebarContext.Provider>
	)
}

export function useSidebar() {
	const context = useContext(SidebarContext)
	if (!context) {
		throw new Error('useSidebar must be used inside SidebarProvider')
	}
	return context
}
