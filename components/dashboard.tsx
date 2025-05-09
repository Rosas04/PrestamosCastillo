"use client"

import { useState, useEffect } from "react"
import { HomePage } from "@/components/home-page"
import { LoanFormWithSearch } from "@/components/loan-form-with-search"
import { PaymentSchedule } from "@/components/payment-schedule"
import { LoansList } from "@/components/loans-list"
import { LoanDetail } from "@/components/loan-detail"
import { UserManagement } from "@/components/user-management"
import { Sidebar } from "@/components/sidebar"
import { isAuthenticated, logout } from "@/lib/auth"
import type { ClientData, LoanData, PaymentScheduleData, StoredLoan, AuthState } from "@/lib/types"

interface DashboardProps {
  onLogout: () => void
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("home")
  const [clientData, setClientData] = useState<ClientData | null>(null)
  const [loanData, setLoanData] = useState<LoanData | null>(null)
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentScheduleData[] | null>(null)
  const [selectedLoan, setSelectedLoan] = useState<StoredLoan | null>(null)
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    permissions: null,
  })

  useEffect(() => {
    const checkAuth = async () => {
      const state = await isAuthenticated()
      setAuthState(state)
    }

    checkAuth()
  }, [])

  const handleLoanGenerated = (client: ClientData, loan: LoanData, schedule: PaymentScheduleData[]) => {
    setClientData(client)
    setLoanData(loan)
    setPaymentSchedule(schedule)
    setActiveTab("schedule")
  }

  const handleNewLoan = () => {
    setClientData(null)
    setLoanData(null)
    setPaymentSchedule(null)
    setSelectedLoan(null)
    setActiveTab("loan")
  }

  const handleViewLoan = (loan: StoredLoan) => {
    setSelectedLoan(loan)
    setActiveTab("loanDetail")
  }

  const handleBackToLoans = () => {
    setSelectedLoan(null)
    setActiveTab("loans")
  }

  const handleLogout = () => {
    logout()
    onLogout()
  }

  // Reset the loan viewing state when switching tabs
  useEffect(() => {
    if (activeTab !== "loanDetail" && activeTab !== "schedule") {
      setSelectedLoan(null)
    }
  }, [activeTab])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        scheduleGenerated={!!paymentSchedule}
        permissions={authState.permissions}
      />

      <div className="flex-1 overflow-auto">
        <main className="container py-8 px-4">
          {activeTab === "home" && <HomePage onNavigate={setActiveTab} />}

          {activeTab === "loan" && (
            <LoanFormWithSearch onLoanGenerated={handleLoanGenerated} currentUser={authState.user} />
          )}

          {activeTab === "schedule" && clientData && loanData && paymentSchedule && (
            <>
              <PaymentSchedule clientData={clientData} loanData={loanData} paymentSchedule={paymentSchedule} />
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleNewLoan}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Nuevo Préstamo
                </button>
              </div>
            </>
          )}

          {activeTab === "loans" && (
            <LoansList onViewLoan={handleViewLoan} currentUser={authState.user} permissions={authState.permissions} />
          )}

          {activeTab === "loanDetail" && selectedLoan && (
            <LoanDetail
              loan={selectedLoan}
              onBack={handleBackToLoans}
              currentUser={authState.user}
              permissions={authState.permissions}
            />
          )}

          {activeTab === "users" && <UserManagement currentUserPermissions={authState.permissions} />}
        </main>
      </div>
    </div>
  )
}
