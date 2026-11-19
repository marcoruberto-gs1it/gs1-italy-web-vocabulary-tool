/**
 * La scena del gemello digitale, in three.js: da sinistra a destra la confezione con il barcode e il QR,
 * il telefono che la scansiona, il resolver con il suo linkset, il JSON-LD con i termini GS1 e lo schermo
 * dove un programma legge quei dati, campo per campo. Ogni livello dello stack GS1 ha un punto della scena:
 * `focus(n)` porta lì la camera e accende l'oggetto.
 *
 * Tutto è disegnato nel codice: geometrie semplici e texture su canvas, nessun modello esterno.
 * I dati mostrati sono quelli dell'esempio di fantasia (Dolce Prova, prefisso 8001234).
 */
import * as THREE from 'three'
import { ean13 } from '../model/barcode'

const C = {
  blue: '#002c6c',
  blue2: '#1d4f9a',
  sky: '#dce6f5',
  bg: '#f6f8fb',
  teal: '#22bcb9',
  tealInk: '#0b7471',
  green: '#00703a',
  ink: '#1f2a37',
  muted: '#5d6670',
  white: '#ffffff',
}

export type Layer = 1 | 2 | 3 | 4 | 5 | 6

/** I testi dentro la scena, nella lingua dell'interfaccia. */
export type SceneText = {
  links: [string, string, string]
  read: string
  name: string
  source: string
}

/** Disegna su un canvas e ne fa una texture nitida. */
function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  draw(g)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

const font = (size: number, bold = false, mono = false) => `${bold ? 'bold ' : ''}${size}px ${mono ? 'Consolas, ui-monospace, monospace' : 'Verdana, Arial, sans-serif'}`

/** Un QR code stilizzato: tre occhi e moduli pseudo-casuali ma stabili. */
function drawQr(g: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const n = 21
  const u = size / n
  g.fillStyle = C.white
  g.fillRect(x - u * 2, y - u * 2, size + u * 4, size + u * 4)
  g.fillStyle = C.ink
  let s = 11
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      s = (s * 9301 + 49297) % 233280
      if (s / 233280 > 0.52) g.fillRect(x + c * u, y + r * u, u, u)
    }
  for (const [ex, ey] of [
    [0, 0],
    [n - 7, 0],
    [0, n - 7],
  ]) {
    g.fillStyle = C.white
    g.fillRect(x + ex * u - u, y + ey * u - u, u * 9, u * 9)
    g.fillStyle = C.ink
    g.fillRect(x + ex * u, y + ey * u, u * 7, u * 7)
    g.fillStyle = C.white
    g.fillRect(x + (ex + 1) * u, y + (ey + 1) * u, u * 5, u * 5)
    g.fillStyle = C.ink
    g.fillRect(x + (ex + 2) * u, y + (ey + 2) * u, u * 3, u * 3)
  }
}

function drawBarcode(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, digits: string) {
  const m = ean13(digits)!
  const u = w / 95
  g.fillStyle = C.white
  g.fillRect(x - 12, y - 8, w + 24, h + 34)
  g.fillStyle = C.ink
  for (let i = 0; i < 95; i++) if (m[i] === '1') g.fillRect(x + i * u, y, u + 0.4, h)
  g.font = font(18, false, true)
  g.textAlign = 'center'
  g.fillText(`${digits[0]}  ${digits.slice(1, 7)}  ${digits.slice(7)}`, x + w / 2, y + h + 20)
}

