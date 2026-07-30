/* ==========================================================================
   KHALIFAH ASIA — cinematic 3D scroll experience
   Three.js + GSAP ScrollTrigger + Lenis

   STRUCTURE
   1. Boot: renderer, scene, camera, post-processing
   2. Camera path — one continuous CatmullRom curve built from per-chapter
      waypoints (see CHAPTERS below). This is the "one continuous journey"
      spine everything else is timed against.
   3. World builders — each chapter's 3D content as a THREE.Group
   4. Chapter envelopes — pure functions of scroll progress (0..1) that
      drive opacity / scale / color, no per-object GSAP tweens needed
   5. Lenis + ScrollTrigger wiring
   6. Render loop
   ========================================================================== */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

gsap.registerPlugin(ScrollTrigger);

/* -------------------------------------------------------------------------
   0. Palette (mirrors style.css tokens)
   ------------------------------------------------------------------------- */
const COLOR = {
  turquoise: 0x37e6c8,
  turquoiseSoft: 0x7ff2df,
  deepTeal: 0x0b2b30,
  oceanTeal: 0x12454c,
  white: 0xf4faf8,
  gold: 0xc9ac6c,
  sand: 0x3a2f20,
};

/* -------------------------------------------------------------------------
   1. Boot
   ------------------------------------------------------------------------- */
const canvas = document.getElementById('webgl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.background = new THREE.Color(COLOR.deepTeal);
scene.fog = new THREE.FogExp2(0x061a20, 0.0105);

const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 900);
camera.position.set(0, 3, 58);

// Lighting: cool teal key + warm rim so materials read as premium PBR, not flat.
const hemi = new THREE.HemisphereLight(0x1c5a5f, 0x030608, 0.65);
scene.add(hemi);
const key = new THREE.DirectionalLight(0xbfe9de, 1.1);
key.position.set(30, 40, 20);
scene.add(key);
const rim = new THREE.PointLight(COLOR.turquoise, 2.2, 140, 2);
rim.position.set(-20, 10, -10);
scene.add(rim);
const warm = new THREE.PointLight(0xffb877, 0.5, 220, 2);
warm.position.set(0, 20, -110);
scene.add(warm);

// Post-processing: subtle bloom for glowing turquoise particles/edges.
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.85, 0.6, 0.15);
composer.addPass(bloom);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

/* -------------------------------------------------------------------------
   Small helpers
   ------------------------------------------------------------------------- */
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const lerp = THREE.MathUtils.lerp;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smoothstep = (v) => { const t = clamp01(v); return t * t * (3 - 2 * t); };

function resampleCurve(waypoints, steps) {
  const curve = new THREE.CatmullRomCurve3(waypoints.map((p) => p.clone()), false, 'catmullrom', 0.4);
  return curve.getPoints(steps);
}

/** Trapezoid envelope: 0 -> 1 -> 0 across [start-fadeIn, ..., end+fadeOut] */
function envelope(t, start, end, fadeIn = 0.03, fadeOut = 0.03) {
  if (t < start - fadeIn || t > end + fadeOut) return 0;
  if (t < start) return smoothstep((t - (start - fadeIn)) / fadeIn);
  if (t > end) return 1 - smoothstep((t - end) / fadeOut);
  return 1;
}

function makeGlowSprite(color = '#37e6c8', size = 128) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
const glowTex = makeGlowSprite('#8ff2df');

/* -------------------------------------------------------------------------
   2. Camera path — one continuous spine through 11 chapters
   ------------------------------------------------------------------------- */
