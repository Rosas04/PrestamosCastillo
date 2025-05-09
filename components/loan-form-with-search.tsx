"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { ClientData, LoanData, PaymentScheduleData, User, StoredLoan } from "@/lib/types"
import { searchClient, sendLoanRegistrationEmail } from "@/lib/api"
import { calculatePaymentSchedule } from "@/lib/loan-calculator"
import {
  getClientRemainingDailyLimit,
  updateClientDailyLoanAmount,
  getClientMonthlyLoanAmount,
  checkClientMonthlyLimit,
} from "@/lib/utils"
import { v4 as uuidv4 } from "uuid"

interface LoanFormWithSearchProps {
  onLoanGenerated: (client: ClientData, loan: LoanData, schedule: PaymentScheduleData[]) => void
  currentUser: User | null
}

export function LoanFormWithSearch({ onLoanGenerated, currentUser }: LoanFormWithSearchProps) {
  // Estados para búsqueda de cliente
  const [tipoPersona, setTipoPersona] = useState<"natural" | "juridica">("natural")
  const [documentNumber, setDocumentNumber] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [clientData, setClientData] = useState<ClientData | null>(null)

  // Estados para formulario de préstamo
  const [amount, setAmount] = useState("")
  const [term, setTerm] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  // Estado para límites del cliente
  const [clientDailyLimit, setClientDailyLimit] = useState(5000)
  const [clientMonthlyAmount, setClientMonthlyAmount] = useState(0)

  // Estados para errores
  const [documentError, setDocumentError] = useState<string | null>(null)
  const [amountError, setAmountError] = useState<string | null>(null)

  // Tasa fija del 10% anual
  const annualRate = 10

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setDocumentError(null)

    // Validar número de documento según tipo
    if (tipoPersona === "natural" && !/^\d{8}$/.test(documentNumber)) {
      setDocumentError("El DNI debe tener 8 dígitos numéricos")
      return
    }

    if (tipoPersona === "juridica" && !/^\d{11}$/.test(documentNumber)) {
      setDocumentError("El RUC debe tener 11 dígitos numéricos")
      return
    }

    setIsSearching(true)

    try {
      // Llamar a la API de RENIEC o SUNAT según el tipo de persona
      const client = await searchClient(tipoPersona, documentNumber)
      setClientData(client)

      // Obtener límites del cliente
      const dailyLimit = getClientRemainingDailyLimit(client.numeroDocumento)
      const monthlyAmount = getClientMonthlyLoanAmount(client.numeroDocumento)

      setClientDailyLimit(dailyLimit)
      setClientMonthlyAmount(monthlyAmount)

      toast({
        title: "Cliente encontrado",
        description: `Se encontró información de ${tipoPersona === "natural" ? "la persona" : "la empresa"}`,
      })
    } catch (error) {
      setDocumentError(
        error instanceof Error ? error.message : "No se encontró el cliente o hubo un problema con la búsqueda",
      )
    } finally {
      setIsSearching(false)
    }
  }

  // Validar límites por cliente
  const handleRegisterLoan = async (e: React.FormEvent) => {
    e.preventDefault()
    setAmountError(null)

    if (!clientData) {
      toast({
        title: "Error",
        description: "Primero debe buscar un cliente",
        variant: "destructive",
      })
      return
    }

    if (!amount || !term) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos",
        variant: "destructive",
      })
      return
    }

    const amountValue = Number.parseFloat(amount)
    const termValue = Number.parseInt(term)

    if (isNaN(amountValue) || amountValue <= 0) {
      setAmountError("El monto debe ser un número positivo")
      return
    }

    // Validar el rango del plazo
    if (isNaN(termValue) || termValue < 1 || termValue > 60) {
      toast({
        title: "Error",
        description: "El plazo debe ser entre 1 y 60 meses",
        variant: "destructive",
      })
      return
    }

    // Validar límite diario por cliente
    const clientDailyRemaining = getClientRemainingDailyLimit(clientData.numeroDocumento)
    if (amountValue > clientDailyRemaining) {
      setAmountError(
        `El monto excede el límite diario restante para este cliente de S/ ${clientDailyRemaining.toFixed(2)}`,
      )
      return
    }

    // Validar límite mensual por cliente
    if (!checkClientMonthlyLimit(clientData.numeroDocumento, amountValue)) {
      const currentMonthlyAmount = getClientMonthlyLoanAmount(clientData.numeroDocumento)
      setAmountError(
        `El monto excede el límite mensual de S/ 20,000.00 para este cliente. Ya tiene préstamos por S/ ${currentMonthlyAmount.toFixed(2)} este mes.`,
      )
      return
    }

    setIsGenerating(true)

    try {
      const loanData: LoanData = {
        amount: amountValue,
        term: termValue, // Asegurarse de que este valor sea correcto
        annualRate: annualRate,
        startDate: new Date(),
      }

      console.log("Plazo seleccionado:", termValue, "meses") // Agregar log para depuración

      const schedule = calculatePaymentSchedule(loanData)

      console.log("Cuotas generadas:", schedule.length) // Verificar cuántas cuotas se generaron

      // Actualizar el monto de préstamo diario del cliente
      updateClientDailyLoanAmount(clientData.numeroDocumento, amountValue)

      // Almacenar el préstamo en localStorage
      const storedLoans = localStorage.getItem("loans")
      const loans: StoredLoan[] = storedLoans ? JSON.parse(storedLoans) : []

      const newLoan: StoredLoan = {
        id: uuidv4(),
        clientData,
        loanData: {
          ...loanData,
          startDate: new Date(),
        },
        schedule,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.id || "unknown",
        status: "approved", // Ahora todos los préstamos se crean como aprobados
        paidInstallments: [], // Inicializar arreglo de cuotas pagadas
      }

      loans.push(newLoan)
      localStorage.setItem("loans", JSON.stringify(loans))

      // Enviar email de notificación (usando un correo predeterminado)
      const defaultEmail = "cliente@ejemplo.com" // Correo predeterminado para todos los clientes
      setIsSendingEmail(true)
      try {
        const clientDataWithEmail = { ...clientData, correo: defaultEmail }
        await sendLoanRegistrationEmail(clientDataWithEmail, loanData, schedule)
        toast({
          title: "Notificación enviada",
          description: `Se ha enviado un correo con los detalles del préstamo`,
        })
      } catch (error) {
        console.error("Error al enviar email:", error)
        toast({
          title: "Advertencia",
          description: "El préstamo se registró correctamente, pero no se pudo enviar la notificación por email",        })
      } finally {
        setIsSendingEmail(false)
      }

      // Mostrar el cronograma
      onLoanGenerated(clientData, loanData, schedule)
    } catch (error) {
      console.error("Error al generar préstamo:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al generar el préstamo",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClearClient = () => {
    setClientData(null)
    setDocumentNumber("")
    setDocumentError(null)
    setClientDailyLimit(5000)
    setClientMonthlyAmount(0)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Nuevo Préstamo</h2>

      <Card>
        <CardHeader>
          <CardTitle>Búsqueda de Cliente</CardTitle>
          <CardDescription>Ingrese el tipo de persona y documento para buscar</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Persona</Label>
              <RadioGroup
                defaultValue="natural"
                className="flex space-x-4"
                onValueChange={(value) => {
                  setTipoPersona(value as "natural" | "juridica")
                  setClientData(null)
                  setDocumentNumber("")
                  setDocumentError(null)
                }}
                disabled={!!clientData}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="natural" id="natural" />
                  <Label htmlFor="natural">Persona Natural</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="juridica" id="juridica" />
                  <Label htmlFor="juridica">Persona Jurídica</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentNumber">
                {tipoPersona === "natural" ? "DNI (8 dígitos)" : "RUC (11 dígitos)"}
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="documentNumber"
                  placeholder={tipoPersona === "natural" ? "Ingrese DNI" : "Ingrese RUC"}
                  value={documentNumber}
                  onChange={(e) => {
                    setDocumentNumber(e.target.value)
                    setDocumentError(null)
                  }}
                  maxLength={tipoPersona === "natural" ? 8 : 11}
                  disabled={!!clientData || isSearching}
                  className="flex-1"
                />
                {!clientData ? (
                  <Button onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? "Buscando..." : "Buscar"}
                  </Button>
                ) : (
                  <Button variant="outline" onClick={handleClearClient}>
                    Cambiar Cliente
                  </Button>
                )}
              </div>

              {documentError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{documentError}</AlertDescription>
                </Alert>
              )}
            </div>
          </form>

          {clientData && (
            <div className="mt-4 p-4 border rounded-lg bg-muted">
              <h3 className="font-semibold mb-2">Datos del Cliente</h3>
              {clientData.tipoPersona === "natural" ? (
                <p>
                  <strong>Nombre:</strong> {clientData.nombre}
                </p>
              ) : (
                <>
                  <p>
                    <strong>Razón Social:</strong> {clientData.razonSocial}
                  </p>
                  <p>
                    <strong>Representante Legal:</strong> {clientData.representanteLegal}
                  </p>
                </>
              )}
              <p>
                <strong>Documento:</strong> {clientData.tipoDocumento}: {clientData.numeroDocumento}
              </p>
              {clientData.direccion && (
                <p>
                  <strong>Dirección:</strong> {clientData.direccion}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {clientData && (
        <Card>
          <CardHeader>
            <CardTitle>Datos del Préstamo</CardTitle>
            <CardDescription>Complete la información del préstamo</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto a Prestar (S/)</Label>
                <Input
                  id="amount"
                  placeholder="Ingrese el monto del préstamo"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value)
                    setAmountError(null)
                  }}
                  type="number"
                  min="1"
                  max={clientDailyLimit.toString()}
                  step="0.01"
                />
                <p className="text-xs text-muted-foreground">
                  Límite diario restante para este cliente: S/ {clientDailyLimit.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Límite mensual restante para este cliente: S/ {(20000 - clientMonthlyAmount).toFixed(2)}
                </p>

                {amountError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{amountError}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="term">Plazo en Meses (1-60)</Label>
                <Input
                  id="term"
                  placeholder="Ingrese el número de cuotas"
                  value={term}
                  onChange={(e) => {
                    const value = e.target.value
                    // Solo permitir números
                    if (/^\d*$/.test(value)) {
                      setTerm(value)
                    }
                  }}
                  type="number"
                  min="1"
                  max="60"
                  className={term && (Number.parseInt(term) < 1 || Number.parseInt(term) > 60) ? "border-red-500" : ""}
                />
                {term && (Number.parseInt(term) < 1 || Number.parseInt(term) > 60) && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>El plazo debe ser entre 1 y 60 meses</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label>Fecha del Préstamo</Label>
                <Input value={new Date().toLocaleDateString("es-PE")} disabled />
              </div>

              <div className="space-y-2">
                <Label>Tasa de Interés</Label>
                <div className="p-2 bg-muted rounded-md">
                  <p className="text-center font-medium">10% efectivo anual (fija)</p>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button onClick={handleRegisterLoan} className="w-full" disabled={isGenerating || isSendingEmail}>
              {isGenerating ? "Registrando..." : isSendingEmail ? "Enviando notificación..." : "Registrar Préstamo"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