/** Fronte della confezione: marca, nome, peso, QR del Digital Link e barcode EAN-13. */
const packFront = () =>
  canvasTexture(512, 640, (g) => {
    g.fillStyle = C.white
    g.fillRect(0, 0, 512, 640)
    g.fillStyle = C.blue
    g.fillRect(0, 0, 512, 120)
    g.fillStyle = C.white
    g.font = font(44, true)
    g.textAlign = 'center'
    g.fillText('Dolce Prova', 256, 78)
    g.fillStyle = C.sky
    g.beginPath()
    g.arc(256, 250, 96, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = C.blue2
    for (const [cx, cy] of [
      [220, 220],
      [290, 236],
      [246, 292],
    ]) {
      g.beginPath()
      g.arc(cx, cy, 14, 0, Math.PI * 2)
      g.fill()
    }
    g.fillStyle = C.blue
    g.font = font(36, true)
    g.fillText('Biscotti al cacao', 256, 404)
    g.fillStyle = C.ink
    g.font = font(30, true)
    g.textAlign = 'left'
    g.fillText('250 g', 40, 470)
    drawQr(g, 40, 500, 110)
    drawBarcode(g, 230, 500, 240, 90, '8001234000011')
  })

/** Lo schermo del telefono: la confezione inquadrata e il Digital Link letto dal QR. */
const phoneScreen = () =>
  canvasTexture(320, 640, (g) => {
    g.fillStyle = '#0f1a2e'
    g.fillRect(0, 0, 320, 640)
    g.strokeStyle = C.teal
    g.lineWidth = 6
    const k = 36
    for (const [x, y, dx, dy] of [
      [50, 150, 1, 1],
      [270, 150, -1, 1],
      [50, 390, 1, -1],
      [270, 390, -1, -1],
    ]) {
      g.beginPath()
      g.moveTo(x, y + dy * k)
      g.lineTo(x, y)
      g.lineTo(x + dx * k, y)
      g.stroke()
    }
    drawQr(g, 100, 210, 120)
    g.fillStyle = C.white
    g.fillRect(16, 450, 288, 120)
    g.fillStyle = C.muted
    g.font = font(18)
    g.textAlign = 'left'
    g.fillText('GS1 Digital Link', 32, 484)
    g.fillStyle = C.tealInk
    g.font = font(19, true, true)
    g.fillText('id.gs1.org/01/', 32, 516)
    g.fillText('08001234000011', 32, 546)
  })

/** Il pannello JSON-LD: le righe del markup, termini GS1 in blu, valori in teal. */
const jsonPanel = () =>
  canvasTexture(560, 640, (g) => {
    g.fillStyle = 'rgba(255,255,255,0.92)'
    g.fillRect(0, 0, 560, 640)
    g.strokeStyle = C.teal
    g.lineWidth = 6
    g.strokeRect(3, 3, 554, 634)
    const lines: [string, string, string][] = [
      ['{', '', ''],
      ['  "@context": ', '{ "gs1": … }', ''],
      ['  "@id": ', '"https://id.gs1.org/01/', ''],
      ['', '    08001234000011"', ''],
      ['  "@type": ', '"gs1:Product"', ''],
      ['  "gs1:gtin": ', '"08001234000011"', ''],
      ['  "gs1:productName": ', '"Biscotti al cacao"', ''],
      ['  "gs1:brand": ', '"Dolce Prova"', ''],
      ['  "gs1:netContent": ', '250 GRM', ''],
      ['  "gs1:hasAllergen": ', 'MILK, EGGS …', ''],
      ['  "gs1:pip": ', '"https://…"', ''],
      ['  "gs1:brandOwner": ', '"…/417/…"', ''],
      ['}', '', ''],
    ]
    g.font = font(22, false, true)
    lines.forEach(([k, v], i) => {
      const y = 60 + i * 44
      g.fillStyle = C.blue
      g.fillText(k, 24, y)
      g.fillStyle = C.tealInk
      g.fillText(v, 24 + g.measureText(k).width, y)
    })
  })

/**
 * Lo schermo: a sinistra la pagina come la vede una persona, a destra gli stessi dati come li legge
 * un programma, ognuno con il suo termine GS1 e la spunta di dato riconosciuto.
 */
const screenTexture = (tx: SceneText) =>
  canvasTexture(800, 520, (g) => {
    g.fillStyle = C.white
    g.fillRect(0, 0, 800, 520)
    g.fillStyle = '#eef1f5'
    g.fillRect(0, 0, 800, 48)
    for (const [i, x] of [24, 44, 64].entries()) {
      g.fillStyle = i === 0 ? '#c8ced6' : '#d8dde4'
      g.beginPath()
      g.arc(x, 24, 7, 0, Math.PI * 2)
      g.fill()
    }
    // La pagina per le persone
    g.fillStyle = C.sky
    g.fillRect(28, 76, 220, 180)
    g.fillStyle = C.blue
    g.fillRect(88, 106, 100, 120)
    g.fillStyle = C.blue2
    g.font = font(22, true)
    g.fillText(tx.name, 28, 296)
    g.fillStyle = '#d8dde4'
    for (const [y, w] of [
      [322, 220],
      [346, 190],
      [370, 205],
      [394, 150],
    ])
      g.fillRect(28, y, w, 10)
    // Gli stessi dati per le macchine
    g.fillStyle = '#e6f6f6'
    g.fillRect(290, 76, 482, 412)
    g.fillStyle = C.tealInk
    g.fillRect(290, 76, 6, 412)
    g.font = font(19, true)
    g.fillText(tx.read, 316, 112)
    const rows: [string, string][] = [
      ['gs1:gtin', '08001234000011'],
      ['gs1:productName', tx.name],
      ['gs1:netContent', '250 GRM'],
      ['gs1:hasAllergen', 'MILK, EGGS'],
      ['gs1:countryOfOrigin', 'IT'],
      ['gs1:brandOwner', '/417/8001234000004'],
    ]
    rows.forEach(([k, v], i) => {
      const y = 158 + i * 50
      g.fillStyle = C.blue
      g.font = font(17, false, true)
      g.fillText(k, 316, y)
      g.fillStyle = C.ink
      g.font = font(17, true, true)
      g.fillText(v, 316, y + 22)
      g.strokeStyle = C.green
      g.lineWidth = 4
      g.beginPath()
      g.moveTo(732, y + 2)
      g.lineTo(740, y + 10)
      g.lineTo(754, y - 6)
      g.stroke()
    })
    g.fillStyle = C.muted
    g.font = font(15)
    g.fillText(tx.source, 316, 476)
  })

/** Un cartellino del linkset con il suo link type. */
const linkCard = (term: string, label: string) =>
  canvasTexture(360, 120, (g) => {
    g.fillStyle = C.white
    g.fillRect(0, 0, 360, 120)
    g.strokeStyle = C.blue2
    g.lineWidth = 4
    g.strokeRect(2, 2, 356, 116)
    g.fillStyle = C.tealInk
    g.font = font(28, true, true)
    g.fillText(term, 20, 50)
    g.fillStyle = C.muted
    g.font = font(22)
    g.fillText(label, 20, 92)
  })

/** Un'etichetta numerata che galleggia sopra un oggetto della scena. */
const badge = (n: number) =>
  canvasTexture(128, 128, (g) => {
    g.fillStyle = C.blue
    g.beginPath()
    g.arc(64, 64, 56, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = C.white
    g.font = font(60, true)
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillText(String(n), 64, 68)
  })

type Stop = { position: THREE.Vector3; target: THREE.Vector3 }

export class TwinScene {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
  private target = new THREE.Vector3(0, 1.1, 0)
  private stops = new Map<Layer | 0, Stop>()
  private pulses: { mesh: THREE.Mesh; curve: THREE.Curve<THREE.Vector3>; offset: number; speed: number }[] = []
  private floaters: { obj: THREE.Object3D; base: number; phase: number }[] = []
  private badges = new Map<Layer, THREE.Sprite>()
  private disposables: { dispose: () => void }[] = []
  private frame = 0
  private running = false
  private clock = new THREE.Clock()
  private observer: ResizeObserver
  private visible: IntersectionObserver
  private onScreen = true
  /** Movimento ridotto: niente impulsi né oggetti che galleggiano; la camera salta invece di muoversi. */
  readonly still: boolean
  private tween: { from: THREE.Vector3; to: THREE.Vector3; fromT: THREE.Vector3; toT: THREE.Vector3; t: number } | null = null

  constructor(
    private host: HTMLElement,
    still: boolean,
    private text: SceneText,
  ) {
    this.still = still
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    host.appendChild(this.renderer.domElement)
    this.renderer.domElement.setAttribute('aria-hidden', 'true')
    this.build()
    this.observer = new ResizeObserver(() => this.resize())
    this.observer.observe(host)
    this.visible = new IntersectionObserver(([e]) => {
      this.onScreen = e.isIntersecting
      if (this.onScreen) this.loop()
    })
    this.visible.observe(host)
    this.resize()
    this.focus(0, true)
    this.loop()
  }

  private keep<T extends { dispose: () => void }>(x: T) {
    this.disposables.push(x)
    return x
  }

  private mat(color: string, extra: THREE.MeshStandardMaterialParameters = {}) {
    return this.keep(new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.05, ...extra }))
  }

  private plane(w: number, h: number, map: THREE.Texture, transparent = false) {
    const m = this.keep(new THREE.MeshBasicMaterial({ map: this.keep(map), transparent, side: THREE.DoubleSide, toneMapped: false }))
    return new THREE.Mesh(this.keep(new THREE.PlaneGeometry(w, h)), m)
  }

  private add<T extends THREE.Object3D>(o: T, parent: THREE.Object3D = this.scene) {
    parent.add(o)
    o.traverse((x) => {
      if ((x as THREE.Mesh).isMesh) {
        x.castShadow = true
        x.receiveShadow = true
      }
    })
    return o
  }

  private build() {
    const s = this.scene
    s.background = null
    s.add(new THREE.HemisphereLight(0xffffff, 0xdce6f5, 1.6))
    const sun = new THREE.DirectionalLight(0xffffff, 1.8)
    sun.position.set(-3, 6, 5)
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    sun.shadow.camera.left = -6
    sun.shadow.camera.right = 6
    sun.shadow.camera.top = 4
    sun.shadow.camera.bottom = -2
    sun.shadow.radius = 4
    s.add(sun)

    // Il tavolo
    const table = new THREE.Mesh(this.keep(new THREE.BoxGeometry(12, 0.12, 4.2)), this.mat('#e9edf2', { roughness: 0.9 }))
    table.position.set(0, -0.06, 0)
    table.receiveShadow = true
    s.add(table)

    // 1-2 La confezione: barcode e QR del Digital Link sul fronte
    const pack = new THREE.Group()
    const side = this.mat(C.sky)
    const front = this.keep(new THREE.MeshStandardMaterial({ map: this.keep(packFront()), roughness: 0.6 }))
    const top = this.mat(C.blue)
    const box = new THREE.Mesh(this.keep(new THREE.BoxGeometry(1.1, 1.4, 0.36)), [side, side, top, side, front, side])
    box.position.y = 0.7
    this.add(box, pack)
    pack.position.set(-3.9, 0, 0.3)
    pack.rotation.y = 0.32
    s.add(pack)

    // 2 Il telefono che scansiona
    const phone = new THREE.Group()
    const body = new THREE.Mesh(this.keep(new THREE.BoxGeometry(0.62, 1.22, 0.06)), this.mat('#1b2433', { roughness: 0.35 }))
    this.add(body, phone)
    const screen = this.plane(0.56, 1.12, phoneScreen())
    screen.position.z = 0.032
    phone.add(screen)
    const stand = new THREE.Mesh(this.keep(new THREE.BoxGeometry(0.5, 0.05, 0.3)), this.mat('#c8ced6'))
    stand.position.set(0, -0.64, -0.08)
    this.add(stand, phone)
    phone.position.set(-2.35, 0.7, 0.55)
    phone.rotation.set(-0.08, 0.18, 0)
    s.add(phone)

    // 3 Il resolver: un nodo con un anello, sopra il tavolo
    const resolver = new THREE.Group()
    const core = new THREE.Mesh(this.keep(new THREE.IcosahedronGeometry(0.22, 1)), this.mat(C.blue, { flatShading: true }))
    const ring = new THREE.Mesh(this.keep(new THREE.TorusGeometry(0.36, 0.022, 12, 64)), this.mat(C.teal))
    ring.rotation.x = Math.PI / 2.4
    this.add(core, resolver)
    this.add(ring, resolver)
    resolver.position.set(-0.75, 2.05, 0)
    s.add(resolver)
    this.floaters.push({ obj: resolver, base: resolver.position.y, phase: 0 })

    // 4 Il linkset: tre link con il loro link type
    const linkset = new THREE.Group()
    const terms = ['gs1:pip', 'gs1:instructions', 'gs1:sustainabilityInfo']
    const cards = terms.map((term, i): [string, string] => [term, this.text.links[i]])
    cards.forEach(([term, label], i) => {
      const card = this.plane(0.9, 0.3, linkCard(term, label))
      card.position.set(0, 0.38 - i * 0.38, 0)
      linkset.add(card)
    })
    linkset.position.set(-0.6, 3.05, -0.4)
    linkset.rotation.y = 0.1
    s.add(linkset)
    this.floaters.push({ obj: linkset, base: linkset.position.y, phase: 1.2 })

    // 5 Il JSON-LD con i termini del GS1 Web Vocabulary, su una base luminosa
    const holo = new THREE.Group()
    const panel = this.plane(1.25, 1.43, jsonPanel(), true)
    panel.position.y = 1.0
    holo.add(panel)
    const base = new THREE.Mesh(this.keep(new THREE.BoxGeometry(1.0, 0.06, 0.5)), this.mat('#c8ced6'))
    base.position.y = 0.03
    this.add(base, holo)
    const light = new THREE.Mesh(this.keep(new THREE.PlaneGeometry(0.9, 0.36)), this.keep(new THREE.MeshBasicMaterial({ color: C.teal, transparent: true, opacity: 0.5 })))
    light.rotation.x = -Math.PI / 2
    light.position.y = 0.065
    holo.add(light)
    holo.position.set(0.85, 0, 0.2)
    holo.rotation.y = -0.12
    s.add(holo)
    this.floaters.push({ obj: panel, base: panel.position.y, phase: 2.1 })

    // 6 Lo schermo: i dati letti da un programma
    const laptop = new THREE.Group()
    const lid = new THREE.Mesh(this.keep(new THREE.BoxGeometry(1.92, 1.26, 0.05)), this.mat('#2a3445', { roughness: 0.4 }))
    lid.position.set(0, 0.72, -0.3)
    lid.rotation.x = -0.12
    this.add(lid, laptop)
    const display = this.plane(1.8, 1.17, screenTexture(this.text))
    display.position.set(0, 0.72, -0.27)
    display.rotation.x = -0.12
    laptop.add(display)
    const keyboard = new THREE.Mesh(this.keep(new THREE.BoxGeometry(1.92, 0.05, 1.1)), this.mat('#c8ced6', { metalness: 0.3 }))
    keyboard.position.set(0, 0.03, 0.27)
    this.add(keyboard, laptop)
    laptop.position.set(3.35, 0, -0.1)
    laptop.rotation.y = -0.38
    s.add(laptop)

    // I collegamenti: dal QR al telefono, al resolver, al linkset, al JSON-LD, allo schermo
    const curves = [
      [new THREE.Vector3(-3.6, 0.65, 0.5), new THREE.Vector3(-3.0, 1.0, 0.9), new THREE.Vector3(-2.45, 0.75, 0.6)],
      [new THREE.Vector3(-2.3, 1.3, 0.55), new THREE.Vector3(-1.7, 2.2, 0.4), new THREE.Vector3(-0.98, 2.05, 0.05)],
      [new THREE.Vector3(-0.6, 2.25, 0), new THREE.Vector3(-0.62, 2.55, -0.2), new THREE.Vector3(-0.6, 2.7, -0.4)],
      [new THREE.Vector3(-0.5, 1.9, 0), new THREE.Vector3(0.2, 1.9, 0.3), new THREE.Vector3(0.55, 1.6, 0.25)],
      [new THREE.Vector3(1.48, 1.2, 0.2), new THREE.Vector3(2.0, 1.5, 0.2), new THREE.Vector3(2.55, 1.0, 0.1)],
    ].map((p) => new THREE.CatmullRomCurve3(p))
    const lineMat = this.keep(new THREE.MeshBasicMaterial({ color: C.blue2, transparent: true, opacity: 0.55 }))
    const pulseMat = this.keep(new THREE.MeshBasicMaterial({ color: C.teal }))
    const pulseGeo = this.keep(new THREE.SphereGeometry(0.035, 12, 12))
    curves.forEach((curve, i) => {
      s.add(new THREE.Mesh(this.keep(new THREE.TubeGeometry(curve, 40, 0.008, 6)), lineMat))
      for (let k = 0; k < 2; k++) {
        const mesh = new THREE.Mesh(pulseGeo, pulseMat)
        mesh.position.copy(curve.getPoint(k * 0.5))
        s.add(mesh)
        this.pulses.push({ mesh, curve, offset: k * 0.5 + i * 0.13, speed: 0.32 })
      }
    })

    // Numeri dello stack sopra ogni oggetto
    const badges: [Layer, THREE.Vector3][] = [
      [1, new THREE.Vector3(-4.25, 1.75, 0.4)],
      [2, new THREE.Vector3(-2.35, 1.55, 0.6)],
      [3, new THREE.Vector3(-1.2, 2.4, 0)],
      [4, new THREE.Vector3(-1.2, 3.55, -0.4)],
      [5, new THREE.Vector3(0.25, 1.95, 0.3)],
      [6, new THREE.Vector3(2.5, 1.55, 0)],
    ]
    for (const [n, p] of badges) {
      const sprite = new THREE.Sprite(this.keep(new THREE.SpriteMaterial({ map: this.keep(badge(n)), depthTest: false, toneMapped: false })))
      sprite.scale.setScalar(0.22)
      sprite.position.copy(p)
      s.add(sprite)
      this.badges.set(n, sprite)
    }

    // Le soste della camera: vista d'insieme e un punto per livello
    const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
    this.stops.set(0, { position: v(0.1, 2.7, 8.2), target: v(-0.15, 1.35, 0) })
    this.stops.set(1, { position: v(-3.0, 1.5, 4.0), target: v(-3.8, 0.75, 0.3) })
    this.stops.set(2, { position: v(-2.4, 1.6, 4.4), target: v(-3.0, 0.8, 0.4) })
    this.stops.set(3, { position: v(-0.3, 2.7, 4.6), target: v(-0.85, 2.1, 0) })
    this.stops.set(4, { position: v(-0.1, 3.1, 4.4), target: v(-0.65, 2.75, -0.3) })
    this.stops.set(5, { position: v(1.6, 1.5, 4.6), target: v(0.85, 1.0, 0.2) })
    this.stops.set(6, { position: v(2.4, 1.5, 4.4), target: v(3.3, 0.75, -0.2) })
  }

  /** Porta la camera sul livello `n` (0 = vista d'insieme); il suo numero si ingrandisce, gli altri si attenuano. */
  focus(n: Layer | 0, jump = false) {
    const stop = this.stops.get(n)!
    for (const [k, sprite] of this.badges) {
      sprite.scale.setScalar(k === n ? 0.3 : 0.22)
      sprite.material.opacity = n === 0 || k === n ? 1 : 0.4
    }
    if (jump || this.still) {
      this.camera.position.copy(stop.position)
      this.target.copy(stop.target)
      this.camera.lookAt(this.target)
      this.tween = null
    } else {
      this.tween = { from: this.camera.position.clone(), to: stop.position, fromT: this.target.clone(), toT: stop.target, t: 0 }
    }
    this.loop()
  }

  private resize() {
    const w = this.host.clientWidth
    const h = this.host.clientHeight
    if (!w || !h) return
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    // Su schermi stretti la camera si allontana, così la scena intera resta in vista.
    this.camera.fov = w / h < 1.5 ? 50 : 32
    this.camera.updateProjectionMatrix()
    this.render()
  }

  private render() {
    this.renderer.render(this.scene, this.camera)
  }

  /** Il ciclo gira solo se la scena è visibile e ha qualcosa da muovere. */
  private loop = () => {
    if (this.running || !this.onScreen) return
    this.running = true
    this.clock.getDelta()
    const tick = () => {
      const dt = Math.min(this.clock.getDelta(), 0.05)
      const time = this.clock.elapsedTime
      if (this.tween) {
        this.tween.t = Math.min(1, this.tween.t + dt / 1.1)
        const e = 1 - Math.pow(1 - this.tween.t, 3)
        this.camera.position.lerpVectors(this.tween.from, this.tween.to, e)
        this.target.lerpVectors(this.tween.fromT, this.tween.toT, e)
        if (this.tween.t >= 1) this.tween = null
      }
      this.camera.lookAt(this.target)
      if (!this.still) {
        for (const p of this.pulses) p.mesh.position.copy(p.curve.getPoint((time * p.speed + p.offset) % 1))
        for (const f of this.floaters) f.obj.position.y = f.base + Math.sin(time * 1.1 + f.phase) * 0.04
      }
      this.render()
      if (!this.onScreen || (this.still && !this.tween)) {
        this.running = false
        return
      }
      this.frame = requestAnimationFrame(tick)
    }
    tick()
  }

  dispose() {
    cancelAnimationFrame(this.frame)
    this.running = false
    this.onScreen = false
    this.observer.disconnect()
    this.visible.disconnect()
    for (const d of this.disposables) d.dispose()
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }
}
