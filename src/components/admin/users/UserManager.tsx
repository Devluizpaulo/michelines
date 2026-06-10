"use client"

import { useState, useEffect } from "react"
import {
  collection, getDocs, doc, setDoc, updateDoc, deleteDoc, serverTimestamp
} from "firebase/firestore"
import {
  createUserWithEmailAndPassword, sendPasswordResetEmail
} from "firebase/auth"
import { db, auth, secondaryAuth } from "@/app/firebase/config"
import { AdminUser, UserRole, ROLE_LABELS, ROLE_PERMISSIONS, TabId } from "@/lib/permissions"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/components/ui/toast-simple"
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
  CheckCircle2, XCircle, Crown, Eye, EyeOff, Users, Lock,
  Send, Pencil
} from "lucide-react"
import { motion } from "framer-motion"
import { THEME_TOKENS } from "@/theme/design-system"
import { Textarea } from "@/components/ui/textarea"

const TAB_LABELS: Record<TabId, string> = {
  dashboard:     "Dashboard",
  leads:         "Leads Funil",
  campanhas:     "Campanhas",
  landing:       "Landing Page",
  depoimentos:   "Depoimentos",
  frota:         "Frota",
  analytics:     "Analytics",
  configuracoes: "Configurações",
  usuarios:      "Usuários",
  operacao:      "Operação & Preços",
  agenda:        "Agenda",
}

