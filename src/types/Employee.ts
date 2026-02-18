export type Employee = {
	id: number
	farmerId: number
	firstName: string
	lastName: string
	nationality?: string | null
	age?: number | null
	salary: number
	startDate: string // ISO date (yyyy-MM-dd)
	finishDate?: string | null
	seasonYear: number
}

export type WorkTime = {
	id: number
	farmerId: number
	employeeId: number
	workDate: string 
	hoursWorked: number
	paidAmount?: number | null
}
