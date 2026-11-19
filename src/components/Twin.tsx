/**
 * La scena three.js del gemello digitale. three.js si carica a parte, solo quando la scena serve;
 * se il browser non ha WebGL resta il riquadro con la descrizione testuale.
 */
import { useEffect, useRef, useState } from 'preact/hooks'
import { t, useLang } from '../i18n'
import { reducedMotion } from '../motion'
import type { Layer, TwinScene } from '../scene/twin'

export function Twin({ focus }: { focus: Layer | 0 }) {
  const box = useRef<HTMLDivElement>(null)
  const scene = useRef<TwinScene | null>(null)
  const [failed, setFailed] = useState(false)
  const lang = useLang()

  useEffect(() => {
    let gone = false
    import('../scene/twin')
      .then(({ TwinScene }) => {
        if (gone || !box.current) return
        scene.current = new TwinScene(box.current, reducedMotion(), {
          links: [t('twin.link1'), t('twin.link2'), t('twin.link3')],
          read: t('twin.read'),
          name: t('twin.name'),
          source: t('twin.source'),
        })
        scene.current.focus(focus, true)
      })
      .catch(() => setFailed(true))
    return () => {
      gone = true
      scene.current?.dispose()
      scene.current = null
    }
  }, [lang])

  useEffect(() => scene.current?.focus(focus), [focus])

  return (
    <div class={`twin ${failed ? 'failed' : ''}`} ref={box} role="img" aria-label={t('twin.label')}>
      {failed && <p class="hint">{t('twin.label')}</p>}
    </div>
  )
}
