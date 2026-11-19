/*
 * Lingua dell'interfaccia: italiano (predefinito) o inglese.
 * Ordine di scelta: ?lang=it|en nell'indirizzo, poi la scelta salvata, poi italiano.
 */
import { useEffect, useState } from 'preact/hooks'
import { en, it, type MessageKey } from './messages'

export type Lang = 'it' | 'en'
export type { MessageKey }

const KEY = 'gs1-webvoc-lang'
const isLang = (v: unknown): v is Lang => v === 'it' || v === 'en'

function initial(): Lang {
  if (typeof window === 'undefined') return 'it'
  const param = new URLSearchParams(window.location.search).get('lang')
  if (isLang(param)) return param
  try {
    const stored = localStorage.getItem(KEY)
    if (isLang(stored)) return stored
  } catch {
    // Archiviazione non disponibile: si resta sull'italiano.
  }
  return 'it'
}

let current: Lang = initial()
const listeners = new Set<() => void>()
if (typeof document !== 'undefined') document.documentElement.lang = current

export const lang = () => current

export function setLang(next: Lang) {
  if (next === current) return
  current = next
  document.documentElement.lang = next
  try {
    localStorage.setItem(KEY, next)
  } catch {
    // Vale solo per questa visita.
  }
  listeners.forEach((l) => l())
}

/** La lingua corrente; il componente si aggiorna quando cambia. */
export function useLang(): Lang {
  const [, refresh] = useState(0)
  useEffect(() => {
    const l = () => refresh((n) => n + 1)
    listeners.add(l)
    return () => void listeners.delete(l)
  }, [])
  return current
}

/** Testo nella lingua corrente, con le variabili `{nome}` sostituite. */
export function t(key: MessageKey, vars?: Record<string, string | number>): string {
  const s = (current === 'en' ? en : it)[key]
  return vars ? s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : s
}

/** Per i testi con chiave calcolata (es. 'step.' + id): la chiave deve esistere. */
export const tk = (key: string, vars?: Record<string, string | number>) => t(key as MessageKey, vars)

/** Nome di un paese dal codice ISO 3166-1, nella lingua corrente. */
export function countryName(code: string): string {
  try {
    return new Intl.DisplayNames([current], { type: 'region' }).of(code) ?? code
  } catch {
    return code
  }
}