const CHAPTERS = [
  { name: 'void', steps: 12, bg: 0x061a20, fov: 50,
    wp: [V3(0, 3, 58), V3(1.5, 2.6, 46), V3(-1.5, 2.3, 34), V3(0, 2, 24)] },

  { name: 'logo', steps: 12, bg: 0x0a2226, fov: 40, orbit: V3(0, 2, -2),
    wp: [V3(0, 4, 20), V3(15, 5, 13), V3(19, 3, 3), V3(13, 2, -5), V3(5, 1.4, -9)] },

  { name: 'space', steps: 12, bg: 0x03070a, fov: 55,
    wp: [V3(3, 1, -11), V3(1, 4, -26), V3(0, 7, -42), V3(3, 8, -56)] },

  { name: 'earth', steps: 12, bg: 0x04121a, fov: 44,
    wp: [V3(3, 7, -58), V3(15, -1, -73), V3(11, -7, -87), V3(2, -8, -99)] },

  { name: 'desert', steps: 12, bg: 0x15120b, fov: 50,
    wp: [V3(2, -7, -100), V3(0, 4, -109), V3(-2, 6, -124), V3(0, 7, -141)] },

  { name: 'makkah', steps: 13, bg: 0x081c1f, fov: 38, orbit: V3(0, 3, -160),
    wp: [V3(-25, 7, -160), V3(-15, 5, -173), V3(2, 3, -180), V3(17, 3, -172), V3(23, 2, -160)] },

  { name: 'transition', steps: 10, bg: 0x1c3f3a, fov: 62,
    wp: [V3(18, 2, -162), V3(8, 1, -173), V3(0, 0, -183), V3(0, 0, -191)] },

  { name: 'madinah', steps: 13, bg: 0x081f22, fov: 38, orbit: V3(0, 3, -206),
    wp: [V3(-23, 6, -206), V3(-11, 4, -216), V3(4, 2, -219), V3(17, 3, -211), V3(21, 4, -199)] },

  { name: 'services', steps: 17, bg: 0x071a1e, fov: 44,
    wp: [V3(10, 3, -201), V3(0, 4, -213), V3(-12, 4, -224), V3(0, 4, -233), V3(11, 4, -242), V3(0, 4, -250), V3(-7, 4, -257)] },

  { name: 'gallery', steps: 17, bg: 0x061417, fov: 42,
    wp: [V3(0, 4, -259), V3(8, 3, -268), V3(-8, 3, -278), V3(4, 2, -289), V3(0, 1, -299)] },

  { name: 'final', steps: 18, bg: 0x020a0c, fov: 36,
    wp: [V3(0, 1, -300), V3(0, 0.5, -309), V3(0, 0.1, -316), V3(0, 0, -321)] },
];

// Build the master path + look-at path, and record each chapter's [t0,t1] range.
const pathPoints = [];
const lookOverrides = [];
let cursor = 0;
CHAPTERS.forEach((ch) => {
  const pts = resampleCurve(ch.wp, ch.steps);
  ch.i0 = cursor;
  pts.forEach((p) => { pathPoints.push(p); lookOverrides.push(ch.orbit || null); });
  cursor += pts.length;
  ch.i1 = cursor - 1;
});

const posCurve = new THREE.CatmullRomCurve3(pathPoints, false, 'catmullrom', 0.35);
const lookPts = pathPoints.map((p, i) => lookOverrides[i] || pathPoints[Math.min(i + 6, pathPoints.length - 1)]);
const lookCurve = new THREE.CatmullRomCurve3(lookPts, false, 'catmullrom', 0.35);

// Global scroll-fraction boundaries per chapter (drives colors / fov / object envelopes)
const totalT = pathPoints.length - 1;
CHAPTERS.forEach((ch) => { ch.t0 = ch.i0 / totalT; ch.t1 = ch.i1 / totalT; });
const idx = (name) => CHAPTERS.findIndex((c) => c.name === name);

function chapterBlend(t) {
  for (let i = 0; i < CHAPTERS.length; i++) {
    const c = CHAPTERS[i];
    const next = CHAPTERS[Math.min(i + 1, CHAPTERS.length - 1)];
    if (t >= c.t0 && (t < next.t0 || i === CHAPTERS.length - 1)) {
      const span = Math.max(0.0001, next.t0 - c.t0);
      const localT = i === CHAPTERS.length - 1 ? 0 : smoothstep((t - c.t0) / span);
      return { a: c, b: next, localT };
    }
  }
  return { a: CHAPTERS[0], b: CHAPTERS[0], localT: 0 };
}

/* -------------------------------------------------------------------------
   3. World builders
   ------------------------------------------------------------------------- */
const world = new THREE.Group();
scene.add(world);

