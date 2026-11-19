/**
 * Riproduce un'animazione Lottie una volta. La libreria (build "light", senza espressioni né eval) arriva
 * con un import dinamico, così non pesa sul primo caricamento. Con `onView` parte quando entra nello
 * schermo, e ripassandoci sopra con il puntatore riparte. Con il movimento ridotto mostra subito
 * l'ultimo fotogramma.
 */
import { useEffect, useRef } from 'preact/hooks'
import { reducedMotion } from '../motion'

type Anim = { play: () => void; goToAndPlay: (f: number, isFrame: boolean) => void; goToAndStop: (f: number, isFrame: boolean) => void; destroy: () => void; totalFrames: number }
/** `loop`: gira di continuo; `stillFrame`: il fotogramma da mostrare con il movimento ridotto (di norma l'ultimo). */
type Props = { data: object; size: number | [number, number]; class?: string; delay?: number; onView?: boolean; loop?: boolean; stillFrame?: number }

export function Lottie({ data, size, class: cls, delay = 0, onView, loop, stillFrame }: Props) {
  const box = useRef<HTMLSpanElement>(null)
  const anim = useRef<Anim | null>(null)
  useEffect(() => {
    let destroyed = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let seen: IntersectionObserver | undefined
    import('lottie-web/build/player/lottie_light').then(({ default: lottie }) => {
      if (destroyed || !box.current) return
      const still = reducedMotion()
      const a = lottie.loadAnimation({ container: box.current, renderer: 'svg', loop: !!loop, autoplay: false, animationData: structuredClone(data) }) as unknown as Anim
      anim.current = a
      ;(a as unknown as { addEventListener: (e: string, f: () => void) => void }).addEventListener('DOMLoaded', () => {
        if (still) return a.goToAndStop(stillFrame ?? a.totalFrames - 1, true)
        const start = () => (timer = setTimeout(() => a.play(), delay))
        if (!onView) return start()
        seen = new IntersectionObserver(([e]) => {
          if (!e.isIntersecting) return
          seen?.disconnect()
          start()
        }, { threshold: 0.6 })
        seen.observe(box.current!)
      })
    })
    return () => {
      destroyed = true
      clearTimeout(timer)
      seen?.disconnect()
      anim.current?.destroy()
      anim.current = null
    }
  }, [data])
  const [w, h] = Array.isArray(size) ? size : [size, size]
  return (
    <span
      ref={box}
      class={`lottie ${cls ?? ''}`}
      style={{ width: w, height: h }}
      aria-hidden="true"
      onMouseEnter={() => {
        if (onView && !loop && !reducedMotion()) anim.current?.goToAndPlay(0, true)
      }}
    />
  )
}
