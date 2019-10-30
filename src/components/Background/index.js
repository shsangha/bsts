/* eslint-disable dot-notation */
/* eslint-disable no-multi-assign */
import React, { Component } from "react"
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  CubeCamera,
  DirectionalLight,
  PlaneBufferGeometry,
  RepeatWrapping,
  LinearMipMapLinearFilter,
  TextureLoader,
} from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { Water } from "three/examples/jsm/objects/Water"
import { Sky } from "three/examples/jsm/objects/Sky"

import tex from "./waternormals.jpg"

let container, camera, scene, renderer, light, controls, water

let mounted = true

class Index extends Component {
  componentDidMount() {
    init()
    animate()
  }

  componentWillUnmount() {
    mounted = false
  }

  render() {
    return <div style={{ overflow: "hidden" }} id="bg" />
  }
}

function init() {
  container = document.getElementById("bg")

  renderer = new WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.appendChild(renderer.domElement)

  scene = new Scene()

  camera = new PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    1,
    20000
  )

  light = new DirectionalLight(0xffffff, 0)
  scene.add(light)

  const waterGeometry = new PlaneBufferGeometry(100, 100)

  water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new TextureLoader().load(tex, texture => {
      texture.wrapS = texture.wrapT = RepeatWrapping
    }),
    alpha: 1.0,
    sunDirection: light.position.clone().normalize(),
    sunColor: 0xffffff,
    waterColor: 0x0f0f0f,
    distortionScale: 3.7,
    fog: scene.fog !== undefined,
  })

  water.rotation.x = -Math.PI / 2

  scene.add(water)

  const sky = new Sky()

  const parameters = {
    distance: 400,
    inclination: 0.39,
    azimuth: 0.05,
  }

  const cubeCamera = new CubeCamera(0.1, 1, 512)
  cubeCamera.renderTarget.texture.generateMipmaps = true
  cubeCamera.renderTarget.texture.minFilter = LinearMipMapLinearFilter

  function updateSun() {
    const theta = Math.PI * (parameters.inclination - 0.5)
    const phi = 2 * Math.PI * (parameters.azimuth - 0.5)

    light.position.x = parameters.distance * Math.cos(phi)
    light.position.y = parameters.distance * Math.sin(phi) * Math.sin(theta)
    light.position.z = parameters.distance * Math.sin(phi) * Math.cos(theta)

    sky.material.uniforms["sunPosition"].value = light.position.copy(
      light.position
    )
    water.material.uniforms["sunDirection"].value
      .copy(light.position)
      .normalize()

    cubeCamera.update(renderer, sky)
  }

  updateSun()

  //

  controls = new OrbitControls(camera, renderer.domElement)
  controls.maxPolarAngle = Math.PI * 0.495
  controls.enableZoom = false

  controls.enableRotate = false
  controls.target.set(0, 0, 0)
  controls.minDistance = 40.0
  controls.maxDistance = 200.0
  controls.update()

  //

  window.addEventListener("resize", onWindowResize, false)
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate() {
  if (mounted) {
    requestAnimationFrame(animate)
    render()
  }
}

function render() {
  water.material.uniforms["time"].value += 1.0 / 60.0

  renderer.render(scene, camera)
}

export default Index