// --- 3a. Persistent atmosphere: starfield + drifting embers (whole journey) ---
function buildStarfield(count, radius, size, colorHex) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = radius * (0.4 + Math.random() * 0.6);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
    positions[i * 3 + 2] = r * Math.cos(phi) - 140;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ size, map: glowTex, transparent: true, opacity: 0.5, color: colorHex, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
  return new THREE.Points(geo, mat);
}
const stars = buildStarfield(1400, 260, 1.6, 0xbfe9de);
world.add(stars);

// --- 3b. SCENE 01 — the void: ambient particles + forming light-path ---
const voidGroup = new THREE.Group();
world.add(voidGroup);
function buildAmbientParticles(count, box, colorHex, size) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * box.x;
    positions[i * 3 + 1] = (Math.random() - 0.5) * box.y + 2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * box.z + 30;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ size, map: glowTex, transparent: true, opacity: 0.75, color: colorHex, depthWrite: false, blending: THREE.AdditiveBlending });
  return new THREE.Points(geo, mat);
}
const ambientParticles = buildAmbientParticles(700, new THREE.Vector3(46, 26, 70), 0x6fe9d4, 1.1);
voidGroup.add(ambientParticles);

// glowing path of light forming toward the architectural object
const pathCurveGeom = resampleCurve([V3(0, 2.2, 50), V3(0, 2, 30), V3(0, 2, 10), V3(0, 2, -2)], 40);
const pathTube = new THREE.Mesh(
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pathCurveGeom), 60, 0.045, 8, false),
  new THREE.MeshBasicMaterial({ color: COLOR.turquoise, transparent: true, opacity: 0.55 })
);
voidGroup.add(pathTube);

// --- 3c. SCENE 02 — the first light: abstract architectural object ---
const archGroup = new THREE.Group();
archGroup.position.set(0, 2, -2);
world.add(archGroup);
const archCore = new THREE.Mesh(
  new THREE.IcosahedronGeometry(4.6, 1),
  new THREE.MeshPhysicalMaterial({ color: 0xf4faf8, roughness: 0.25, metalness: 0.05, transmission: 0.35, thickness: 1.2, transparent: true, opacity: 0.9, clearcoat: 0.6 })
);
archGroup.add(archCore);
const archWire = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(5.05, 1)),
  new THREE.LineBasicMaterial({ color: COLOR.turquoise, transparent: true, opacity: 0.9 })
);
archGroup.add(archWire);
const archRing = new THREE.Mesh(
  new THREE.TorusGeometry(7.4, 0.03, 8, 90),
  new THREE.MeshBasicMaterial({ color: COLOR.turquoiseSoft, transparent: true, opacity: 0.55 })
);
archRing.rotation.x = Math.PI / 2.4;
archGroup.add(archRing);

// --- 3d. SCENE 03 — Earth + travel route from Indonesia to Saudi Arabia ---
const earthGroup = new THREE.Group();
earthGroup.position.set(4, -20, -92);
world.add(earthGroup);
const earthMesh = new THREE.Mesh(
  new THREE.SphereGeometry(18, 64, 64),
  new THREE.MeshStandardMaterial({ color: 0x0c3138, roughness: 0.55, metalness: 0.15, emissive: 0x03181a, emissiveIntensity: 0.4 })
);
earthGroup.add(earthMesh);
const earthAtmo = new THREE.Mesh(
  new THREE.SphereGeometry(18.6, 64, 64),
  new THREE.MeshBasicMaterial({ color: COLOR.turquoise, transparent: true, opacity: 0.16, side: THREE.BackSide, blending: THREE.AdditiveBlending })
);
earthGroup.add(earthAtmo);
// two points on the sphere surface (Indonesia -> Saudi) + a raised glowing arc between them
function spherePoint(radius, latDeg, lonDeg) {
  const lat = THREE.MathUtils.degToRad(latDeg), lon = THREE.MathUtils.degToRad(lonDeg);
  return V3(radius * Math.cos(lat) * Math.cos(lon), radius * Math.sin(lat), radius * Math.cos(lat) * Math.sin(lon));
}
const idPoint = spherePoint(18, -5, 55);
const saPoint = spherePoint(18, 18, -10);
const routeMid = idPoint.clone().add(saPoint).multiplyScalar(0.5).setLength(25);
const routeCurve = new THREE.CatmullRomCurve3([idPoint, routeMid, saPoint]);
const routeTube = new THREE.Mesh(
  new THREE.TubeGeometry(routeCurve, 40, 0.09, 8, false),
  new THREE.MeshBasicMaterial({ color: COLOR.turquoiseSoft, transparent: true, opacity: 0.9 })
);
earthGroup.add(routeTube);
[idPoint, saPoint].forEach((p) => {
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), new THREE.MeshBasicMaterial({ color: COLOR.turquoiseSoft }));
  dot.position.copy(p);
  earthGroup.add(dot);
});

