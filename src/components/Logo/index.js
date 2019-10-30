import React, { Component } from "react"
import {
  WebGLRenderer,
  WebGLRenderTargetCube,
  UnsignedByteType,
  Scene,
  PerspectiveCamera,
  Object3D,
  Box3,
  Vector3,
  Plane,
  Raycaster,
  Vector2,
} from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader"
import { PMREMGenerator } from "three/examples/jsm/pmrem/PMREMGenerator"
import { PMREMCubeUVPacker } from "three/examples/jsm/pmrem/PMREMCubeUVPacker"

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

let container, camera, scene, renderer, loader, background, envMap, gltf, box

const plane = new Plane(new Vector3(0, 0, 1), 0.8)
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

  new RGBELoader()
    .setDataType(UnsignedByteType)
    .setPath("img/")
    .load("venice_sunset_2k.hdr", texture => {
      const options = {
        minFilter: texture.minFilter,
        magFilter: texture.magFilter,
      }

      background = new WebGLRenderTargetCube(
        1024,
        1024,
        options
      ).fromEquirectangularTexture(renderer, texture)

      const pmremGenerator = new PMREMGenerator(background.texture)
      pmremGenerator.update(renderer)

      const pmremCubeUVPacker = new PMREMCubeUVPacker(pmremGenerator.cubeLods)
      pmremCubeUVPacker.update(renderer)

      envMap = pmremCubeUVPacker.CubeUVRenderTarget.texture

      pmremGenerator.dispose()
      pmremCubeUVPacker.dispose()

      //

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
    "img/logo.glb",
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
            node.material.envMapIntensity = 1
          }
        })
      }

      const pivot = new Object3D(10, 1, 100)
      pivot.add(object)

      scene.add(pivot)

      //			scene.add(object);

      box = object

      container.addEventListener("mousemove", onMouseMove, false)

      const mroot = object
      const bbox = new Box3().setFromObject(mroot)
      const cent = bbox.getCenter(new Vector3())
      const size = bbox.getSize(new Vector3())

      //Rescale the object to normalized space
      const maxAxis = Math.max(size.x, size.y, size.z)
      mroot.scale.multiplyScalar(1.0 / maxAxis)
      bbox.setFromObject(mroot)
      bbox.getCenter(cent)
      bbox.getSize(size)
      mroot.position.y -= size.y * 0.5

      mroot.position.copy(cent).multiplyScalar(-1)
      mroot.position.z -= 2.5

      onWindowResize()
    },
    undefined,
    error => {
      // eslint-disable-next-line no-console
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
