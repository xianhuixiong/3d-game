
import * as THREE from 'three'
import { EffectComposer, RenderPass, EffectPass, BloomEffect, SMAAEffect, ToneMappingEffect, VignetteEffect, OutlineEffect, SSAOEffect, MotionBlurEffect } from 'postprocessing'
import { useUI } from '../../app/store/ui'

export interface GameAPI {
  dispose: () => void
}

export function startGame(container: HTMLDivElement): GameAPI {
  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  container.appendChild(renderer.domElement)

  // Scene & Camera
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x05070a)
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth/container.clientHeight, 0.1, 1000)
  camera.position.set(0, 1.6, 5)

  // Lights
  const dir = new THREE.DirectionalLight(0xffffff, 2.0); dir.position.set(5,10,5)
  dir.castShadow = true
  scene.add(dir)
  scene.add(new THREE.AmbientLight(0x4060a0, 0.5))

  // Floor
  const floorGeo = new THREE.PlaneGeometry(60,60)
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x0f1220, metalness: 0.2, roughness: 0.8 })
  const floor = new THREE.Mesh(floorGeo, floorMat); floor.rotation.x = -Math.PI/2; floor.receiveShadow = true
  scene.add(floor)

  // Simple arena blocks
  const boxMat = new THREE.MeshStandardMaterial({ color: 0x172033, emissive: new THREE.Color(0x0a2233), emissiveIntensity: 0.3 })
  for(let i=0;i<14;i++){
    const h = 0.6 + Math.random()*2.0
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.2, h, 1.2), boxMat)
    box.position.set((Math.random()-0.5)*20, h/2, (Math.random()-0.5)*20)
    box.castShadow = true; box.receiveShadow = true
    scene.add(box)
  }

  // Player "gun" reticle
  const cross = new THREE.Mesh(new THREE.RingGeometry(0.004,0.008,32), new THREE.MeshBasicMaterial({ color: 0x8be9ff }))
  cross.position.z = -0.8
  camera.add(cross)
  scene.add(camera)

  // Target dummy (AI placeholder)
  const dummyMat = new THREE.MeshStandardMaterial({ color: 0xff7a00, emissive: 0x220800, emissiveIntensity: 0.2 })
  const dummy = new THREE.Mesh(new THREE.CapsuleGeometry(0.35,1.0,8,16), dummyMat)
  dummy.position.set(0,1.0,-6)
  dummy.castShadow = true
  scene.add(dummy)

  // Postprocessing
  const composer = new EffectComposer(renderer)
  const renderPass = new RenderPass(scene, camera)
  composer.addPass(renderPass)

  const ui = useUI.getState()
  const bloom = new BloomEffect({ intensity: ui.bloom ? 0.9 : 0.0, luminanceThreshold: 0.6, luminanceSmoothing: 0.2 })
  const ssao = new SSAOEffect(camera, undefined, { samples: 8, rings: 4, distanceThreshold: 0.2, distanceFalloff: 0.4, rangeThreshold: 0.2, rangeFalloff: 0.2 })
  const smaa = new SMAAEffect()
  const tone = new ToneMappingEffect({ mode: 1 })
  const vignette = new VignetteEffect({ eskil: false, offset: 0.1, darkness: 0.5 })
  const motion = new MotionBlurEffect({ jitter: 0.0, maxVelocity: 0.5, samples: ui.motionBlur? 8: 0 })
  const outline = new OutlineEffect(scene, camera, {
    edgeStrength: ui.outline? 2.0 : 0.0,
    blur: false,
    xRay: false,
    visibleEdgeColor: 0x25D0FF,
    hiddenEdgeColor: 0x000000
  })

  const effects = [tone, smaa, bloom, vignette]
  if(ui.ssao) effects.splice(1,0, ssao)
  if(ui.motionBlur) effects.push(motion)
  if(ui.outline) effects.push(outline)

  const effectPass = new EffectPass(camera, ...effects)
  composer.addPass(effectPass)

  // Pointer lock & input
  const keys: Record<string, boolean> = {}
  let pointerLocked = false
  let yaw = 0, pitch = 0
  let sensitivity = ui.mouseSensitivity

  const onPointerMove = (e: MouseEvent) => {
    if(!pointerLocked) return
    yaw -= e.movementX * sensitivity
    pitch -= e.movementY * sensitivity
    pitch = Math.max(-Math.PI/2+0.01, Math.min(Math.PI/2-0.01, pitch))
  }

  const requestPL = () => {
    container.requestPointerLock()
  }

  const onPLChange = () => { pointerLocked = document.pointerLockElement === container }
  const onKey = (e: KeyboardEvent) => { keys[e.key.toLowerCase()] = e.type === 'keydown' }

  container.addEventListener('click', requestPL)
  document.addEventListener('pointerlockchange', onPLChange)
  document.addEventListener('mousemove', onPointerMove)
  document.addEventListener('keydown', onKey)
  document.addEventListener('keyup', onKey)

  // Resize
  const onResize = () => {
    const w = container.clientWidth, h = container.clientHeight
    renderer.setSize(w,h)
    composer.setSize(w,h)
    camera.aspect = w/h
    camera.updateProjectionMatrix()
  }
  window.addEventListener('resize', onResize)

  // Gameplay vars
  const playerVel = new THREE.Vector3()
  const camDir = new THREE.Vector3()
  const up = new THREE.Vector3(0,1,0)
  let grounded = true
  let stamina = 1.0
  const bullets: THREE.Mesh[] = []
  const bulletGeo = new THREE.SphereGeometry(0.03, 8, 8)
  const bulletMat = new THREE.MeshBasicMaterial({ color: 0x25D0FF })

  function fire(){
    // spawn a bullet moving forward from camera
    const b = new THREE.Mesh(bulletGeo, bulletMat)
    b.position.copy(camera.position).add(camDir.clone().multiplyScalar(0.6))
    ;(b as any).vel = camDir.clone().multiplyScalar(0.5)
    bullets.push(b); scene.add(b)
    // small kick
    camera.position.add(camDir.clone().multiplyScalar(-0.02))
  }

  document.addEventListener('mousedown', (e)=>{ if(e.button===0 && pointerLocked) fire() })

  // Simple AI: dummy strafes and moves towards player slowly
  let t = 0

  // Raycaster for hit detection
  const ray = new THREE.Raycaster()

  // Loop
  let raf = 0
  const clock = new THREE.Clock()
  function tick(){
    const dt = Math.min(0.033, clock.getDelta())
    t += dt

    // Camera orientation
    const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'))
    camera.quaternion.copy(quat)
    camDir.set(0,0,-1).applyQuaternion(camera.quaternion)

    // Movement
    const speed = (keys['shift'] && stamina>0.1)? 8 : 4
    const right = new THREE.Vector3().crossVectors(camDir, up).normalize()
    const forward = new THREE.Vector3(camDir.x, 0, camDir.z).normalize()
    playerVel.set(0,0,0)
    if(keys['w']) playerVel.add(forward)
    if(keys['s']) playerVel.add(forward.clone().multiplyScalar(-1))
    if(keys['a']) playerVel.add(right.clone().multiplyScalar(-1))
    if(keys['d']) playerVel.add(right)
    playerVel.normalize().multiplyScalar(speed*dt)
    camera.position.add(playerVel)
    // stamina
    stamina += (keys['shift'] && playerVel.lengthSq()>0)? -dt*0.4 : dt*0.25
    stamina = Math.max(0, Math.min(1, stamina))

    // Dummy AI move
    const toPlayer = new THREE.Vector3().subVectors(camera.position, dummy.position)
    const dist = toPlayer.length()
    const dirToPlayer = toPlayer.normalize()
    const tangent = new THREE.Vector3(-dirToPlayer.z, 0, dirToPlayer.x)
    dummy.position.add(dirToPlayer.multiplyScalar( (dist>4? 1.2 : -0.6) * dt ))
    dummy.position.add(tangent.multiplyScalar(Math.sin(t*1.8)*0.8*dt))

    // Bullet updates + hit detection
    for(let i=bullets.length-1;i>=0;i--){
      const b = bullets[i]
      b.position.add((b as any).vel)
      // hit dummy?
      if(b.position.distanceTo(dummy.position) < 0.6){
        scene.remove(b); bullets.splice(i,1)
        // flash
        ;(dummy.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.5
        setTimeout(()=>{ (dummy.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2 }, 80)
        // knockback
        dummy.position.add(dirToPlayer.clone().multiplyScalar(0.5))
      } else if(b.position.distanceTo(camera.position)>60){
        scene.remove(b); bullets.splice(i,1)
      }
    }

    // Animate crosshair subtle
    cross.scale.setScalar(1 + Math.sin(t*4)*0.03)

    composer.render()
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return {
    dispose(){
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      container.removeEventListener('click', requestPL)
      document.removeEventListener('pointerlockchange', onPLChange)
      document.removeEventListener('mousemove', onPointerMove)
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('keyup', onKey)
      renderer.dispose()
      container.innerHTML = ''
    }
  }
}

export function stopGame(api: GameAPI){ api.dispose() }