// --- 3e. SCENE 04 — desert flyover ---
const desertGroup = new THREE.Group();
desertGroup.position.set(0, -12, -118);
world.add(desertGroup);
const duneGeo = new THREE.PlaneGeometry(340, 220, 90, 60);
const dpos = duneGeo.attributes.position;
for (let i = 0; i < dpos.count; i++) {
  const x = dpos.getX(i), y = dpos.getY(i);
  const h = Math.sin(x * 0.045) * 3.2 + Math.cos(y * 0.06 + x * 0.02) * 2.4 + Math.sin(x * 0.12 + y * 0.1) * 0.8;
  dpos.setZ(i, h);
}
duneGeo.computeVertexNormals();
const duneMesh = new THREE.Mesh(duneGeo, new THREE.MeshStandardMaterial({ color: 0x2a2013, roughness: 0.95, metalness: 0.02, emissive: 0x0c2a26, emissiveIntensity: 0.12 }));
duneMesh.rotation.x = -Math.PI / 2;
desertGroup.add(duneMesh);

// --- 3f. SCENE 05 — Makkah: abstract, respectful monolith (not a literal replica) ---
function buildMonument({ height, coreColor, bandColor, minaretColor, ringColor }) {
  const g = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.BoxGeometry(8.6, height, 8.6),
    new THREE.MeshPhysicalMaterial({ color: coreColor, roughness: 0.35, metalness: 0.25, clearcoat: 0.4 })
  );
  core.position.y = height / 2;
  g.add(core);
  const band = new THREE.Mesh(
    new THREE.BoxGeometry(8.9, height * 0.16, 8.9),
    new THREE.MeshStandardMaterial({ color: bandColor, roughness: 0.3, metalness: 0.6, emissive: bandColor, emissiveIntensity: 0.35 })
  );
  band.position.y = height * 0.78;
  g.add(band);
  const minaretGeo = new THREE.CylinderGeometry(0.55, 0.7, height * 1.35, 16);
  const minaretMat = new THREE.MeshStandardMaterial({ color: minaretColor, roughness: 0.4, metalness: 0.1, emissive: minaretColor, emissiveIntensity: 0.15 });
  [[6.6, 6.6], [-6.6, 6.6], [6.6, -6.6], [-6.6, -6.6]].forEach(([x, z]) => {
    const m = new THREE.Mesh(minaretGeo, minaretMat);
    m.position.set(x, (height * 1.35) / 2, z);
    g.add(m);
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(11, 11.4, 90), new THREE.MeshBasicMaterial({ color: ringColor, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;
  g.add(ring);
  return g;
}
const makkahGroup = buildMonument({ height: 11, coreColor: 0x0c0c0d, bandColor: COLOR.gold, minaretColor: 0xe9e4d6, ringColor: COLOR.turquoise });
makkahGroup.position.set(0, 0, -160);
world.add(makkahGroup);

// --- 3g. SCENE 06 — light transition burst ---
const burst = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending })
);
burst.position.set(0, 1, -184);
world.add(burst);
const flashEl = document.createElement('div');
flashEl.style.cssText = 'position:fixed;inset:0;background:#eafff8;opacity:0;pointer-events:none;z-index:10;';
document.getElementById('stage').appendChild(flashEl);

