import type { ComponentChildren } from 'preact'
import { useRef } from 'preact/hooks'
import { BiscuitsIllustration, HeroIllustration, JacketIllustration } from '../components/Illustrations'
import { t } from '../i18n'
import { gsap, useGsap } from '../motion'

type Props = { heading: ComponentChildren; onExample: (name: 'biscuits' | 'denimJacket') => void }

/**
 * Primo passo: cosa fa lo strumento e l'azione per iniziare, gli esempi, cosa serve e dove restano i dati.
 * All'apertura una sola sequenza: la card principale, il titolo, l'illustrazione che si compone.
 */
export function Welcome({ heading, onExample }: Props) {
  const scope = useRef<HTMLDivElement>(null)
  useGsap(scope, () => {
    gsap
      .timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero-card', { y: 24, opacity: 0, duration: 0.6 })
      .from('.hero-copy > *', { y: 14, opacity: 0, duration: 0.5, stagger: 0.07 }, '-=0.4')
      .from('.ga-page', { y: 18, opacity: 0, duration: 0.6 }, '-=0.6')
      .from('.ga-code', { x: -24, opacity: 0, duration: 0.5 }, '-=0.35')
      .from('.ga-qr', { scale: 0.6, opacity: 0, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(2)' }, '-=0.3')
      .from('.ga-link', { strokeDashoffset: 260, opacity: 0, duration: 0.9, ease: 'power2.inOut' }, '-=0.3')
      .from('.reveal', { y: 24, opacity: 0, duration: 0.5, stagger: 0.08 }, '-=0.6')
    gsap.to('.ga-ring', { attr: { r: 110 }, strokeOpacity: 0, duration: 2.8, ease: 'sine.out', repeat: -1, repeatDelay: 1.2 })
    gsap.to('.ga-code', { y: -6, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.4 })
    gsap.to('.ga-qr', { y: 6, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.6 })
    gsap.to('.ga-dot', { scale: 0.5, opacity: 0.4, transformOrigin: '50% 50%', duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.4 })
    gsap.to('.card-ill .ga-float-a', { y: -4, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    gsap.to('.card-ill .ga-float-b', { y: 5, x: -2, duration: 2.9, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.4 })
    gsap.to('.card-ill .ga-float-c', { y: -6, duration: 3.3, ease: 'sine.inOut', yoyo: true, repeat: -1 })
  })

  return (
    <div class="welcome" ref={scope}>
      <section class="hero-card">
        <div class="hero-copy">
          {heading}
          <p class="lead">{t('welcome.line1')}</p>
          <p>{t('welcome.line2')}</p>
          <div class="hero-action">
            <button type="submit" class="btn-primary btn-cta">
              {t('nav.start')}
            </button>
            <span class="hint">{t('welcome.line3')}</span>
          </div>
        </div>
        <HeroIllustration />
      </section>

      <section class="reveal" aria-labelledby="examples-title">
        <h2 id="examples-title" class="section-label">
          {t('welcome.examplesTitle')}
        </h2>
        <p class="hint section-note">{t('welcome.examples')}</p>
        <div class="example-cards">
          <button type="button" class="example-card navy" onClick={() => onExample('biscuits')}>
            <span class="example-text">
              <strong>{t('welcome.biscuits')}</strong>
              <span>{t('welcome.biscuitsDetail')}</span>
              <small>{t('welcome.open')}</small>
            </span>
            <BiscuitsIllustration />
          </button>
          <button type="button" class="example-card white" onClick={() => onExample('denimJacket')}>
            <span class="example-text">
              <strong>{t('welcome.jacket')}</strong>
              <span>{t('welcome.jacketDetail')}</span>
              <small>{t('welcome.open')}</small>
            </span>
            <JacketIllustration />
          </button>
        </div>
      </section>

      <section class="card needs-card reveal" aria-labelledby="needs-title">
        <h2 id="needs-title">{t('welcome.needs')}</h2>
        <ul class="needs">
          <li>{t('welcome.need1')}</li>
          <li>{t('welcome.need2')}</li>
          <li>{t('welcome.need3')}</li>
        </ul>
        <p class="notice notice-info">{t('welcome.privacy')}</p>
      </section>
    </div>
  )
}
