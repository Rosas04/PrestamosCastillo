export interface ClientData {
  tipoPersona: "natural" | "juridica"
  nombre?: string
  razonSocial?: string
  representanteLegal?: string
  tipoDocumento: string
  numeroDocumento: string
  direccion?: string
  correo?: string
}

export interface LoanData {
  amount: number
  term: number
  annualRate: number
  startDate: Date
}

export interface PaymentScheduleData {
  paymentNumber: number
  paymentDate: Date
  monthlyPayment: number
  interest: number
  principal: number
  remainingBalance: number
}

export type UserRole = "admin" | "manager" | "agent"

export interface User {
  id: string
  username: string
  password: string
  fullName: string
  email: string
  role: UserRole
  active: boolean
  createdAt: string
  lastLogin?: string
}

export interface StoredLoan {
  id: string
  clientData: ClientData
  loanData: LoanData
  schedule: PaymentScheduleData[]
  isCompleted: boolean
  createdAt: string
  createdBy: string
  status: "pending" | "approved" | "rejected" | "completed"
  approvedBy?: string
  approvedAt?: string
  paidInstallments?: number[] // Números de cuotas pagadas
}

export interface DailyLoanTracking {
  date: string
  totalAmount: number
  limit: number
}

export interface Permission {
  create: boolean
  read: boolean
  update: boolean
  delete: boolean
  approve: boolean
  manage: boolean
}

export interface RolePermissions {
  loans: Permission
  users: Permission
  reports: Permission
  settings: Permission
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  permissions: RolePermissions | null
}

export interface PaymentRecord {
  installmentNumber: number
  paymentDate: string
  amount: number
  paymentMethod: string
}
