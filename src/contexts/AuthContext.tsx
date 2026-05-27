"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { doc, getDoc, onSnapshot } from "firebase/firestore"
import { auth, db } from "@/app/firebase/config"
import { AdminUser, UserRole, canAccess, TabId, ROLE_PERMISSIONS } from "@/lib/permissions"

interface AuthContextType {
  firebaseUser: User | null
  adminUser: AdminUser | null
  role: UserRole | null
  loading: boolean
  canAccess: (tab: TabId) => boolean
  customPermissions: Record<UserRole, TabId[]>
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  adminUser: null,
  role: null,
  loading: true,
  canAccess: () => false,
  customPermissions: ROLE_PERMISSIONS,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
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
          // Busca perfil do usuário no Firestore
          const ref = doc(db, "admin_users", user.uid)
          const snap = await getDoc(ref)
          if (snap.exists()) {
            setAdminUser({ uid: user.uid, ...snap.data() } as AdminUser)
          } else {
            // Usuário autenticado mas sem perfil no Firestore → super_admin por retrocompatibilidade
            setAdminUser({
              uid: user.uid,
              email: user.email || "",
              displayName: user.displayName || user.email || "Admin",
              role: "super_admin",
              active: true,
              createdAt: new Date().toISOString(),
            })
          }
        } catch (e) {
          console.warn("Erro ao buscar perfil do admin:", e)
          // Fallback: mantém acesso como super_admin para não bloquear
          setAdminUser({
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || user.email || "Admin",
            role: "super_admin",
            active: true,
            createdAt: new Date().toISOString(),
          })
        }
      } else {
        setAdminUser(null)
      }

      setLoading(false)
    })

    return () => unsub()
  }, [])

  const checkAccess = (tab: TabId): boolean => {
    if (!adminUser) return false
    // Super admin sempre tem acesso total
    if (adminUser.role === "super_admin") return true
    
    const permissions = customPermissions[adminUser.role] || ROLE_PERMISSIONS[adminUser.role]
    return permissions?.includes(tab) ?? false
  }

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        adminUser,
        role: adminUser?.role ?? null,
        loading,
        canAccess: checkAccess,
        customPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
