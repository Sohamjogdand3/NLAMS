import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { MOCK_ACCOUNTS, type UserSession, type UserType, type DepartmentRole } from '../types/auth'
import { authApi } from '../services/api'

interface AuthContextType {
  user: UserSession | null
  login: (username: string, userType: UserType, password?: string, otp?: string) => Promise<boolean>
  loginWithOTP: (emailOrIdentifier: string, otp: string, userType?: UserType) => Promise<boolean>
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

  // Verify active session on mount
  useEffect(() => {
    const checkActiveSession = async () => {
      const token = localStorage.getItem('nlams_access_token')
      if (token && !user) {
        try {
          const meData = await authApi.getMe()
          if (meData?.user) {
            const roleCode = (meData.active_role?.code || 'CITIZEN').toLowerCase()
            const isCitizen = roleCode === 'citizen'
            const isPia = roleCode === 'pia' || roleCode === 'agency'

            setUser({
              id: String(meData.user.id),
              name: meData.user.full_name,
              email: meData.user.email || '',
              userType: isCitizen ? 'citizen' : isPia ? 'pia' : 'department',
              role: roleCode as DepartmentRole,
              departmentName: meData.active_jurisdiction?.name || meData.user.department_name || 'Government Administration',
              token: token,
            })
          }
        } catch {
          // Token expired or invalid
          localStorage.removeItem('nlams_access_token')
          localStorage.removeItem('nlams_refresh_token')
          localStorage.removeItem(AUTH_STORAGE_KEY)
        }
      }
    }

    checkActiveSession()
  }, [])

  const loginWithOTP = async (
    emailOrIdentifier: string,
    otp: string,
    userType: UserType = 'department'
  ): Promise<boolean> => {
    setIsLoading(true)
    try {
      let apiRes: any

      if (userType === 'citizen') {
        apiRes = await authApi.verifyCitizenOTP(emailOrIdentifier, otp)
      } else {
        apiRes = await authApi.verifyOfficialOTP(emailOrIdentifier, otp)
      }

      if (apiRes?.access_token) {
        localStorage.setItem('nlams_access_token', apiRes.access_token)
        localStorage.setItem('nlams_refresh_token', apiRes.refresh_token)

        const roleCode = (apiRes.role?.code || 'LAO').toLowerCase()
        const isCitizen = roleCode === 'citizen'
        const isPia = roleCode === 'pia' || roleCode === 'agency'

        const session: UserSession = {
          id: String(apiRes.user.id),
          name: apiRes.user.full_name || emailOrIdentifier,
          email: apiRes.user.email || emailOrIdentifier,
          userType: isCitizen ? 'citizen' : isPia ? 'pia' : 'department',
          role: roleCode as DepartmentRole,
          departmentName: apiRes.jurisdiction?.name || apiRes.user.department_name || 'Revenue & Land Reforms Dept',
          token: apiRes.access_token,
        }

        setUser(session)
        return true
      }
      return false
    } finally {
      setIsLoading(false)
    }
  }

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
        try {
          const apiRes = await authApi.verifyCitizenOTP(username, otp)
          localStorage.setItem('nlams_access_token', apiRes.access_token)
          localStorage.setItem('nlams_refresh_token', apiRes.refresh_token)

          session = {
            id: String(apiRes.user.id),
            name: apiRes.user.full_name || `Citizen ${username}`,
            email: apiRes.user.email || username,
            userType: 'citizen',
            role: 'citizen',
            token: apiRes.access_token,
          }
        } catch {
          const mock = MOCK_ACCOUNTS[username] || {
            username,
            name: 'Citizen User',
            role: 'citizen',
            description: 'Citizen Portal Access',
          }
          session = {
            id: `usr_${Date.now()}`,
            name: mock.name,
            email: mock.email || `${username}@nlams.gov.demo`,
            userType: 'citizen',
            role: 'citizen',
            token: `mock_jwt_token_${Date.now()}`,
          }
        }
      } else {
        // Official / Department / PIA Login
        try {
          const apiRes = await authApi.loginOfficial(username, password || 'Password@123', otp)
          localStorage.setItem('nlams_access_token', apiRes.access_token)
          localStorage.setItem('nlams_refresh_token', apiRes.refresh_token)

          const roleCode = (apiRes.role?.code?.toLowerCase() || 'lao') as DepartmentRole
          const isPia = userType === 'pia' || roleCode === 'pia' || roleCode === 'agency'

          session = {
            id: String(apiRes.user.id),
            name: apiRes.user.full_name || `Officer ${username}`,
            email: apiRes.user.email || username,
            userType: isPia ? 'pia' : 'department',
            role: roleCode,
            departmentName: apiRes.jurisdiction?.name || apiRes.user.department_name || 'Department of Land Resources',
            token: apiRes.access_token,
          }
        } catch {
          const mock = MOCK_ACCOUNTS[username] || {
            username,
            name: 'Department Officer',
            role: (userType === 'pia' ? 'pia' : 'lao') as DepartmentRole,
            departmentName: 'Government Administration',
            description: 'Government Official Access',
          }
          session = {
            id: `usr_${Date.now()}`,
            name: mock.name,
            email: mock.email || `${username}@nlams.gov.demo`,
            userType: userType === 'pia' ? 'pia' : 'department',
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
    try {
      authApi.logout().catch(() => {})
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithOTP,
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
