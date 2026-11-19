import { describe, expect, it } from 'vitest'
import { biscuits, denimJacket } from './examples'
import { initialState } from './state'
import { neighbourTab, optionalTab, stepsOf, tabOf, TABS, visibleTabs } from './tabs'
import { STEPS } from './steps'

describe('tab del wizard', () => {
  it('ogni passo tranne il benvenuto sta in un solo tab', () => {
    const placed = TABS.flatMap((t) => t.steps as readonly string[])
    expect(new Set(placed).size).toBe(placed.length)
    expect(STEPS.filter((s) => !placed.includes(s))).toEqual(['welcome'])
  })

  it('un prodotto alimentare senza offerta: niente sede, dettagli con alimentari', () => {
    const s = biscuits()
    expect(visibleTabs(s)).toEqual(['start', 'product', 'details', 'sale', 'more', 'check', 'markup'])
    expect(stepsOf(s, 'details')).toEqual(['food', 'consumer'])
    expect(stepsOf(s, 'sale')).toEqual(['company'])
  })

  it('il retailer della giacca vede offerta e tessile', () => {
    const s = denimJacket()
    expect(stepsOf(s, 'details')).toEqual(['wearable', 'consumer'])
    expect(stepsOf(s, 'sale')).toEqual(['offer', 'company'])
  })

  it('una sede salta prodotto, dettagli e vendita', () => {
    const s = { ...initialState(), subject: 'location' as const }
    expect(visibleTabs(s)).toEqual(['start', 'place', 'more', 'check', 'markup'])
  })

  it('navigazione tra tab', () => {
    const s = biscuits()
    expect(neighbourTab(s, 'welcome', 1)).toBe('start')
    expect(neighbourTab(s, 'start', -1)).toBe('welcome')
    expect(neighbourTab(s, 'details', 1)).toBe('sale')
    expect(neighbourTab(s, 'markup', 1)).toBeUndefined()
    expect(tabOf('nutrition' as never)).toBe('welcome')
    expect(tabOf('offer')).toBe('sale')
  })

  it('solo i tab senza campi obbligatori si possono rimandare', () => {
    const s = biscuits()
    expect(optionalTab(s, 'details')).toBe(true)
    expect(optionalTab(s, 'product')).toBe(false)
    expect(optionalTab(s, 'start')).toBe(false)
  })
})
