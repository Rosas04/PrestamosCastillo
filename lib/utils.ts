import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function formatCurrency(value: number): string {
  return value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función para obtener el seguimiento de préstamos diarios POR CLIENTE
export function getClientDailyLoanTracking(clientDocumentNumber: string): {
  totalAmount: number
  date: string
  limit: number
} {
  try {
    const today = new Date().toISOString().split("T")[0]
    const storedTrackingKey = `dailyLoanTracking:${clientDocumentNumber}`
    const storedTracking = localStorage.getItem(storedTrackingKey)

    if (storedTracking) {
      const tracking = JSON.parse(storedTracking)

      // Si la fecha almacenada es hoy, devolver el seguimiento
      if (tracking.date === today) {
        return tracking
      }
    }

    // Si no existe seguimiento o no es de hoy, crear uno nuevo
    const newTracking = {
      date: today,
      totalAmount: 0,
      limit: 5000, // Límite diario por cliente: 5,000 soles
    }

    localStorage.setItem(storedTrackingKey, JSON.stringify(newTracking))
    return newTracking
  } catch (error) {
    console.error("Error getting client daily loan tracking:", error)
    return {
      date: new Date().toISOString().split("T")[0],
      totalAmount: 0,
      limit: 5000,
    }
  }
}

// Función para actualizar el monto de préstamo diario POR CLIENTE
export function updateClientDailyLoanAmount(clientDocumentNumber: string, amount: number): number {
  try {
    const tracking = getClientDailyLoanTracking(clientDocumentNumber)
    const updatedAmount = tracking.totalAmount + amount
    const today = new Date().toISOString().split("T")[0]

    const updatedTracking = {
      date: today,
      totalAmount: updatedAmount,
      limit: 5000,
    }

    localStorage.setItem(`dailyLoanTracking:${clientDocumentNumber}`, JSON.stringify(updatedTracking))
    return 5000 - updatedAmount // Devuelve el límite restante
  } catch (error) {
    console.error("Error updating client daily loan amount:", error)
    return 5000
  }
}

// Función para obtener el límite diario restante POR CLIENTE
export function getClientRemainingDailyLimit(clientDocumentNumber: string): number {
  try {
    const tracking = getClientDailyLoanTracking(clientDocumentNumber)
    return 5000 - tracking.totalAmount
  } catch (error) {
    console.error("Error getting client remaining daily limit:", error)
    return 5000
  }
}

// Función para verificar el límite mensual por cliente
export function getClientMonthlyLoanAmount(clientDocumentNumber: string): number {
  try {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const storedLoans = localStorage.getItem("loans")

    if (!storedLoans) return 0

    const loans = JSON.parse(storedLoans)

    // Filtrar préstamos del mismo cliente en el mes actual
    const clientLoansThisMonth = loans.filter((loan) => {
      const loanDate = new Date(loan.createdAt)
      return (
        loan.clientData.numeroDocumento === clientDocumentNumber &&
        loanDate.getMonth() === currentMonth &&
        loanDate.getFullYear() === currentYear
      )
    })

    // Calcular el total prestado a este cliente en el mes actual
    return clientLoansThisMonth.reduce((total, loan) => total + loan.loanData.amount, 0)
  } catch (error) {
    console.error("Error getting client monthly loan amount:", error)
    return 0
  }
}

// Función para verificar si un nuevo préstamo excede el límite mensual
export function checkClientMonthlyLimit(clientDocumentNumber: string, newAmount: number): boolean {
  const currentAmount = getClientMonthlyLoanAmount(clientDocumentNumber)
  return currentAmount + newAmount <= 20000 // Límite mensual por cliente: 20,000 soles
}

// Calcular el monto total a pagar (capital + intereses)
export function calculateTotalPayment(schedule: any[]): number {
  return schedule.reduce((total, payment) => total + payment.monthlyPayment, 0)
}

// Mantener estas funciones para compatibilidad con el código existente
export function getDailyLoanTracking(): { totalAmount: number; date: string; limit: number } {
  return {
    date: new Date().toISOString().split("T")[0],
    totalAmount: 0,
    limit: 5000,
  }
}

export function updateDailyLoanAmount(amount: number): number {
  return 5000
}

export function getRemainingDailyLimitAmount(): number {
  return 5000
}
