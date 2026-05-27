/**
 * firebase-crud.ts
 * Wrapper centralizado para operações CRUD no Firestore.
 * Fornece tratamento de erro consistente e retorna { data, error } em vez de lançar exceções.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  QueryConstraint,
  DocumentData,
  WithFieldValue,
  UpdateData,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/app/firebase/config"

export interface CrudResult<T> {
  data: T | null
  error: string | null
}

export interface CrudListResult<T> {
  data: T[]
  error: string | null
}

// ─── READ ─────────────────────────────────────────────────────────────────────

/**
 * Busca um único documento pelo ID
 */
export async function getDocument<T>(
  collectionName: string,
  documentId: string
): Promise<CrudResult<T>> {
  try {
    const ref = doc(db, collectionName, documentId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return { data: null, error: "Documento não encontrado." }
    return { data: { id: snap.id, ...snap.data() } as T, error: null }
  } catch (err: any) {
    console.error(`[firebase-crud] getDocument(${collectionName}/${documentId}):`, err)
    return { data: null, error: err.message || "Erro ao buscar documento." }
  }
}

/**
 * Lista documentos de uma coleção com constraints opcionais
 */
export async function listDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<CrudListResult<T>> {
  try {
    const ref = collection(db, collectionName)
    const q = constraints.length ? query(ref, ...constraints) : query(ref)
    const snap = await getDocs(q)
    const data: T[] = []
    snap.forEach((d) => data.push({ id: d.id, ...d.data() } as T))
    return { data, error: null }
  } catch (err: any) {
    console.error(`[firebase-crud] listDocuments(${collectionName}):`, err)
    return { data: [], error: err.message || "Erro ao listar documentos." }
  }
}

// ─── CREATE ───────────────────────────────────────────────────────────────────

/**
 * Cria um novo documento com ID gerado automaticamente
 */
export async function createDocument<T extends object>(
  collectionName: string,
  data: WithFieldValue<T>
): Promise<CrudResult<string>> {
  try {
    const ref = collection(db, collectionName)
    const payload = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const docRef = await addDoc(ref, payload)
    return { data: docRef.id, error: null }
  } catch (err: any) {
    console.error(`[firebase-crud] createDocument(${collectionName}):`, err)
    return { data: null, error: err.message || "Erro ao criar documento." }
  }
}

/**
 * Cria ou substitui um documento com ID específico
 */
export async function setDocument<T extends object>(
  collectionName: string,
  documentId: string,
  data: WithFieldValue<T>,
  merge = true
): Promise<CrudResult<boolean>> {
  try {
    const ref = doc(db, collectionName, documentId)
    const payload = {
      ...data,
      updatedAt: new Date().toISOString(),
    }
    await setDoc(ref, payload, { merge })
    return { data: true, error: null }
  } catch (err: any) {
    console.error(`[firebase-crud] setDocument(${collectionName}/${documentId}):`, err)
    return { data: null, error: err.message || "Erro ao salvar documento." }
  }
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

/**
 * Atualiza campos específicos de um documento existente
 */
export async function updateDocument<T>(
  collectionName: string,
  documentId: string,
  data: UpdateData<T>
): Promise<CrudResult<boolean>> {
  try {
    const ref = doc(db, collectionName, documentId)
    // Cast necessário: UpdateData<T> é um tipo mapeado que o TS não garante
    // ser espalhável sem uma restrição explícita. Em runtime é sempre um objeto.
    const payload = {
      ...(data as Record<string, unknown>),
      updatedAt: new Date().toISOString(),
    }
    await updateDoc(ref, payload)
    return { data: true, error: null }
  } catch (err: any) {
    console.error(`[firebase-crud] updateDocument(${collectionName}/${documentId}):`, err)
    return { data: null, error: err.message || "Erro ao atualizar documento." }
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

/**
 * Remove um documento pelo ID
 */
export async function deleteDocument(
  collectionName: string,
  documentId: string
): Promise<CrudResult<boolean>> {
  try {
    const ref = doc(db, collectionName, documentId)
    await deleteDoc(ref)
    return { data: true, error: null }
  } catch (err: any) {
    console.error(`[firebase-crud] deleteDocument(${collectionName}/${documentId}):`, err)
    return { data: null, error: err.message || "Erro ao excluir documento." }
  }
}

// ─── Re-exports úteis ─────────────────────────────────────────────────────────
export { orderBy, where, limit }
