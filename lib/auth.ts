import type { User, UserRole, RolePermissions, AuthState, Permission } from "./types"
import { v4 as uuidv4 } from "uuid"

// Define permissions for each role
const rolePermissionsMap: Record<UserRole, RolePermissions> = {
  admin: {
    loans: {
      create: true,
      read: true,
      update: true,
      delete: true,
      approve: true,
      manage: true,
    },
    users: {
      create: true,
      read: true,
      update: true,
      delete: true,
      approve: true,
      manage: true,
    },
    reports: {
      create: true,
      read: true,
      update: true,
      delete: true,
      approve: true,
      manage: true,
    },
    settings: {
      create: true,
      read: true,
      update: true,
      delete: true,
      approve: true,
      manage: true,
    },
  },
  manager: {
    loans: {
      create: true,
      read: true,
      update: true,
      delete: false,
      approve: true,
      manage: true,
    },
    users: {
      create: false,
      read: true,
      update: false,
      delete: false,
      approve: false,
      manage: false,
    },
    reports: {
      create: true,
      read: true,
      update: false,
      delete: false,
      approve: false,
      manage: false,
    },
    settings: {
      create: false,
      read: true,
      update: false,
      delete: false,
      approve: false,
      manage: false,
    },
  },
  agent: {
    loans: {
      create: true,
      read: true,
      update: false,
      delete: false,
      approve: false,
      manage: false,
    },
    users: {
      create: false,
      read: false,
      update: false,
      delete: false,
      approve: false,
      manage: false,
    },
    reports: {
      create: false,
      read: false,
      update: false,
      delete: false,
      approve: false,
      manage: false,
    },
    settings: {
      create: false,
      read: false,
      update: false,
      delete: false,
      approve: false,
      manage: false,
    },
  },
}

// Default users for testing
const defaultUsers: User[] = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    fullName: "Administrador Principal",
    email: "admin@prestamos.com",
    role: "admin",
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    username: "manager",
    password: "manager123",
    fullName: "Gerente de Préstamos",
    email: "gerente@prestamos.com",
    role: "manager",
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    username: "agent",
    password: "agent123",
    fullName: "Agente de Préstamos",
    email: "agente@prestamos.com",
    role: "agent",
    active: true,
    createdAt: new Date().toISOString(),
  },
]

// Initialize users in localStorage if they don't exist
export function initializeUsers(): void {
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify(defaultUsers))
  }
}

// Get all users
export function getUsers(): User[] {
  const users = localStorage.getItem("users")
  return users ? JSON.parse(users) : []
}

// Get user by ID
export function getUserById(id: string): User | null {
  const users = getUsers()
  return users.find((user) => user.id === id) || null
}

// Get user by username
export function getUserByUsername(username: string): User | null {
  const users = getUsers()
  return users.find((user) => user.username === username) || null
}

// Create a new user
export function createUser(userData: Omit<User, "id" | "createdAt">): User {
  const users = getUsers()

  // Check if username already exists
  if (users.some((user) => user.username === userData.username)) {
    throw new Error("El nombre de usuario ya existe")
  }

  const newUser: User = {
    ...userData,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  localStorage.setItem("users", JSON.stringify(users))

  return newUser
}

// Update an existing user
export function updateUser(id: string, userData: Partial<User>): User {
  const users = getUsers()
  const userIndex = users.findIndex((user) => user.id === id)

  if (userIndex === -1) {
    throw new Error("Usuario no encontrado")
  }

  // If username is being changed, check if it already exists
  if (userData.username && userData.username !== users[userIndex].username) {
    if (users.some((user) => user.username === userData.username)) {
      throw new Error("El nombre de usuario ya existe")
    }
  }

  const updatedUser = { ...users[userIndex], ...userData }
  users[userIndex] = updatedUser

  localStorage.setItem("users", JSON.stringify(users))
  return updatedUser
}

// Delete a user
export function deleteUser(id: string): boolean {
  const users = getUsers()
  const filteredUsers = users.filter((user) => user.id !== id)

  if (filteredUsers.length === users.length) {
    return false // User not found
  }

  localStorage.setItem("users", JSON.stringify(filteredUsers))
  return true
}

// Login function
export async function login(username: string, password: string): Promise<AuthState> {
  // Initialize users if they don't exist
  initializeUsers()

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = getUserByUsername(username)

      if (!user) {
        reject(new Error("Usuario no encontrado"))
        return
      }

      if (user.password !== password) {
        reject(new Error("Contraseña incorrecta"))
        return
      }

      if (!user.active) {
        reject(new Error("Usuario inactivo. Contacte al administrador"))
        return
      }

      // Update last login
      updateUser(user.id, { lastLogin: new Date().toISOString() })

      // Get permissions for the user's role
      const permissions = rolePermissionsMap[user.role]

      // Create auth state
      const authState: AuthState = {
        user,
        isAuthenticated: true,
        permissions,
      }

      // Store auth state in localStorage
      localStorage.setItem("auth_state", JSON.stringify(authState))

      resolve(authState)
    }, 800)
  })
}

export async function changePassword(username: string, currentPassword: string, newPassword: string): Promise<AuthState> {
  // Inicializa los usuarios si no existen
  initializeUsers()

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = getUserByUsername(username)

      if (!user) {
        reject(new Error("Usuario no encontrado"))
        return
      }

      if (user.password !== currentPassword) {
        reject(new Error("La contraseña actual es incorrecta"))
        return
      }

      if (newPassword.length < 6) {
        reject(new Error("La nueva contraseña debe tener al menos 6 caracteres"))
        return
      }

      // Actualizar la contraseña del usuario
      updateUser(user.id, { password: newPassword }) 

      // Regresar estado actualizado
      const authState: AuthState = {
        user,
        isAuthenticated: true,
        permissions: rolePermissionsMap[user.role], // Mantenemos los permisos existentes
      }

      // Actualizar el estado de autenticación en localStorage
      localStorage.setItem("auth_state", JSON.stringify(authState))

      resolve(authState)
    }, 800)
  })
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<AuthState> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const authStateStr = localStorage.getItem("auth_state")

      if (!authStateStr) {
        resolve({
          user: null,
          isAuthenticated: false,
          permissions: null,
        })
        return
      }

      try {
        const authState = JSON.parse(authStateStr) as AuthState

        // Verify that the user still exists and is active
        const user = getUserById(authState.user?.id || "")

        if (!user || !user.active) {
          localStorage.removeItem("auth_state")
          resolve({
            user: null,
            isAuthenticated: false,
            permissions: null,
          })
          return
        }

        // Update permissions in case they've changed
        authState.permissions = rolePermissionsMap[user.role]

        resolve(authState)
      } catch (error) {
        localStorage.removeItem("auth_state")
        resolve({
          user: null,
          isAuthenticated: false,
          permissions: null,
        })
      }
    }, 300)
  })
}

// Logout function
export function logout(): void {
  localStorage.removeItem("auth_state")
}

// Change password
/*export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = getUserById(userId)

      if (!user) {
        reject(new Error("Usuario no encontrado"))
        return
      }

      if (user.password !== currentPassword) {
        reject(new Error("Contraseña actual incorrecta"))
        return
      }

      updateUser(userId, { password: newPassword })
      resolve(true)
    }, 800)
  })
}*/

// Check if user has permission
export function hasPermission(
  permissions: RolePermissions | null,
  resource: keyof RolePermissions,
  action: keyof Permission,
): boolean {
  if (!permissions) return false
  return permissions[resource]?.[action] || false
}