// --- 3h. SCENE 07 — Madinah: abstract dome ---
function buildDome() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(7.6, 8.2, 5, 24), new THREE.MeshPhysicalMaterial({ color: 0xf3f8f6, roughness: 0.45, metalness: 0.05, clearcoat: 0.3 }));
  base.position.y = 2.5;
  g.add(base);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(6.4, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: COLOR.oceanTeal, roughness: 0.3, metalness: 0.35, clearcoat: 0.6, emissive: COLOR.turquoise, emissiveIntensity: 0.08 }));
  dome.position.y = 5;
  g.add(dome);
  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.25, 2, 12), new THREE.MeshStandardMaterial({ color: COLOR.gold, metalness: 0.7, roughness: 0.25, emissive: COLOR.gold, emissiveIntensity: 0.3 }));
  spire.position.y = 5 + 6.4 + 1;
  g.add(spire);
  const minaretGeo = new THREE.CylinderGeometry(0.45, 0.6, 13, 14);
  const minaretMat = new THREE.MeshStandardMaterial({ color: 0xf3f8f6, roughness: 0.4, emissive: COLOR.turquoise, emissiveIntensity: 0.1 });
  [[10, 10], [-10, 10], [10, -10], [-10, -10]].forEach(([x, z]) => {
    const m = new THREE.Mesh(minaretGeo, minaretMat);
    m.position.set(x, 6.5, z);
    g.add(m);
  });
  const courtyard = new THREE.Mesh(new THREE.RingGeometry(13, 13.5, 90), new THREE.MeshBasicMaterial({ color: COLOR.turquoise, transparent: true, opacity: 0.45, side: THREE.DoubleSide }));
  courtyard.rotation.x = -Math.PI / 2;
  g.add(courtyard);
  return g;
}
const madinahGroup = buildDome();
madinahGroup.position.set(0, 0, -206);
world.add(madinahGroup);

// --- 3i. SCENE 08 — three service clusters ---
const servicesGroup = new THREE.Group();
world.add(servicesGroup);
const teal = (opts = {}) => new THREE.MeshPhysicalMaterial({ color: COLOR.oceanTeal, roughness: 0.3, metalness: 0.4, clearcoat: 0.5, emissive: COLOR.turquoise, emissiveIntensity: 0.12, ...opts });
const whiteMat = () => new THREE.MeshPhysicalMaterial({ color: 0xf4faf8, roughness: 0.25, metalness: 0.05, clearcoat: 0.6 });
const goldMat = () => new THREE.MeshStandardMaterial({ color: COLOR.gold, metalness: 0.7, roughness: 0.25, emissive: COLOR.gold, emissiveIntensity: 0.35 });

function buildServiceReguler() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 3.2, 6, 12), whiteMat());
  body.rotation.z = Math.PI / 2.2;
  g.add(body);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.08, 0.9), teal());
  wing.rotation.z = Math.PI / 2.2;
  wing.position.set(-0.2, -0.1, 0);
  g.add(wing);
  const luggage = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.4, 0.7), teal({ emissiveIntensity: 0.08 }));
  luggage.position.set(2.6, -2, 0.4);
  g.add(luggage);
  const passport = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.25, 0.12), goldMat());
  passport.position.set(-2.4, -1.6, 0.6);
  passport.rotation.set(0.3, 0.4, 0.1);
  g.add(passport);
  return g;
}
function buildServiceRamadhan() {
  const g = new THREE.Group();
  const crescent = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.28, 16, 60, Math.PI * 1.35), goldMat());
  crescent.rotation.set(0, 0, Math.PI / 5);
  g.add(crescent);
  const lantern = new THREE.Mesh(new THREE.OctahedronGeometry(0.85, 0), new THREE.MeshPhysicalMaterial({ color: COLOR.turquoiseSoft, roughness: 0.15, metalness: 0.1, transmission: 0.5, transparent: true, opacity: 0.85, emissive: COLOR.turquoise, emissiveIntensity: 0.4 }));
  lantern.position.set(2.4, -1.2, 0);
  g.add(lantern);
  const mosque = new THREE.Mesh(new THREE.ConeGeometry(1, 1.6, 20, 1, true), teal());
  mosque.position.set(-2.2, -1.6, 0);
  g.add(mosque);
  return g;
}
function buildServiceThaif() {
  const g = new THREE.Group();
  [0, 1.4, -1.5].forEach((x, i) => {
    const h = [2.4, 3.2, 1.9][i];
    const m = new THREE.Mesh(new THREE.ConeGeometry(1.1, h, 6), teal({ emissiveIntensity: 0.06, roughness: 0.7, metalness: 0.05 }));
    m.position.set(x, h / 2 - 1.8, -i * 0.6);
    g.add(m);
  });
  const road = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 6), new THREE.MeshStandardMaterial({ color: 0x0e1b1d, roughness: 0.8 }));
  road.rotation.x = -Math.PI / 2.4;
  road.position.set(0, -2.3, 1.6);
  g.add(road);
  const line = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 5.6), new THREE.MeshBasicMaterial({ color: COLOR.turquoiseSoft }));
  line.rotation.copy(road.rotation);
  line.position.set(0, -2.28, 1.6);
  g.add(line);
  return g;
}
const serviceAnchors = [V3(0, 4, -224), V3(0, 4, -233), V3(0, 4, -242)];
const serviceBuilders = [buildServiceReguler, buildServiceRamadhan, buildServiceThaif];
const serviceClusters = serviceBuilders.map((fn, i) => {
  const cl = fn();
  cl.scale.setScalar(1.3);
  cl.position.copy(serviceAnchors[i]).add(V3(i % 2 === 0 ? -3.5 : 3.5, 0, 0));
  servicesGroup.add(cl);
  return cl;
});

