/** Modalità esperto: tutti i gruppi aperti in una pagina, con l'indice dei gruppi a lato. */
import { useRef } from 'preact/hooks'
import { useForm } from '../form'
import { gsap, useGsap } from '../motion'
import { t, tk } from '../i18n'
import { visibleSteps } from '../model/steps'
import { STEP_FIELDS, STEP_INTRO } from '../steps'
import { MarkupActions } from '../steps/Markup'
import { Score } from '../steps/Summary'

export function Expert() {
  const { state } = useForm()
  const groups = visibleSteps(state).filter((s) => STEP_FIELDS[s])
  const scope = useRef<HTMLDivElement>(null)
  useGsap(scope, () => {
    gsap.from('.expert-main > *', { y: 20, opacity: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out', clearProps: 'transform,opacity' })
  })
  return (
    <div class="expert" ref={scope}>
      <nav class="groups" aria-label={t('expert.groups')}>
        <p class="groups-title">{t('expert.groups')}</p>
        <ol>
          {groups.map((g) => (
            <li key={g}>
              <a href={`#group-${g}`}>{tk(`step.${g}`)}</a>
            </li>
          ))}
          <li>
            <a href="#group-score">{t('score.title')}</a>
          </li>
        </ol>
      </nav>
      <div class="expert-main">
        <h1>{t('expert.heading')}</h1>
        <p class="intro">{t('expert.intro')}</p>
        {groups.map((g) => {
          const Fields = STEP_FIELDS[g]!
          const intro = STEP_INTRO[g]
          return (
            <section class="group" id={`group-${g}`} key={g} aria-labelledby={`group-${g}-title`}>
              <h2 id={`group-${g}-title`}>{tk(`step.${g}`)}</h2>
              {intro && <p class="hint">{t(intro)}</p>}
              <Fields />
            </section>
          )
        })}
        <section class="group" id="group-score">
          <Score />
          <MarkupActions />
        </section>
      </div>
    </div>
  )
}
