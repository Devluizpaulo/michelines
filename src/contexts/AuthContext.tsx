"use client"

import { useState, useEffect, useCallback, useMemo, createContext, useContext } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { fetchMyProfile, touchLastLogin } from "@/lib/db/admin-users"
import { getSetting, subscribeToSetting } from "@/lib/db/settings"
import { AdminUser, UserRole, TabId, ROLE_PERMISSIONS } from "@/lib/permissions"

/**
 * Motivo pelo qual um usuário autenticado não possui perfil administrativo utilizável.
 *   no-profile  — autenticou, mas ninguém provisionou acesso ao painel
 *   disabled    — perfil existe, porém está desativado
 *   unavailable — falha de rede ao ler o perfil
 */
export type ProfileError = "no-profile" | "disabled" | "unavailable"

interface AuthContextType {
  /** Sessão do Supabase Auth. `null` quando ninguém está logado. */
  user: User | null
  adminUser: AdminUser | null
  role: UserRole | null
  loading: boolean
  profileError: ProfileError | null
  canAccess: (tab: TabId) => boolean
  customPermissions: Record<UserRole, TabId[]>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  adminUser: null,
  role: null,
  loading: true,
  profileError: null,
  canAccess: () => false,
  customPermissions: ROLE_PERMISSIONS,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [profileError, setProfileError] = useState<ProfileError | null>(null)
  const [customPermissions, setCustomPermissions] = useState<Record<UserRole, TabId[]>>(ROLE_PERMISSIONS)
  const [loading, setLoading] = useState(true)

  // Carrega configurações de permissões customizadas do Supabase app_settings em tempo real
  useEffect(() => {
    getSetting<Record<UserRole, TabId[]>>("role_permissions").then((perms) => {
      if (perms) setCustomPermissions(perms)
    })

    const unsubPermissions = subscribeToSetting<Record<UserRole, TabId[]>>(
      "role_permissions",
      (perms) => {
        if (perms) setCustomPermissions(perms)
      }
    )

    return () => unsubPermissions()
  }, [])

  useEffect(() => {
    // 1. Obtém sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      const initialUser = session?.user ?? null
      setUser(initialUser)
      if (initialUser) {
        loadProfile(initialUser.id)
      } else {
        setLoading(false)
      }
    })

    // 2. Observa mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        if (event === "SIGNED_IN") {
          touchLastLogin(currentUser.id)
        }
        await loadProfile(currentUser.id)
      } else {
        setAdminUser(null)
        setProfileError(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId: string) {
    try {
      const profile = await fetchMyProfile(userId)
      if (profile) {
        if (profile.active === false) {
          setAdminUser(null)
          setProfileError("disabled")
        } else {
          setAdminUser(profile)
          setProfileError(null)
        }
      } else {
        setAdminUser(null)
        setProfileError("no-profile")
      }
    } catch (err) {
      console.warn("[AuthContext] Erro ao buscar perfil do admin:", err)
      setAdminUser(null)
      setProfileError("unavailable")
    } finally {
      setLoading(false)
    }
  }

  // Memoizado: consumidores usam `canAccess` em arrays de dependência de efeitos.
  const checkAccess = useCallback(
    (tab: TabId): boolean => {
      if (!adminUser || !adminUser.active) return false
      // Super admin sempre tem acesso total
      if (adminUser.role === "super_admin") return true

      const permissions = customPermissions[adminUser.role] || ROLE_PERMISSIONS[adminUser.role]
      return permissions?.includes(tab) ?? false
    },
    [adminUser, customPermissions]
  )

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      adminUser,
      role: adminUser?.role ?? null,
      loading,
      profileError,
      canAccess: checkAccess,
      customPermissions,
    }),
    [user, adminUser, loading, profileError, checkAccess, customPermissions]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
