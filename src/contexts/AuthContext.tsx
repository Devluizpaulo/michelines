"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/app/firebase/config"
import { AdminUser, UserRole, canAccess, TabId } from "@/lib/permissions"

interface AuthContextType {
  firebaseUser: User | null
  adminUser: AdminUser | null
  role: UserRole | null
  loading: boolean
  canAccess: (tab: TabId) => boolean
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  adminUser: null,
  role: null,
  loading: true,
  canAccess: () => false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

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
            displayName: user.email || "Admin",
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
    return canAccess(adminUser.role, tab)
  }

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        adminUser,
        role: adminUser?.role ?? null,
        loading,
        canAccess: checkAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
