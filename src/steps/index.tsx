/** I campi di ciascun passo: li usano sia il wizard sia la modalità esperto. */
import type { JSX } from 'preact'
import type { MessageKey } from '../i18n'
import type { StepId } from '../model/steps'
import { Food } from './Food'
import { LocationStep } from './Location'
import { Company, Consumer, Identity, Offer, Packaging } from './Product'
import { CategoryStep, RoleStep, Settings, SubjectStep } from './Setup'
import { Wearable } from './Wearable'

export const STEP_FIELDS: Partial<Record<StepId, () => JSX.Element>> = {
  settings: Settings,
  role: RoleStep,
  subject: SubjectStep,
  category: CategoryStep,
  identity: Identity,
  packaging: Packaging,
  food: Food,
  wearable: Wearable,
  consumer: Consumer,
  offer: Offer,
  company: Company,
  location: LocationStep,
}

/** La frase introduttiva sotto il titolo di ciascun passo. */
export const STEP_INTRO: Partial<Record<StepId, MessageKey>> = {
  settings: 'settings.intro',
  role: 'role.intro',
  subject: 'subject.intro',
  category: 'category.intro',
  identity: 'identity.intro',
  packaging: 'packaging.intro',
  food: 'food.intro',
  wearable: 'wearable.intro',
  consumer: 'consumer.intro',
  offer: 'offer.intro',
  company: 'company.intro',
  location: 'location.intro',
  summary: 'summary.intro',
}
