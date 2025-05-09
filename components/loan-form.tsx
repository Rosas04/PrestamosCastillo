"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import type { ClientData, LoanData, PaymentScheduleData } from "@/lib/types"
import { calculatePaymentSchedule } from "@/lib/loan-calculator"

interface LoanFormProps {
  clientData: ClientData
  onLoanGenerated: (loan: LoanData, schedule: PaymentScheduleData[]) => void
}

export function LoanForm({ clientData, onLoanGenerated }: LoanFormProps) {
  const [amount, setAmount] = useState("")
  const [term, setTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Tasa fija del 10% anual
  const annualRate = 10

  const handleGenerateLoan = (e: React.FormEvent) => {
    e.preventDefault()

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
      toast({
        title: "Error",
        description: "El monto debe ser un número positivo",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const loanData: LoanData = {
        amount: amountValue,
        term: termValue,
        annualRate: annualRate,
        startDate: new Date(),
      }

      const schedule = calculatePaymentSchedule(loanData)
      onLoanGenerated(loanData, schedule)
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al generar el préstamo",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Registrar Préstamo</CardTitle>
        <CardDescription>Complete los datos para generar un préstamo</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleGenerateLoan} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de Cliente</Label>
            <Input value={clientData.tipoPersona === "natural" ? "Persona Natural" : "Persona Jurídica"} disabled />
          </div>

          <div className="space-y-2">
            <Label>Nombre / Razón Social</Label>
            <Input value={clientData.tipoPersona === "natural" ? clientData.nombre : clientData.razonSocial} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Monto a Prestar (S/)</Label>
            <Input
              id="amount"
              placeholder="Ingrese el monto del préstamo"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              min="1"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="term">Plazo en Meses</Label>
            <Select onValueChange={(value) => setTerm(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el plazo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 mes</SelectItem>
                <SelectItem value="3">3 meses</SelectItem>
                <SelectItem value="6">6 meses</SelectItem>
                <SelectItem value="12">12 meses</SelectItem>
                <SelectItem value="18">18 meses</SelectItem>
                <SelectItem value="24">24 meses</SelectItem>
                <SelectItem value="36">36 meses</SelectItem>
                <SelectItem value="48">48 meses</SelectItem>
                <SelectItem value="60">60 meses</SelectItem>
              </SelectContent>
            </Select>
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
        <Button onClick={handleGenerateLoan} className="w-full" disabled={isLoading}>
          {isLoading ? "Generando..." : "Generar Cronograma"}
        </Button>
      </CardFooter>
    </Card>
  )
}
