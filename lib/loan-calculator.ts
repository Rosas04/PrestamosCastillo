import type { LoanData, PaymentScheduleData } from "./types"

// Corregir el cálculo de fechas para evitar problemas con meses
export function calculatePaymentSchedule(loan: LoanData): PaymentScheduleData[] {
  const { amount, term, annualRate, startDate } = loan

  // Convertir tasa anual a mensual
  const monthlyRate = annualRate / 10 / 12

  // Calcular cuota mensual usando el método francés
  // Fórmula: C = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
  // Donde:
  // C = Cuota mensual
  // P = Monto del préstamo
  // r = Tasa de interés mensual
  // n = Número de cuotas

  const monthlyPayment =
    (amount * (monthlyRate * Math.pow(1 + monthlyRate, term))) / (Math.pow(1 + monthlyRate, term) - 1)

  const schedule: PaymentScheduleData[] = []
  let remainingBalance = amount

  for (let i = 1; i <= term; i++) {
    // Calcular fecha de pago - corregir el cálculo para evitar problemas con meses
    const paymentDate = new Date(startDate)

    // Usar una forma más segura de agregar meses
    const year = paymentDate.getFullYear()
    const month = paymentDate.getMonth()
    const day = paymentDate.getDate()

    // Crear nueva fecha sumando i meses
    const newDate = new Date(year, month + i, day)

    // Calcular interés del período
    const interest = remainingBalance * monthlyRate

    // Calcular amortización de capital
    const principal = monthlyPayment - interest

    // Actualizar saldo
    remainingBalance -= principal

    // Ajustar el saldo final para evitar errores de redondeo
    const adjustedBalance = i === term ? 0 : remainingBalance

    schedule.push({
      paymentNumber: i,
      paymentDate: newDate,
      monthlyPayment,
      interest,
      principal,
      remainingBalance: adjustedBalance,
    })
  }

  return schedule
}
