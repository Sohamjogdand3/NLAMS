import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { MOCK_ACCOUNTS, type UserSession, type UserType, type DepartmentRole } from '../types/auth'
import { authApi } from '../services/api'

interface AuthContextType {
  user: UserSession | null
  login: (username: string, userType: UserType, password?: string, otp?: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_STORAGE_KEY = 'nlams_user_session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      localStorage.removeItem('nlams_access_token')
      localStorage.removeItem('nlams_refresh_token')
    }
  }, [user])

  const login = async (
    username: string,
    userType: UserType,
    password?: string,
    otp: string = '123456'
  ): Promise<boolean> => {
    setIsLoading(true)
    try {
      let session: UserSession

      if (userType === 'citizen') {
        // Try live FastAPI endpoint
        try {
          const apiRes = await authApi.loginCitizen(username, otp)
          localStorage.setItem('nlams_access_token', apiRes.access_token)
          localStorage.setItem('nlams_refresh_token', apiRes.refresh_token)

          session = {
            id: String(apiRes.user.id),
            name: apiRes.user.full_name || `Citizen ${username}`,
            email: apiRes.user.email || `${username}@citizen.nlams.gov.in`,
            userType: 'citizen',
            role: 'citizen',
            token: apiRes.access_token,
          }
        } catch (apiErr) {
          console.warn('Backend API unreachable or offline, falling back to client-side auth:', apiErr)
          const mock = MOCK_ACCOUNTS[username] || {
            username,
            name: 'Citizen User',
            role: 'citizen',
            description: 'Citizen Portal Access',
          }
          session = {
            id: `usr_${Date.now()}`,
            name: mock.name,
            email: `${username}@nlams.gov.in`,
            userType: 'citizen',
            role: 'citizen',
            token: `mock_jwt_token_${Date.now()}`,
          }
        }
      } else {
        // Official / Department Login
        try {
          const apiRes = await authApi.loginOfficial(username, password || 'password123', otp)
          localStorage.setItem('nlams_access_token', apiRes.access_token)
          localStorage.setItem('nlams_refresh_token', apiRes.refresh_token)

          session = {
            id: String(apiRes.user.id),
            name: apiRes.user.full_name || `Officer ${username}`,
            email: apiRes.user.email || `${username}@nlams.gov.in`,
            userType: 'department',
            role: (apiRes.role?.code?.toLowerCase() || 'lao') as DepartmentRole,
            departmentName: apiRes.jurisdiction?.name || 'Department of Land Resources',
            token: apiRes.access_token,
          }
        } catch (apiErr) {
          console.warn('Backend API unreachable or offline, falling back to client-side auth:', apiErr)
          const mock = MOCK_ACCOUNTS[username] || {
            username,
            name: 'Department Officer',
            role: 'lao',
            departmentName: 'Department of Land Resources',
            description: 'Department Official Access',
          }
          session = {
            id: `usr_${Date.now()}`,
            name: mock.name,
            email: `${username}@nlams.gov.in`,
            userType: 'department',
            role: mock.role as DepartmentRole,
            departmentName: mock.departmentName,
            token: `mock_jwt_token_${Date.now()}`,
          }
        }
      }

      setUser(session)
      return true
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