// --- 3j. SCENE 09 — floating photo gallery ---
function buildFrameTexture(label) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 340;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 512, 340);
  g.addColorStop(0, '#0c2f33'); g.addColorStop(1, '#124a4f');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 340);
  ctx.strokeStyle = 'rgba(127,242,223,0.55)'; ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, 492, 320);
  ctx.fillStyle = 'rgba(238,248,246,0.85)';
  ctx.font = '300 24px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, 256, 178);
  ctx.font = '300 13px sans-serif';
  ctx.fillStyle = 'rgba(127,242,223,0.7)';
  ctx.fillText('KHALIFAH ASIA — DOKUMENTASI JAMAAH', 256, 210);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
const galleryGroup = new THREE.Group();
world.add(galleryGroup);
const frameLabels = ['Tawaf di Masjidil Haram', 'Rombongan di Madinah', 'Momen Keberangkatan', 'Hotel dekat Masjidil Haram', 'Ziarah Raudhah', 'Kebersamaan Jamaah', 'Kota Makkah saat Senja', 'Pulang dengan Hati Tenang'];
const galleryFrames = frameLabels.map((label, i) => {
  const geo = new THREE.PlaneGeometry(5.4, 3.55);
  const mat = new THREE.MeshBasicMaterial({ map: buildFrameTexture(label), transparent: true, opacity: 0 });
  const mesh = new THREE.Mesh(geo, mat);
  const side = i % 2 === 0 ? -1 : 1;
  mesh.position.set(side * (5.5 + Math.random() * 2), 2 + Math.sin(i) * 2, -260 - i * 5.2);
  mesh.rotation.y = side * 0.5;
  galleryGroup.add(mesh);
  return mesh;
});

// --- 3k. SCENE 10 — final CTA: single light -> small Kaaba silhouette ---
const finalLight = new THREE.Mesh(new THREE.SphereGeometry(0.6, 24, 24), new THREE.MeshBasicMaterial({ color: COLOR.turquoiseSoft, transparent: true, opacity: 0 }));
finalLight.position.set(0, 1.5, -317);
world.add(finalLight);
const finalMonument = buildMonument({ height: 7, coreColor: 0x0c0c0d, bandColor: COLOR.gold, minaretColor: 0xe9e4d6, ringColor: COLOR.turquoise });
finalMonument.scale.setScalar(0.001);
finalMonument.position.set(0, 0, -320);
world.add(finalMonument);

/* -------------------------------------------------------------------------
   4. Per-frame envelopes driving visibility / color / fov
   ------------------------------------------------------------------------- */
const IDX = Object.fromEntries(CHAPTERS.map((c, i) => [c.name, i]));
const T = (name) => CHAPTERS[IDX[name]];

