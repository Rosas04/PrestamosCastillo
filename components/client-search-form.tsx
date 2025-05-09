"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import type { ClientData } from "@/lib/types"
import { searchClient } from "@/lib/api"

interface ClientSearchFormProps {
  onClientFound: (client: ClientData) => void
}

export function ClientSearchForm({ onClientFound }: ClientSearchFormProps) {
  const [tipoPersona, setTipoPersona] = useState<"natural" | "juridica">("natural")
  const [documentNumber, setDocumentNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar número de documento según tipo
    if (tipoPersona === "natural" && !/^\d{8}$/.test(documentNumber)) {
      toast({
        title: "Error",
        description: "El DNI debe tener 8 dígitos numéricos",
        variant: "destructive",
      })
      return
    }

    if (tipoPersona === "juridica" && !/^\d{11}$/.test(documentNumber)) {
      toast({
        title: "Error",
        description: "El RUC debe tener 11 dígitos numéricos",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // En un entorno real, esto llamaría a una API
      const client = await searchClient(tipoPersona, documentNumber)
      onClientFound(client)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se encontró el cliente o hubo un problema con la búsqueda",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Búsqueda de Cliente</CardTitle>
        <CardDescription>Ingrese el tipo de persona y documento para buscar</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de Persona</Label>
            <RadioGroup
              defaultValue="natural"
              className="flex space-x-4"
              onValueChange={(value) => setTipoPersona(value as "natural" | "juridica")}
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
            <Label htmlFor="documentNumber">{tipoPersona === "natural" ? "DNI (8 dígitos)" : "RUC (11 dígitos)"}</Label>
            <Input
              id="documentNumber"
              placeholder={tipoPersona === "natural" ? "Ingrese DNI" : "Ingrese RUC"}
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              maxLength={tipoPersona === "natural" ? 8 : 11}
            />
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSearch} className="w-full" disabled={isLoading}>
          {isLoading ? "Buscando..." : `Buscar en ${tipoPersona === "natural" ? "RENIEC" : "SUNAT"}`}
        </Button>
      </CardFooter>
    </Card>
  )
}
