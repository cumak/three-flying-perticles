import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "lil-gui";
import vertex from "./shader/vertex.glsl";
import fragment from "./shader/fragment.glsl";
import textureImg from "./texture/img.png";
import textureImg2 from "./texture/img-2.png";
import textureImg3 from "./texture/img-3.png";
import textureImg4 from "./texture/img-4.png";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const gui = new dat.GUI({ width: 300 });
const TOTAL_PAGE_NUM = 4;
const changeTotal = TOTAL_PAGE_NUM - 1;

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Canvas
const canvas = document.querySelector("#canvas");

// Scene
const scene = new THREE.Scene();

// Camera
const CAMERA_Z = 1000;
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  10000
);
camera.position.set(0, 0, CAMERA_Z);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio));

// Textures
let tex = new THREE.TextureLoader().load(textureImg);
let tex2 = new THREE.TextureLoader().load(textureImg2);
let tex3 = new THREE.TextureLoader().load(textureImg3);
let tex4 = new THREE.TextureLoader().load(textureImg4);

// Geometry
const width = 1024;
const height = 1024;
const geometry = new THREE.PlaneGeometry(
  width,
  height,
  width / 1.5,
  height / 1.5
);

// z方向にバラけてパーティクルが移動するので、z方向にどこまで飛ぶかを入れた配列
let delayPosZ = [];
const allVertexNum =
  geometry.attributes.position.array.length /
  geometry.attributes.position.itemSize;
for (let i = 0; i < allVertexNum; i++) {
  delayPosZ.push(mapRand(0, CAMERA_Z * 1.5));
}
function mapRand(min, max, isInt = false) {
  let rand = Math.random() * (max - min) + min;
  rand = isInt ? Math.round(rand) : rand;
  return rand;
}
geometry.setAttribute(
  "aDelayPosZ",
  new THREE.Float32BufferAttribute(delayPosZ, 1)
);

// シェーダーマテリアル
const material = new THREE.ShaderMaterial({
  vertexShader: vertex,
  fragmentShader: fragment,
  transparent: true,
  side: THREE.DoubleSide,
  uniforms: {
    uCameraZ: { value: CAMERA_Z },
    uTex: { value: tex },
    uTex2: { value: tex2 },
    uTex3: { value: tex3 },
    uTex4: { value: tex4 },
    uProgress: { value: 0.0 },
    uScrollProgress: { value: 0.0 },
  },
});

// Mesh
const mesh = new THREE.Points(geometry, material);
scene.add(mesh);

// Resize
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// マウス座標取得
let cursorX = 0;
let cursorY = 0;
let moveX = { value: 0 };
let moveY = { value: 0 };
window.addEventListener("mousemove", (event) => {
  cursorX = event.clientX / sizes.width - 0.5; //-0.5〜0.5に直す
  cursorY = event.clientY / sizes.height - 0.5; //-0.5〜0.5に直す
  gsap.to(moveX, { value: cursorX * 2, duration: 3, ease: "power1.out" });
  gsap.to(moveY, { value: cursorY * 2, duration: 3, ease: "power1.out" });
});

// scrollTrigger
const pages = document.querySelectorAll(".page");
let scrollProgress = { value: 0 };

pages.forEach((page, index) => {
  gsap.to(page, {
    scrollTrigger: {
      trigger: page,
      start: "top 20%",
      onEnter: () => {
        gsap.to(scrollProgress, {
          value: (1 / changeTotal) * index,
          duration: 1.3,
        });
      },
      onEnterBack: () => {
        gsap.to(scrollProgress, {
          value: (1 / changeTotal) * index,
          duration: 1.3,
        });
      },
    },
  });
});

// Animate
const clock = new THREE.Clock();

const animate = () => {
  controls.update();
  material.uniforms.uScrollProgress.value = scrollProgress.value;
  mesh.rotation.y = moveX.value / 2;
  mesh.rotation.x = moveY.value / 2;

  renderer.render(scene, camera);

  window.requestAnimationFrame(animate);
};

animate();

// デバッグ
gui
  .add(material.uniforms.uProgress, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("uProgress");
// gui
//   .add(material.uniforms.uScrollProgress, "value")
//   .min(0)
//   .max(1.1)
//   .step(0.001)
//   .name("uScrollProgress");

gui.show(false);
