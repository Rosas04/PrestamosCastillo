"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { Dashboard } from "@/components/dashboard"
import { isAuthenticated, initializeUsers } from "@/lib/auth"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showApiInfo, setShowApiInfo] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Initialize default users if they don't exist
    initializeUsers()

    // Verificar si el usuario está autenticado
    const checkAuth = async () => {
      const authState = await isAuthenticated()
      setIsLoggedIn(authState.isAuthenticated)
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
    setShowApiInfo(true)

    // Ocultar la información de API después de 10 segundos
    setTimeout(() => {
      setShowApiInfo(false)
    }, 10000)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-2">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {!isLoggedIn ? (
        <div className="container mx-auto flex h-screen items-center justify-center px-4">
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        </div>
      ) : (
        <>
          {showApiInfo && (
            <div className="container mx-auto mt-4 px-4">
            </div>
          )}
          <Dashboard onLogout={handleLogout} />
        </>
      )}
    </main>
  )
}