export function UserManager() {
  const { adminUser, customPermissions } = useAuth()
  const { success, error: toastError } = useToast()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [editForm, setEditForm] = useState({
    displayName: "",
    phone: "",
    role: "vendedor" as UserRole,
  })
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [resetSent, setResetSent] = useState<string | null>(null)

  const handleStartEdit = (user: AdminUser) => {
    setEditUser(user)
    setEditForm({
      displayName: user.displayName,
      phone: user.phone || "",
      role: user.role,
    })
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editUser) return
    setSaving(true)
    try {
      await updateDoc(doc(db, "admin_users", editUser.uid), {
        displayName: editForm.displayName,
        phone: editForm.phone,
        role: editForm.role,
      })
      
      // Update local state
      setUsers(prev => prev.map(u => u.uid === editUser.uid ? {
        ...u,
        displayName: editForm.displayName,
        phone: editForm.phone,
        role: editForm.role
      } : u))
      
      setEditUser(null)
      success("Usuário atualizado!", "Os dados do usuário foram salvos com sucesso.")
    } catch (err: any) {
      console.error(err)
      toastError("Erro ao atualizar usuário", err.message || "Tente novamente.")
    } finally {
      setSaving(false)
    }
  }
  
  // Custom manual invitation share states
  const [shareOpen, setShareOpen] = useState(false)
  const [shareData, setShareData] = useState({
    displayName: "",
    email: "",
    phone: "",
    message: ""
  })

  // Configuração local de permissões dinâmicas
  const [permissionsConfig, setPermissionsConfig] = useState<Record<UserRole, TabId[]>>(ROLE_PERMISSIONS)
  const [savingPermissions, setSavingPermissions] = useState(false)

  // Sincroniza estado local com as permissões do contexto/Firestore
  useEffect(() => {
    if (customPermissions) {
      setPermissionsConfig(customPermissions)
    }
  }, [customPermissions])

  // Modifica permissão localmente
  const handleTogglePermission = (role: UserRole, tab: TabId) => {
    setPermissionsConfig(prev => {
      const current = prev[role] || []
      const updated = current.includes(tab)
        ? current.filter(t => t !== tab)
        : [...current, tab]
      return { ...prev, [role]: updated }
    })
  }

  // Grava permissões atualizadas no Firestore
  const handleSavePermissions = async () => {
    setSavingPermissions(true)
    try {
      await setDoc(doc(db, "role_permissions", "config"), permissionsConfig)
      success("Permissões salvas!", "Níveis de acesso e permissões salvos com sucesso.")
    } catch (e: any) {
      console.error(e)
      toastError("Erro ao salvar permissões", e.message || "Tente novamente.")
    } finally {
      setSavingPermissions(false)
    }
  }

  // Form state
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    phone: "",
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

  // Criar novo usuário por convite
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.displayName) return
    setSaving(true)
    try {
      // 1. Gera uma senha temporária aleatória segura
      const tempPassword = Math.random().toString(36).slice(-10) + "A1!" + Math.random().toString(36).slice(-5).toUpperCase()

      // 2. Cria no Firebase Auth usando a instância secundária isolada
      const cred = await createUserWithEmailAndPassword(secondaryAuth, form.email, tempPassword)

      // 3. Cria perfil no Firestore
      const userDoc: Omit<AdminUser, "uid"> = {
        email: form.email,
        displayName: form.displayName,
        phone: form.phone,
        role: form.role,
        active: true,
        createdAt: new Date().toISOString(),
        createdBy: adminUser?.uid || "system",
      }
      await setDoc(doc(db, "admin_users", cred.user.uid), userDoc)

      // Desloga o usuário da instância secundária imediatamente
      await secondaryAuth.signOut()

      // 4. Constrói uma mensagem humana e solícita de convite de acesso
      const inviteMsg = `Fala, ${form.displayName}! Tudo bem?

Você foi convidado para fazer parte da equipe de gestão comercial do Grupo Michelines! 🚖

Seu acesso já está liberado na nossa plataforma. Para definir sua senha pessoal de primeiro acesso, entre no link abaixo:
${window.location.origin}/recuperar-senha?email=${encodeURIComponent(form.email)}

Após cadastrar sua nova senha, você poderá acessar o painel de controle pelo link:
${window.location.origin}/login
Login: ${form.email}

Qualquer dúvida no acesso ou na configuração, é só me chamar aqui! Tamo junto! 🤝`

      setShareData({
        displayName: form.displayName,
        email: form.email,
        phone: form.phone,
        message: inviteMsg
      })

      setCreateOpen(false)
      setForm({ displayName: "", email: "", phone: "", role: "vendedor" })
      await fetchUsers()
      
      // Abre o diálogo de compartilhamento customizado
      setShareOpen(true)
    } catch (err: any) {
      let msg = "Erro ao criar usuário."
      if (err.code === "auth/email-already-in-use") msg = "Este email já está em uso."
      toastError("Erro ao criar usuário", msg)
    } finally {
      setSaving(false)
    }
  }

  // Atualizar role/status
  const handleUpdateRole = async (uid: string, role: UserRole) => {
    try {
      await updateDoc(doc(db, "admin_users", uid), { role })
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role } : u))
      success("Cargo atualizado!", "O nível de acesso do usuário foi alterado.")
    } catch (e: any) {
      toastError("Erro ao atualizar cargo", e.message || "Tente novamente.")
    }
  }

  const handleToggleActive = async (uid: string, active: boolean) => {
    try {
      await updateDoc(doc(db, "admin_users", uid), { active: !active })
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, active: !active } : u))
      success(
        active ? "Acesso bloqueado!" : "Acesso liberado!",
        active ? "O usuário não poderá acessar o painel." : "O usuário agora pode acessar o painel."
      )
    } catch (e: any) {
      toastError("Erro ao atualizar status", e.message || "Tente novamente.")
    }
  }

  const handleResetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      success("E-mail enviado!", `Um link para redefinir a senha foi enviado para ${email}.`)
    } catch (e: any) {
      toastError("Erro ao redefinir senha", e.message || "Tente novamente.")
    }
  }

  const handleDelete = async (uid: string, email: string) => {
    if (!confirm(`Remover "${email}" do painel admin? O acesso será bloqueado imediatamente.`)) return
    try {
      await deleteDoc(doc(db, "admin_users", uid))
      setUsers(prev => prev.filter(u => u.uid !== uid))
      success("Usuário removido!", "O acesso do usuário foi removido permanentemente do Firestore.")
    } catch (e: any) {
      toastError("Erro ao remover usuário", e.message || "Tente novamente.")
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
              {(permissionsConfig[role] || ROLE_PERMISSIONS[role] || []).map(tab => (
                <span key={tab} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                  {TAB_LABELS[tab]}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Painel de Permissões (Apenas para Super Admin) */}
      {adminUser?.role === "super_admin" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Lock className="h-4 w-4 text-sky-600" />
              Matriz de Permissões de Acesso (RBAC)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">
              Gerencie dinamicamente as permissões de cada perfil. Perfis ativos terão as telas atualizadas em tempo real.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-105 rounded-xl">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-4 font-black">Perfil / Cargo</th>
                  {Object.entries(TAB_LABELS).map(([id, label]) => (
                    <th key={id} className="p-4 text-center font-black">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {(["gerente", "vendedor", "marketing"] as UserRole[]).map((r) => (
                  <tr key={r} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${ROLE_LABELS[r].color}`}>
                        {ROLE_LABELS[r].label}
                      </span>
                    </td>
                    {(Object.keys(TAB_LABELS) as TabId[]).map((tab) => {
                      const isAllowed = permissionsConfig[r]?.includes(tab) || false
                      return (
                        <td key={tab} className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={isAllowed}
                            onChange={() => handleTogglePermission(r, tab)}
                            className="h-4 w-4 rounded border-slate-350 bg-white text-sky-600 focus:ring-sky-500 cursor-pointer"
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
                {/* Super Admin - Visualização bloqueada (sempre habilitado) */}
                <tr className="bg-slate-50/30">
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${ROLE_LABELS.super_admin.color}`}>
                      {ROLE_LABELS.super_admin.label}
                    </span>
                  </td>
                  {(Object.keys(TAB_LABELS) as TabId[]).map((tab) => (
                    <td key={tab} className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={true}
                        disabled={true}
                        className="h-4 w-4 rounded border-slate-350 bg-slate-200 text-slate-400 cursor-not-allowed"
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center pt-2">
            <Button
              variant="outline"
              onClick={() => {
                if (confirm("Deseja restaurar as permissões padrão do sistema?")) {
                  setPermissionsConfig(ROLE_PERMISSIONS)
                }
              }}
              className="border-slate-200 hover:border-slate-350 text-slate-500 hover:text-slate-700 h-9 font-bold text-xs shadow-sm bg-white"
            >
              Restaurar Padrões
            </Button>
            <Button
              disabled={savingPermissions}
              onClick={handleSavePermissions}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold h-9 px-4 text-xs shadow-sm"
            >
              {savingPermissions ? "Salvando..." : "Salvar Permissões de Acesso"}
            </Button>
          </div>
        </div>
      )}

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
                    <p className="text-[11px] text-slate-500 font-semibold truncate flex items-center gap-1.5">
                      <span>{user.email}</span>
                      {user.phone && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span>{user.phone}</span>
                        </>
                      )}
                    </p>
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

                      {/* Edit Details */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartEdit(user)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-sky-600 hover:bg-sky-50"
                        title="Editar dados do usuário"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>

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



      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-white border border-slate-200 text-slate-800 w-full sm:max-w-md" descriptionId="create-user-dialog-description">
          <form onSubmit={handleCreate} className="space-y-5">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-sky-600" />
                Novo Membro da Equipe
              </DialogTitle>
              <DialogDescription id="create-user-dialog-description" className="text-slate-500">
                O usuário receberá um convite por e-mail para cadastrar sua própria senha.
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
                <Label className="text-slate-700 text-xs font-bold">Telefone / WhatsApp</Label>
                <Input
                  placeholder="Ex: (11) 99999-9999"
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
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

      {/* Edit User Dialog */}
      <Dialog open={editUser !== null} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="bg-white border border-slate-200 text-slate-800 w-full sm:max-w-md" descriptionId="edit-user-dialog-description">
          <form onSubmit={handleEditSubmit} className="space-y-5">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Pencil className="h-5 w-5 text-sky-600" />
                Editar Dados do Membro
              </DialogTitle>
              <DialogDescription id="edit-user-dialog-description" className="text-slate-500">
                Altere as informações de cadastro e o cargo do membro da equipe.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-bold">Nome completo</Label>
                <Input
                  placeholder="Ex: João Silva"
                  value={editForm.displayName}
                  onChange={e => setEditForm(p => ({ ...p, displayName: e.target.value }))}
                  className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-bold">Telefone / WhatsApp</Label>
                <Input
                  placeholder="Ex: (11) 99999-9999"
                  value={editForm.phone}
                  onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                  className="bg-white border-slate-200 text-slate-800 focus-visible:ring-sky-500"
                  required
                />
              </div>

              <div className="space-y-1.5 opacity-70">
                <Label className="text-slate-700 text-xs font-bold flex items-center gap-1">
                  Email corporativo <Lock className="h-3 w-3 text-slate-400" />
                </Label>
                <Input
                  type="email"
                  value={editUser?.email || ""}
                  disabled
                  className="bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed select-none"
                />
                <p className="text-[10px] text-slate-400 font-semibold mt-1">
                  O email de login não pode ser alterado para evitar inconsistência de acesso.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-bold">Nível de acesso (Role)</Label>
                <Select
                  value={editForm.role}
                  onValueChange={val => setEditForm(p => ({ ...p, role: val as UserRole }))}
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
                    {(ROLE_PERMISSIONS[editForm.role] || []).map(tab => (
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
                onClick={() => setEditUser(null)}
                className="border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold"
              >
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
 
      {/* Dialog de Compartilhamento de Convite Premium (Aesthetics Wow) */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="bg-white border border-slate-200 text-slate-800 w-full sm:max-w-md" descriptionId="share-invite-dialog-description">
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 animate-bounce" />
                Usuário Criado com Sucesso! 🎉
              </DialogTitle>
              <DialogDescription id="share-invite-dialog-description" className="text-slate-500">
                Encaminhe o convite de primeiro acesso para <span className="text-slate-800 font-bold">{shareData.displayName}</span> usando os canais abaixo.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-450">Mensagem do Convite (Editável)</label>
              <Textarea
                value={shareData.message}
                onChange={(e) => setShareData(prev => ({ ...prev, message: e.target.value }))}
                className="min-h-[220px] bg-slate-50 border border-slate-200 text-slate-800 text-xs p-3 leading-relaxed focus-visible:ring-sky-500"
              />
            </div>

            {/* Actions for Sharing */}
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                {/* WhatsApp button */}
                <a
                  href={`https://wa.me/${(shareData.phone || "").replace(/\D/g, "").startsWith("55") ? (shareData.phone || "").replace(/\D/g, "") : `55${(shareData.phone || "").replace(/\D/g, "")}`}?text=${encodeURIComponent(shareData.message)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 h-10 rounded-xl transition-all shadow-sm active:scale-[0.98]">
                    <Send className="h-3.5 w-3.5" /> WhatsApp
                  </Button>
                </a>

                {/* Email (mailto) button */}
                <a
                  href={`mailto:${shareData.email}?subject=${encodeURIComponent("Convite de Acesso - Grupo Michelines 🚖")}&body=${encodeURIComponent(shareData.message)}`}
                  className="flex-1"
                >
                  <Button className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 h-10 rounded-xl transition-all shadow-sm active:scale-[0.98]">
                    <MailIcon className="h-3.5 w-3.5" /> Enviar por E-mail
                  </Button>
                </a>
              </div>

              {/* Copy to Clipboard Button */}
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(shareData.message)
                  alert("Mensagem copiada para a área de transferência!")
                }}
                variant="outline"
                className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs h-10 rounded-xl flex items-center justify-center gap-1.5"
              >
                Copiar Texto do Convite
              </Button>
            </div>

            <DialogFooter className="pt-2 border-t border-slate-100">
              <Button
                type="button"
                onClick={() => setShareOpen(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-9 rounded-lg"
              >
                Fechar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
