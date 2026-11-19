/**
 * Riproduce un'animazione Lottie una volta. La libreria (build "light", senza espressioni né eval) arriva
 * con un import dinamico, così non pesa sul primo caricamento. Con il movimento ridotto mostra subito
 * l'ultimo fotogramma.
 */
import { useEffect, useRef } from 'preact/hooks'
import { reducedMotion } from '../motion'

type Props = { data: object; size: number; class?: string; delay?: number }

export function Lottie({ data, size, class: cls, delay = 0 }: Props) {
  const box = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    let destroyed = false
    let anim: { destroy: () => void } | undefined
    let timer: ReturnType<typeof setTimeout> | undefined
    import('lottie-web/build/player/lottie_light').then(({ default: lottie }) => {
      if (destroyed || !box.current) return
      const still = reducedMotion()
      const a = lottie.loadAnimation({ container: box.current, renderer: 'svg', loop: false, autoplay: false, animationData: structuredClone(data) })
      anim = a
      a.addEventListener('DOMLoaded', () => {
        if (still) a.goToAndStop(a.totalFrames - 1, true)
        else timer = setTimeout(() => a.play(), delay)
      })
    })
    return () => {
      destroyed = true
      clearTimeout(timer)
      anim?.destroy()
    }
  }, [data])
  return <span ref={box} class={`lottie ${cls ?? ''}`} style={{ width: size, height: size }} aria-hidden="true" />
}