function updateWorld(t) {
  // --- camera & fov ---
  const { a, b, localT } = chapterBlend(t);
  targetFov = lerp(a.fov, b.fov, localT);
  const bgA = new THREE.Color(a.bg), bgB = new THREE.Color(b.bg);
  const bg = bgA.clone().lerp(bgB, localT);
  scene.background = bg;
  scene.fog.color = bg;
  scene.fog.density = 0.0075 + (T('desert').t0 < t && t < T('makkah').t1 ? 0.004 : 0);

  // --- void ---
  const vEnv = envelope(t, T('void').t0, T('logo').t0, 0.02, 0.12);
  voidGroup.visible = vEnv > 0.01;
  ambientParticles.material.opacity = 0.75 * vEnv;
  pathTube.material.opacity = 0.55 * vEnv;
  ambientParticles.rotation.y += 0.0006;

  // --- architectural object ---
  const archEnv = envelope(t, T('logo').t0, T('logo').t1, 0.05, 0.08);
  archGroup.visible = archEnv > 0.01;
  archGroup.scale.setScalar(0.8 + archEnv * 0.2);
  archCore.material.opacity = 0.9 * archEnv;
  archWire.material.opacity = 0.9 * archEnv;
  archRing.material.opacity = 0.55 * archEnv;
  archGroup.rotation.y += 0.0022;
  archWire.rotation.y -= 0.0011;

  // --- earth ---
  const earthEnv = envelope(t, T('space').t1 - 0.03, T('earth').t1, 0.05, 0.08);
  earthGroup.visible = earthEnv > 0.01;
  earthAtmo.material.opacity = 0.16 * earthEnv;
  earthMesh.material.opacity = earthEnv;
  routeTube.material.opacity = 0.9 * earthEnv;
  earthGroup.rotation.y += 0.0009;

  // --- desert ---
  const desertEnv = envelope(t, T('earth').t1 - 0.02, T('desert').t1, 0.05, 0.02);
  desertGroup.visible = desertEnv > 0.01;
  duneMesh.material.opacity = desertEnv;

  // --- makkah ---
  const makkahEnv = envelope(t, T('desert').t1 - 0.05, T('makkah').t1, 0.1, 0.06);
  makkahGroup.visible = makkahEnv > 0.01;
  makkahGroup.scale.setScalar(0.85 + makkahEnv * 0.15);
  makkahGroup.rotation.y = (1 - makkahEnv) * 0.4;
  setGroupOpacity(makkahGroup, makkahEnv);

  // --- transition burst ---
  const burstEnv = envelope(t, T('transition').t0, T('transition').t1, 0.03, 0.03);
  const burstPeak = Math.sin(Math.min(1, burstEnv) * Math.PI); // rises then falls within the chapter
  burst.material.opacity = burstPeak * 0.9;
  burst.scale.setScalar(1 + burstPeak * 55);
  flashEl.style.opacity = String(burstPeak * 0.7);

  // --- madinah ---
  const madinahEnv = envelope(t, T('transition').t1 - 0.04, T('madinah').t1, 0.08, 0.06);
  madinahGroup.visible = madinahEnv > 0.01;
  madinahGroup.scale.setScalar(0.85 + madinahEnv * 0.15);
  setGroupOpacity(madinahGroup, madinahEnv);

  // --- services ---
  const servicesEnvOuter = envelope(t, T('madinah').t1 - 0.02, T('services').t1, 0.06, 0.05);
  servicesGroup.visible = servicesEnvOuter > 0.01;
  const s0 = T('services').t0, s1 = T('services').t1, sSpan = s1 - s0;
  serviceClusters.forEach((cl, i) => {
    const start = s0 + (i / 3) * sSpan - 0.02;
    const end = s0 + ((i + 1.15) / 3) * sSpan;
    const e = envelope(t, start, end, 0.03, 0.05) * servicesEnvOuter;
    cl.scale.setScalar((1.3) * (0.7 + e * 0.3));
    cl.rotation.y += 0.004;
    setGroupOpacity(cl, e);
    toggleOverlay(`service-${i}`, e > 0.5);
  });

  // --- gallery ---
  const galleryEnv = envelope(t, T('services').t1 - 0.02, T('gallery').t1, 0.05, 0.05);
  galleryGroup.visible = galleryEnv > 0.01;
  galleryFrames.forEach((f) => {
    const dz = camera.position.z - f.position.z;
    const near = smoothstep(1 - Math.abs(dz - 6) / 16);
    f.material.opacity = clamp01(near) * galleryEnv;
    f.lookAt(camera.position.x, f.position.y, camera.position.z);
  });

  // --- final ---
  const finalEnv = envelope(t, T('gallery').t1 - 0.04, 1, 0.06, 0.02);
  const finalLocal = clamp01((t - (T('gallery').t1 - 0.02)) / (1 - (T('gallery').t1 - 0.02)));
  finalLight.material.opacity = finalEnv * (1 - smoothstep((finalLocal - 0.4) / 0.4)) * 0.9;
  finalLight.scale.setScalar(1 + finalEnv * 3);
  const monumentReveal = smoothstep((finalLocal - 0.35) / 0.5);
  finalMonument.scale.setScalar(Math.max(0.001, monumentReveal * 0.55));
  setGroupOpacity(finalMonument, monumentReveal);
  finalMonument.visible = finalEnv > 0.01;

  // --- overlays (text) ---
  toggleOverlay('logo', archEnv > 0.45);
  toggleOverlay('earth', earthEnv > 0.5 && madinahEnv < 0.3);
  toggleOverlay('makkah', makkahEnv > 0.55 && burstEnv < 0.4);
  toggleOverlay('madinah', madinahEnv > 0.55);
  toggleOverlay('gallery', galleryEnv > 0.35 && finalEnv < 0.3);
  toggleOverlay('final', finalEnv > 0.35);

  // scroll hint + header progress
  scrollHint.classList.toggle('hidden', t > 0.03);
  progressFill.style.width = `${t * 100}%`;
}

