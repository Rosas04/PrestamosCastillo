"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency, formatDate } from "@/lib/utils"
import { hasPermission } from "@/lib/auth"
import type { StoredLoan, User, RolePermissions } from "@/lib/types"
import { Eye, Search } from "lucide-react"

interface LoansListProps {
  onViewLoan: (loan: StoredLoan) => void
  currentUser: User | null
  permissions: RolePermissions | null
}

export function LoansList({ onViewLoan, currentUser, permissions }: LoansListProps) {
  const [allLoans, setAllLoans] = useState<StoredLoan[]>([])
  const [activeLoans, setActiveLoans] = useState<StoredLoan[]>([])
  const [completedLoans, setCompletedLoans] = useState<StoredLoan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredLoans, setFilteredLoans] = useState<StoredLoan[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const canManageLoans = hasPermission(permissions, "loans", "manage")

  useEffect(() => {
    // Load loans from localStorage
    loadLoans()
  }, [currentUser, canManageLoans])

  const loadLoans = () => {
    try {
      setIsLoading(true)
      const storedLoans = localStorage.getItem("loans")
      if (storedLoans) {
        const loans = JSON.parse(storedLoans) as StoredLoan[]

        // Filter loans based on user role
        let filteredLoans = loans

        // If user is an agent and can't manage all loans, only show their own loans
        if (currentUser && currentUser.role === "agent" && !canManageLoans) {
          filteredLoans = loans.filter((loan) => loan.createdBy === currentUser.id)
        }

        // Separate loans by status
        const active = filteredLoans.filter((loan) => loan.status === "approved" && !loan.isCompleted)
        const completed = filteredLoans.filter((loan) => loan.isCompleted)

        setAllLoans(filteredLoans)
        setActiveLoans(active)
        setCompletedLoans(completed)
        setFilteredLoans(filteredLoans)
      }
    } catch (error) {
      console.error("Error loading loans:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredLoans(allLoans)
      return
    }

    setIsSearching(true)

    try {
      const query = searchQuery.toLowerCase().trim()

      // Buscar en todos los préstamos
      const results = allLoans.filter((loan) => {
        // Buscar por nombre/razón social
        const clientName =
          loan.clientData.tipoPersona === "natural"
            ? loan.clientData.nombre?.toLowerCase() || ""
            : loan.clientData.razonSocial?.toLowerCase() || ""

        // Buscar por número de documento
        const documentNumber = loan.clientData.numeroDocumento.toLowerCase()

        return clientName.includes(query) || documentNumber.includes(query)
      })

      setFilteredLoans(results)
    } catch (error) {
      console.error("Error searching loans:", error)
      setFilteredLoans(allLoans)
    } finally {
      setIsSearching(false)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    setFilteredLoans(allLoans)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const getLoanStatusBadge = (status: string, isCompleted: boolean) => {
    if (isCompleted) {
      return <Badge variant="outline">Saldado</Badge>
    }

    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pendiente</Badge>
      case "approved":
        return <Badge variant="default">Activo</Badge>
      case "rejected":
        return <Badge variant="destructive">Rechazado</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        <p className="ml-2">Cargando préstamos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Préstamos</h2>

        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Buscar por nombre o documento"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button type="submit" onClick={handleSearch} disabled={isSearching}>
            <Search className="h-4 w-4" />
          </Button>
          {searchQuery && (
            <Button variant="outline" onClick={handleClearSearch}>
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Pestañas de préstamos */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todos los Préstamos ({filteredLoans.length})</TabsTrigger>
          <TabsTrigger value="active">Préstamos Activos ({activeLoans.length})</TabsTrigger>
          <TabsTrigger value="completed">Préstamos Saldados ({completedLoans.length})</TabsTrigger>
        </TabsList>

        {/* Todos los préstamos */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Todos los Préstamos</CardTitle>
              <CardDescription>Lista completa de préstamos en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredLoans.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No hay préstamos registrados</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Documento</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Plazo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLoans.map((loan) => (
                        <TableRow key={loan.id}>
                          <TableCell>{formatDate(new Date(loan.loanData.startDate))}</TableCell>
                          <TableCell>
                            {loan.clientData.tipoPersona === "natural"
                              ? loan.clientData.nombre
                              : loan.clientData.razonSocial}
                          </TableCell>
                          <TableCell>{loan.clientData.numeroDocumento}</TableCell>
                          <TableCell>S/ {formatCurrency(loan.loanData.amount)}</TableCell>
                          <TableCell>{loan.loanData.term} meses</TableCell>
                          <TableCell>{getLoanStatusBadge(loan.status, loan.isCompleted)}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" onClick={() => onViewLoan(loan)}>
                              <Eye className="h-4 w-4 mr-1" /> Ver
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Préstamos activos */}
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Préstamos Activos</CardTitle>
              <CardDescription>Lista de préstamos que aún están en proceso de pago</CardDescription>
            </CardHeader>
            <CardContent>
              {activeLoans.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No hay préstamos activos</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Documento</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Plazo</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeLoans.map((loan) => (
                        <TableRow key={loan.id}>
                          <TableCell>{formatDate(new Date(loan.loanData.startDate))}</TableCell>
                          <TableCell>
                            {loan.clientData.tipoPersona === "natural"
                              ? loan.clientData.nombre
                              : loan.clientData.razonSocial}
                          </TableCell>
                          <TableCell>{loan.clientData.numeroDocumento}</TableCell>
                          <TableCell>S/ {formatCurrency(loan.loanData.amount)}</TableCell>
                          <TableCell>{loan.loanData.term} meses</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" onClick={() => onViewLoan(loan)}>
                              <Eye className="h-4 w-4 mr-1" /> Ver
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Préstamos saldados */}
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Préstamos Saldados</CardTitle>
              <CardDescription>Lista de préstamos que han sido completamente pagados</CardDescription>
            </CardHeader>
            <CardContent>
              {completedLoans.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No hay préstamos saldados</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Documento</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Plazo</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedLoans.map((loan) => (
                        <TableRow key={loan.id}>
                          <TableCell>{formatDate(new Date(loan.loanData.startDate))}</TableCell>
                          <TableCell>
                            {loan.clientData.tipoPersona === "natural"
                              ? loan.clientData.nombre
                              : loan.clientData.razonSocial}
                          </TableCell>
                          <TableCell>{loan.clientData.numeroDocumento}</TableCell>
                          <TableCell>S/ {formatCurrency(loan.loanData.amount)}</TableCell>
                          <TableCell>{loan.loanData.term} meses</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" onClick={() => onViewLoan(loan)}>
                              <Eye className="h-4 w-4 mr-1" /> Ver
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
