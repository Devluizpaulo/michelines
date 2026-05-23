"use client"

import { useState, useEffect } from "react"
import {
  collection, getDocs, doc, setDoc, updateDoc, deleteDoc, serverTimestamp
} from "firebase/firestore"
import {
  createUserWithEmailAndPassword, sendPasswordResetEmail
} from "firebase/auth"
import { db, auth } from "@/app/firebase/config"
import { AdminUser, UserRole, ROLE_LABELS, ROLE_PERMISSIONS, TabId } from "@/lib/permissions"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  UserPlus, Shield, RefreshCw, Trash2, MailIcon, KeyRound,
  CheckCircle2, XCircle, Crown, Eye, EyeOff, Users, Lock
} from "lucide-react"
import { motion } from "framer-motion"
import { THEME_TOKENS } from "@/theme/design-system"

const TAB_LABELS: Record<TabId, string> = {
  dashboard:     "Dashboard",
  leads:         "Leads Funil",
  campanhas:     "Campanhas",
  landing:       "Landing Page",
  frota:         "Frota",
  analytics:     "Analytics",
  configuracoes: "Configurações",
  usuarios:      "Usuários",
}

export function UserManager() {
  const { adminUser } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [resetSent, setResetSent] = useState<string | null>(null)

  // Form state
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
    role: "vendedor" as UserRole,
  })

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const snap = await getDocs(collection(db, "admin_users"))
      const list: AdminUser[] = []
      snap.forEach(d => list.push({ uid: d.id, ...d.data() } as AdminUser))
      setUsers(list.sort((a, b) => a.displayName.localeCompare(b.displayName)))
    } catch (e) {
      console.error("Erro ao buscar usuários:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  // Criar novo usuário
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password || !form.displayName) return
    setSaving(true)
    try {
      // 1. Cria no Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password)

      // 2. Cria perfil no Firestore
      const userDoc: Omit<AdminUser, "uid"> = {
        email: form.email,
        displayName: form.displayName,
        role: form.role,
        active: true,
        createdAt: new Date().toISOString(),
        createdBy: adminUser?.uid || "system",
      }
      await setDoc(doc(db, "admin_users", cred.user.uid), userDoc)

      setCreateOpen(false)
      setForm({ displayName: "", email: "", password: "", role: "vendedor" })
      await fetchUsers()
    } catch (err: any) {
      let msg = "Erro ao criar usuário."
      if (err.code === "auth/email-already-in-use") msg = "Este email já está em uso."
      if (err.code === "auth/weak-password") msg = "Senha fraca. Use pelo menos 6 caracteres."
      alert(msg)
    } finally {
      setSaving(false)
    }
  }

  // Atualizar role/status
  const handleUpdateRole = async (uid: string, role: UserRole) => {
    try {
      await updateDoc(doc(db, "admin_users", uid), { role })
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role } : u))
    } catch (e) {
      alert("Erro ao atualizar permissão.")
    }
  }

  const handleToggleActive = async (uid: string, active: boolean) => {
    try {
      await updateDoc(doc(db, "admin_users", uid), { active: !active })
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, active: !active } : u))
    } catch (e) {
      alert("Erro ao atualizar status.")
    }
  }

  const handleResetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      setResetSent(email)
      setTimeout(() => setResetSent(null), 5000)
    } catch (e) {
      alert("Erro ao enviar email de redefinição.")
    }
  }

  const handleDelete = async (uid: string, email: string) => {
    if (!confirm(`Remover "${email}" do painel admin? O acesso será bloqueado imediatamente.`)) return
    try {
      await deleteDoc(doc(db, "admin_users", uid))
      setUsers(prev => prev.filter(u => u.uid !== uid))
    } catch (e) {
      alert("Erro ao remover usuário.")
    }
  }

  return (
    <div className="space-y-8 select-none">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-sky-600" />
            Gestão de Usuários & Permissões
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-semibold">
            Cadastre membros da equipe e defina o nível de acesso de cada um ao CRM.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchUsers}
            className="border-slate-200 bg-white text-slate-500 hover:text-slate-700 h-10 w-10 p-0 shadow-sm"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs h-10 px-4 flex items-center gap-2 rounded-lg shadow-md"
          >
            <UserPlus className="h-4 w-4" /> Novo Usuário
          </Button>
        </div>
      </div>

      {/* Legenda de roles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.entries(ROLE_LABELS) as [UserRole, typeof ROLE_LABELS[UserRole]][]).map(([role, info]) => (
          <div key={role} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-1.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${info.color}`}>
              {info.label}
            </span>
            <p className="text-[11px] text-slate-500 leading-snug">{info.description}</p>
            <div className="flex flex-wrap gap-1 pt-1">
              {ROLE_PERMISSIONS[role].map(tab => (
                <span key={tab} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                  {TAB_LABELS[tab]}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Shield className="h-4 w-4 text-sky-600" />
            Membros com Acesso ao Painel
          </h3>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            {users.length} usuário{users.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center gap-3 text-slate-400">
            <span className="animate-spin h-5 w-5 border-2 border-sky-500 border-t-transparent rounded-full" />
            <span className="text-xs font-semibold">Carregando usuários...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Users className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-500">Nenhum usuário cadastrado ainda.</p>
            <Button onClick={() => setCreateOpen(true)} className="bg-sky-600 hover:bg-sky-500 text-white text-xs h-9 px-4">
              <UserPlus className="h-4 w-4 mr-1.5" /> Criar Primeiro Usuário
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {users.map((user) => {
              const roleInfo = ROLE_LABELS[user.role]
              const isCurrentUser = user.uid === adminUser?.uid
              return (
                <motion.div
                  key={user.uid}
                  {...THEME_TOKENS.motion.scaleHover}
                  className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  {/* Avatar */}
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sky-100 to-sky-200 border border-sky-200 flex items-center justify-center shrink-0">
                    <span className="text-xs font-black text-sky-700">
                      {user.displayName?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.displayName}</p>
                      {isCurrentUser && (
                        <span className="text-[9px] bg-sky-100 text-sky-700 border border-sky-200 px-1.5 py-0.5 rounded font-bold">Você</span>
                      )}
                      {user.role === "super_admin" && (
                        <Crown className="h-3.5 w-3.5 text-amber-500" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold truncate">{user.email}</p>
                  </div>

                  {/* Role Badge */}
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded border shrink-0 ${roleInfo.color}`}>
                    {roleInfo.label}
                  </span>

                  {/* Status */}
                  <div className="shrink-0">
                    {user.active ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Ativo
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                        <XCircle className="h-3.5 w-3.5" /> Inativo
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  {!isCurrentUser && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Change Role */}
                      <Select
                        value={user.role}
                        onValueChange={(val) => handleUpdateRole(user.uid, val as UserRole)}
                        disabled={isCurrentUser}
                      >
                        <SelectTrigger className="h-8 text-[10px] font-bold border-slate-200 bg-white text-slate-700 w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 text-slate-700">
                          {(Object.keys(ROLE_LABELS) as UserRole[]).map(r => (
                            <SelectItem key={r} value={r} className="text-xs">
                              {ROLE_LABELS[r].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Toggle Active */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleActive(user.uid, user.active)}
                        className={`h-8 w-8 p-0 ${user.active ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"}`}
                        title={user.active ? "Desativar acesso" : "Reativar acesso"}
                      >
                        <Lock className="h-3.5 w-3.5" />
                      </Button>

                      {/* Reset Password */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleResetPassword(user.email)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-sky-600 hover:bg-sky-50"
                        title="Enviar email de redefinição de senha"
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                      </Button>

                      {/* Delete */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(user.uid, user.email)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Remover acesso"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Reset feedback */}
      {resetSent && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-bottom-4">
          <MailIcon className="h-4 w-4" />
          Email de redefinição enviado para {resetSent}
        </div>
      )}

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-white border border-slate-200 text-slate-800 w-full sm:max-w-md">
          <form onSubmit={handleCreate} className="space-y-5">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-sky-600" />
                Novo Membro da Equipe
              </DialogTitle>
              <DialogDescription className="text-slate-500">
                Crie uma conta de acesso ao CRM e defina as permissões do usuário.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-bold">Nome completo</Label>
                <Input
                  placeholder="Ex: João Silva"
                  value={form.displayName}
                  onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))}
                  className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-bold">Email corporativo</Label>
                <Input
                  type="email"
                  placeholder="joao@grupomichelines.com.br"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-bold">Senha inicial</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">O usuário poderá alterar a senha após o primeiro login.</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-bold">Nível de acesso (Role)</Label>
                <Select
                  value={form.role}
                  onValueChange={val => setForm(p => ({ ...p, role: val as UserRole }))}
                >
                  <SelectTrigger className="bg-white border-slate-200 text-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-700">
                    {(Object.entries(ROLE_LABELS) as [UserRole, typeof ROLE_LABELS[UserRole]][]).map(([role, info]) => (
                      <SelectItem key={role} value={role}>
                        <div>
                          <span className="font-bold">{info.label}</span>
                          <span className="text-slate-400 ml-2 text-xs">— {info.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Preview das permissões */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg mt-2">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Acesso liberado:</p>
                  <div className="flex flex-wrap gap-1">
                    {ROLE_PERMISSIONS[form.role].map(tab => (
                      <span key={tab} className="text-[9px] bg-sky-50 text-sky-700 border border-sky-200 px-1.5 py-0.5 rounded font-bold">
                        {TAB_LABELS[tab]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-slate-100 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                className="border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold"
              >
                {saving ? "Criando..." : "Criar Usuário"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}