function setGroupOpacity(group, v) {
  group.traverse((obj) => {
    if (obj.isMesh && obj.material && 'opacity' in obj.material) {
      obj.material.transparent = true;
      obj.material.opacity = v;
    }
  });
}

const overlayEls = {};
document.querySelectorAll('.ov').forEach((el) => { overlayEls[el.dataset.scene] = el; });
function toggleOverlay(name, show) {
  const el = overlayEls[name];
  if (el) el.classList.toggle('is-active', !!show);
}
const scrollHint = document.getElementById('scroll-hint');
const progressFill = document.getElementById('progressFill');

/* -------------------------------------------------------------------------
   5. Lenis smooth scroll + GSAP ScrollTrigger wiring
   ------------------------------------------------------------------------- */
let scrollT = 0;
let targetFov = 50;

const lenis = new Lenis({ duration: 1.15, smoothWheel: true, easing: (x) => 1 - Math.pow(1 - x, 3) });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

ScrollTrigger.create({
  trigger: '#scroller',
  start: 'top top',
  end: 'bottom bottom',
  scrub: true,
  onUpdate: (self) => { scrollT = self.progress; },
});

/* -------------------------------------------------------------------------
   6. Render loop
   ------------------------------------------------------------------------- */
const tmpLook = new THREE.Vector3();
let curLook = new THREE.Vector3(0, 2, 0);

function animate() {
  requestAnimationFrame(animate);
  updateWorld(scrollT);

  const targetPos = posCurve.getPointAt(clamp01(scrollT));
  const targetLook = lookCurve.getPointAt(clamp01(scrollT), tmpLook);
  camera.position.lerp(targetPos, 0.09);
  curLook.lerp(targetLook, 0.09);
  camera.lookAt(curLook);
  camera.fov += (targetFov - camera.fov) * 0.06;
  camera.updateProjectionMatrix();

  stars.rotation.y += 0.00008;

  composer.render();
}

/* -------------------------------------------------------------------------
   Boot sequence: fake asset warm-up so the loader feels intentional, then reveal
   ------------------------------------------------------------------------- */
const loader = document.getElementById('loader');
const loaderFill = document.getElementById('loaderFill');
let p = 0;
const boot = setInterval(() => {
  p += Math.random() * 18;
  loaderFill.style.width = `${Math.min(100, p)}%`;
  if (p >= 100) {
    clearInterval(boot);
    setTimeout(() => {
      loader.classList.add('hide');
      ScrollTrigger.refresh();
    }, 250);
  }
}, 140);

document.getElementById('btnPlan').addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

animate();