import gsap from 'gsap';
import './style.css';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

// Create the scene
const scene = new THREE.Scene();

// Create a camera, which determines what we'll see when we render the scene
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 9;

let lastWheelTime = 0;
const throttleDelay = 2000;
let scrollCount = 0;

let startY = 0;
let endY = 0;

// Prevent default scroll behavior for both wheel and touch interactions
window.addEventListener("wheel", (e) => e.preventDefault(), { passive: false });
window.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });

window.addEventListener("touchstart", (e) => {
  startY = e.touches[0].clientY;
});

window.addEventListener("touchend", (e) => {
  endY = e.changedTouches[0].clientY;

  // Calculate the swipe distance and determine direction
  const deltaY = startY - endY;

  if (Math.abs(deltaY) > 50) { // Threshold to detect swipe
    const direction = deltaY > 0 ? "down" : "up";
    handleSwipe(direction);
  }
});

function handleSwipe(direction) {
  const currentTime = Date.now();
  if (currentTime - lastWheelTime >= throttleDelay) {
    lastWheelTime = currentTime;
    scrollCount = (scrollCount + 1) % 4;

    // Trigger planet rotation and heading animation
    const headings = document.querySelectorAll(".heading");
    gsap.to(headings, {
      duration: 1,
      y: `-=${100}%`,
      ease: "power2.inOut",
    });

    gsap.to(spheres.rotation, {
      duration: 1,
      y: `-=${Math.PI / 2}`,
      ease: "power2.inOut",
    });

    if (scrollCount === 0) {
      gsap.to(headings, {
        duration: 1,
        y: `0`,
        ease: "power2.inOut",
      });
    }
  }
}

function throttledWheelHandler(event){
  const currentTime = Date.now();
  if(currentTime - lastWheelTime >= throttleDelay){

    
    lastWheelTime = currentTime;
    const direction = event.deltaY > 0 ? "down" : "up";
    scrollCount = (scrollCount + 1) % 4;
    // console.log(scrollCount)

    const headings = document.querySelectorAll('.heading');
    gsap.to(headings, {
      duration: 1,
      y: `-=${100}%`,
      ease: 'power2.inOut'
    });

    gsap.to(spheres.rotation, {
      duration: 1,
      y: `-=${Math.PI/2}%`,
      ease: 'power2.inOut'
    });

    if(scrollCount === 0){
      gsap.to(headings,{
        duration: 1,
        y: `0`,
        ease: 'power2.inOut'
      })
    }
  }
}

window.addEventListener('wheel', throttledWheelHandler);

// setInterval(() => {
//   gsap.to(spheres.rotation, {
//     y: `+=${Math.PI/2}`,
//     duration: 2,
//     ease: 'expo.easeInOut'
//   });
// }, 2500);
// Create a renderer and attach it to our document
const canvas = document.getElementById('canvas');

const renderer = new THREE.WebGLRenderer({canvas}, { antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
// document.body.appendChild(renderer.domElement);

const loader = new RGBELoader();
loader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/moonlit_golf_2k.hdr', (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  // scene.background = texture;
  scene.environment = texture;
});

const radius = 1.3;
const segments = 64;
const colors = ['red', 'green', 'blue', 'yellow'];
const textures = ['./csilla/color.png','./earth/map.jpg','./venus/map.jpg','./volcanic/color.png'];
const spheres = new THREE.Group();

const starTextureLoader = new THREE.TextureLoader();
const starTexture = starTextureLoader.load('./stars.jpg');
starTexture.colorSpace = THREE.SRGBColorSpace;
const bigSphereGeometry = new THREE.SphereGeometry(50,64,64);
const bigSphereMaterial = new THREE.MeshStandardMaterial({ map: starTexture, opacity: 0.1, side: THREE.BackSide });
const bigSphere = new THREE.Mesh(bigSphereGeometry, bigSphereMaterial);

const spheresMesh = [];
scene.add(bigSphere);
const orbitRadius = 4.5;


for(let i=0;i<4;i++){
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(textures[i]);
  texture.colorSpace = THREE.SRGBColorSpace;
  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshStandardMaterial({ map: texture });
  const sphere = new THREE.Mesh(geometry, material);

  spheresMesh.push(sphere);

  material.map = texture;

  const angle = (i/4) * (Math.PI*2);
  sphere.position.x = Math.cos(angle) * orbitRadius;
  sphere.position.z = Math.sin(angle) * orbitRadius;
  spheres.add(sphere);
}

spheres.rotation.x = .1;
spheres.position.y = -0.8;
scene.add(spheres);
// Add orbit controls to allow for camera movement

// Create an animation loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  for(let i=0;i<4;i++){
    spheresMesh[i].rotation.y = clock.getElapsedTime() * 0.03
  }
  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the animation loop
animate();