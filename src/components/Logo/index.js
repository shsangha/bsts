import React, { Component } from "react"
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Object3D,
  Box3,
  Vector3,
  Plane,
  Raycaster,
  Vector2,
  EquirectangularReflectionMapping,
  sRGBEncoding,
  LinearFilter,
  LinearMipMapLinearFilter,
  TextureLoader,
} from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import tex from "./env.jpg"

let mounted = true

class Logo extends Component {
  componentDidMount() {
    init()
  }

  componentWillUnmount() {
    mounted = false
  }

  render() {
    return (
      <div
        style={{
          overflow: "hidden",
          position: "fixed",
          left: "0",
          right: "0",
          bottom: "0",
          top: "0",
        }}
        id="logo"
      />
    )
  }
}

let container, camera, scene, renderer, loader, envMap, gltf, box

const plane = new Plane(new Vector3(0, 0, 1), 0.6)
const pointOfIntersection = new Vector3()
const raycaster = new Raycaster()
const mouse = new Vector2()

const Model = {
  name: "BSTS Logo",
  url: "./models/gltf/BoomBox/%s/logo.glb",

  extensions: ["glTF", "glTF-pbrSpecularGlossiness", "glTF-Binary", "glTF-dds"],
  addEnvMap: true,
}

function init() {
  container = document.getElementById("logo")

  renderer = new WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.gammaOutput = true
  renderer.physicallyCorrectLights = true
  container.appendChild(renderer.domElement)

  window.addEventListener("resize", onWindowResize, false)

  new TextureLoader().load(tex, texture => {
    texture.mapping = EquirectangularReflectionMapping
    texture.magFilter = LinearFilter
    texture.minFilter = LinearMipMapLinearFilter
    texture.encoding = sRGBEncoding

    envMap = texture

    initScene(Model)
    animate()
  })
}

function initScene(sceneInfo) {
  scene = new Scene()

  camera = new PerspectiveCamera(
    85,
    container.offsetWidth / container.offsetHeight,
    0.001,
    10000
  )

  scene.add(camera)

  loader = new GLTFLoader()

  loader.load(
    "/img/logo.glb",
    data => {
      gltf = data

      const object = gltf.scene

      if (sceneInfo.addEnvMap) {
        object.traverse(node => {
          if (
            node.material &&
            (node.material.isMeshStandardMaterial ||
              (node.material.isShaderMaterial &&
                node.material.envMap !== undefined))
          ) {
            node.material.envMap = envMap
            node.material.envMapIntensity = 2
          }
        })
      }

      const pivot = new Object3D()
      pivot.add(object)

      scene.add(pivot)

      container.addEventListener("mousemove", onMouseMove, false)
      container.addEventListener("touchmove", onTouchMove, false)

      const mroot = object
      const bbox = new Box3().setFromObject(mroot)
      const cent = bbox.getCenter(new Vector3())
      const size = bbox.getSize(new Vector3())

      const maxAxis = Math.max(size.x, size.y, size.z)
      mroot.scale.multiplyScalar(1.0 / maxAxis)
      bbox.setFromObject(mroot)
      bbox.getCenter(cent)
      bbox.getSize(size)
      mroot.position.y -= size.y * 0.5

      mroot.position.copy(cent).multiplyScalar(-1)
      mroot.position.z -= 2.5

      box = object

      onWindowResize()
    },
    undefined,
    error => {
      console.error(error)
    }
  )
}

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
  raycaster.setFromCamera(mouse, camera)
  raycaster.ray.intersectPlane(plane, pointOfIntersection)
  box.lookAt(pointOfIntersection)
}

function onTouchMove(event) {
  event.preventDefault()
  const e = event.touches[0]

  onMouseMove(e)
}

function onWindowResize() {
  camera.aspect = container.offsetWidth / container.offsetHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate() {
  if (mounted) {
    requestAnimationFrame(animate)
    camera.updateProjectionMatrix()

    render()
  }
}

function render() {
  renderer.render(scene, camera)
}

export default Logo
