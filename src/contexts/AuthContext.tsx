"use client"

import { useState, useEffect, useCallback, useMemo, createContext, useContext } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { doc, getDoc, onSnapshot } from "firebase/firestore"
import { auth, db } from "@/app/firebase/config"
import { AdminUser, UserRole, TabId, ROLE_PERMISSIONS } from "@/lib/permissions"

/**
 * Motivo pelo qual um usuário autenticado não possui perfil administrativo utilizável.
 *   no-profile  — autenticou, mas ninguém provisionou acesso ao painel
 *   disabled    — perfil existe, porém está desativado
 *   unavailable — falha de rede ao ler o perfil
 */
export type ProfileError = "no-profile" | "disabled" | "unavailable"

interface AuthContextType {
  firebaseUser: User | null
  adminUser: AdminUser | null
  role: UserRole | null
  loading: boolean
  profileError: ProfileError | null
  canAccess: (tab: TabId) => boolean
  customPermissions: Record<UserRole, TabId[]>
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  adminUser: null,
  role: null,
  loading: true,
  profileError: null,
  canAccess: () => false,
  customPermissions: ROLE_PERMISSIONS,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [profileError, setProfileError] = useState<ProfileError | null>(null)
  const [customPermissions, setCustomPermissions] = useState<Record<UserRole, TabId[]>>(ROLE_PERMISSIONS)
  const [loading, setLoading] = useState(true)

  // Carrega configurações de permissões customizadas do Firestore em tempo real
  useEffect(() => {
    const permissionsRef = doc(db, "role_permissions", "config")
    const unsubPermissions = onSnapshot(
      permissionsRef,
      (snap) => {
        if (snap.exists()) {
          setCustomPermissions(snap.data() as Record<UserRole, TabId[]>)
        }
      },
      (err) => {
        console.warn("Erro ao carregar permissões dinâmicas do Firestore, usando fallback estático:", err)
      }
    )

    return () => unsubPermissions()
  }, [])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user)

      if (user) {
        try {
          // Busca perfil do usuário no Firestore.
          // O perfil é a ÚNICA fonte de verdade do papel: nunca inferimos nem
          // criamos permissões no cliente — quem provisiona é um super_admin
          // pela aba Usuários, e as regras do Firestore validam do lado servidor.
          const ref = doc(db, "admin_users", user.uid)

          // Timeout de 10s para não travar indefinidamente em conexões ruins.
          // O cache persistente do Firestore já atende leituras offline.
          const snap = await Promise.race([
            getDoc(ref),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("Timeout de rede")), 10000)
            ),
          ])

          if (snap && snap.exists()) {
            const data = snap.data() as Omit<AdminUser, "uid">
            // Conta desativada não recebe perfil — o painel a trata como sem acesso.
            setAdminUser(data.active === false ? null : ({ uid: user.uid, ...data } as AdminUser))
            setProfileError(data.active === false ? "disabled" : null)
          } else {
            // Autenticado, porém sem perfil administrativo provisionado.
            setAdminUser(null)
            setProfileError("no-profile")
          }
        } catch (e) {
          console.warn("Erro ao buscar perfil do admin:", e)
          setAdminUser(null)
          setProfileError("unavailable")
        }
      } else {
        setAdminUser(null)
        setProfileError(null)
      }

      setLoading(false)
    })

    return () => unsub()
  }, [])

  // Memoizado: consumidores usam `canAccess` em arrays de dependência de efeitos.
  // Uma nova identidade a cada render reexecutaria esses efeitos continuamente.
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
      firebaseUser,
      adminUser,
      role: adminUser?.role ?? null,
      loading,
      profileError,
      canAccess: checkAccess,
      customPermissions,
    }),
    [firebaseUser, adminUser, loading, profileError, checkAccess, customPermissions]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
