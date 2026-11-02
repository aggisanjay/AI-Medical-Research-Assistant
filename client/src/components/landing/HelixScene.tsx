import React, { Component, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, Sparkles } from "@react-three/drei";
import { Bloom, ChromaticAberration, EffectComposer, Noise, SMAA, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import { clamp01, lerp, smooth } from "@/lib/motion";

/* ------------------------------------------------------------------ *
 * The Evidence Helix
 * 80 glass beads = 80 pieces of evidence. Colour = source registry
 * (sky: PubMed, violet: OpenAlex, emerald: ClinicalTrials.gov).
 * Scroll morphs one object through four states:
 *   helix -> three source clusters -> knowledge graph -> verified answer
 * ------------------------------------------------------------------ */

const PER = 54;
const N = PER * 2;
const CENTER = N; // virtual node for the answer crystal
const SRC = ["#38bdf8", "#a78bfa", "#34d399"].map((c) => new THREE.Color(c));

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Scroll progress (0..1) -> blend across the four states (0..3). */
export function stageFromProgress(p: number) {
  const seg = (a: number, b: number) => smooth(clamp01((p - a) / (b - a)));
  return seg(0.14, 0.3) + seg(0.4, 0.56) + seg(0.66, 0.82);
}

const CLUSTER_CENTERS = [new THREE.Vector3(0, 1.55, 0), new THREE.Vector3(-1.7, -1.0, 0.3), new THREE.Vector3(1.7, -1.0, -0.3)];

function build() {
  const r = rng(7);
  const L: THREE.Vector3[][] = [[], [], [], []];
  const source: number[] = [];
  const size: number[] = [];
  for (let n = 0; n < N; n++) {
    const k = n < PER ? 0 : 1;
    const i = n % PER;
    source.push(n % 3);
    size.push(0.07 + r() * 0.06);
    // L0: double helix
    const th = i * 0.4 + k * Math.PI;
    L[0].push(new THREE.Vector3(Math.cos(th) * 0.86, (i - (PER - 1) / 2) * 0.078, Math.sin(th) * 0.86));
    // L1: three source clusters
    const c = CLUSTER_CENTERS[n % 3];
    const dir = new THREE.Vector3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1).normalize();
    L[1].push(c.clone().addScaledVector(dir, Math.cbrt(r()) * 0.85));
    // L2: volumetric knowledge graph (golden-angle spiral, mixed sources)
    const y = 1 - (n / (N - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const ga = n * 2.399963;
    const R = 0.9 + r() * 1.15;
    L[2].push(new THREE.Vector3(Math.cos(ga) * rad * R, y * R, Math.sin(ga) * rad * R));
    // L3: thin shell around the verified answer
    const R3 = 1.28 + r() * 0.12;
    L[3].push(new THREE.Vector3(Math.cos(ga) * rad * R3, y * R3, Math.sin(ga) * rad * R3));
  }

  type Edge = { a: number; b: number; cls: number };
  const edges: Edge[] = [];
  const seen = new Set<string>();
  const add = (a: number, b: number, cls: number) => {
    const key = `${cls}:${Math.min(a, b)}-${Math.max(a, b)}`;
    if (a === b || seen.has(key)) return;
    seen.add(key);
    edges.push({ a, b, cls });
  };
  for (let k = 0; k < 2; k++) for (let i = 0; i < PER - 1; i++) add(k * PER + i, k * PER + i + 1, 0);
  for (let i = 0; i < PER; i++) add(i, PER + i, 0);
  const nearest = (n: number, pool: number[], layout: THREE.Vector3[], k: number) =>
    pool
      .filter((m) => m !== n)
      .sort((p, q) => layout[p].distanceToSquared(layout[n]) - layout[q].distanceToSquared(layout[n]))
      .slice(0, k);
  for (let s = 0; s < 3; s++) {
    const pool = source.map((v, i) => (v === s ? i : -1)).filter((i) => i >= 0);
    pool.forEach((n) => nearest(n, pool, L[1], 2).forEach((m) => add(n, m, 1)));
  }
  const all = Array.from({ length: N }, (_, i) => i);
  all.forEach((n) => nearest(n, all, L[2], 3).forEach((m) => add(n, m, 2)));
  all.forEach((n) => add(n, CENTER, 3));
  return { L, source, size, edges };
}

const wrap = (x: number, y: number, z: number, o: THREE.Object3D) => o.position.set(x, y, z);

const CAM = { z: [9.6, 12.2, 10.6, 9.4], y: [0.2, 0.3, 0.4, 0.3] };
const DESK_X = [2.0, 1.9, 1.95, 2.0];
function piece(arr: number[], s: number) {
  const k = Math.min(arr.length - 2, Math.floor(s));
  return lerp(arr[k], arr[k + 1], s - k);
}

const LABEL_TEXT = ["PubMed", "OpenAlex", "ClinicalTrials.gov", "Citations verified"];
const LABEL_COLOR = ["#7dd3fc", "#c4b5fd", "#6ee7b7", "#6ee7b7"];
const LABEL_POS = [
  new THREE.Vector3(CLUSTER_CENTERS[0].x, CLUSTER_CENTERS[0].y + 1.15, CLUSTER_CENTERS[0].z),
  new THREE.Vector3(CLUSTER_CENTERS[1].x, CLUSTER_CENTERS[1].y + 1.15, CLUSTER_CENTERS[1].z),
  new THREE.Vector3(CLUSTER_CENTERS[2].x, CLUSTER_CENTERS[2].y + 1.15, CLUSTER_CENTERS[2].z),
  new THREE.Vector3(0, 1.2, 0),
];

const Scene: React.FC<{
  progress: MotionValue<number>;
  reduced: boolean;
  low: boolean;
  labels: React.MutableRefObject<(HTMLDivElement | null)[]>;
  onFirstFrame: () => void;
}> = ({ progress, reduced, low, labels, onFirstFrame }) => {
  const { size: vp, camera } = useThree();
  const group = useRef<THREE.Group>(null);
  const beads = useRef<THREE.InstancedMesh>(null);
  const cores = useRef<THREE.InstancedMesh>(null);
  const crystal = useRef<THREE.Mesh>(null);
  const crystalCore = useRef<THREE.Mesh>(null);
  const lines = useRef<THREE.LineSegments>(null);
  const proj = useMemo(() => new THREE.Vector3(), []);
  const pointer = useRef({ x: 0, y: 0 });
  const sp = useRef({ x: 0, y: 0 });
  const announced = useRef(false);

  const data = useMemo(build, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const delay = useMemo(() => {
    const r = rng(3);
    return Array.from({ length: N }, () => r());
  }, []);
  const cur = useMemo(() => new Float32Array((N + 1) * 3), []);
  const edgeGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(data.edges.length * 6), 3));
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(data.edges.length * 6), 3));
    return g;
  }, [data]);
  const sphere = useMemo(() => new THREE.SphereGeometry(1, 40, 28), []);
  const ico = useMemo(() => new THREE.IcosahedronGeometry(0.5, 1), []);

  useEffect(() => {
    // Per-instance colours, set once
    const white = new THREE.Color("#ffffff");
    const c = new THREE.Color();
    for (let n = 0; n < N; n++) {
      c.copy(SRC[data.source[n]]).lerp(white, 0.3);
      beads.current?.setColorAt(n, c);
      c.copy(SRC[data.source[n]]).multiplyScalar(3.2);
      cores.current?.setColorAt(n, c);
    }
    if (beads.current?.instanceColor) beads.current.instanceColor.needsUpdate = true;
    if (cores.current?.instanceColor) cores.current.instanceColor.needsUpdate = true;
  }, [data]);

  useEffect(() => {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return;
    const mv = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", mv, { passive: true });
    return () => window.removeEventListener("pointermove", mv);
  }, [reduced]);

  useEffect(
    () => () => {
      edgeGeo.dispose();
      sphere.dispose();
      ico.dispose();
    },
    [edgeGeo, sphere, ico],
  );

  const tmpA = useMemo(() => new THREE.Color(), []);
  const tmpB = useMemo(() => new THREE.Color(), []);
  const scatter = useMemo(() => {
    const r = rng(19);
    return Array.from({ length: N }, () => new THREE.Vector3((r() - 0.5) * 14, (r() - 0.5) * 9, (r() - 0.5) * 8));
  }, []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const p = reduced ? 0 : progress.get();
    const s = Math.min(3, stageFromProgress(p));
    const k = Math.min(2, Math.floor(s));
    const f = s >= 3 ? 1 : s - k;
    const narrow = vp.width < 820;

    camera.position.set(0, piece(CAM.y, s), piece(CAM.z, s) * (narrow ? 1.25 : 1));
    camera.lookAt(0, 0, 0);

    sp.current.x = lerp(sp.current.x, pointer.current.x, 1 - Math.exp(-dt * 3));
    sp.current.y = lerp(sp.current.y, pointer.current.y, 1 - Math.exp(-dt * 3));
    const g = group.current!;
    g.position.x = narrow ? 0 : piece(DESK_X, s);
    g.position.y = narrow ? 1.75 : 0;
    g.scale.setScalar(narrow ? 0.66 : 1);
    const helixSpin = reduced ? 0.4 : t * 0.22 * (1 - smooth(clamp01(s))) + 0.4;
    g.rotation.y = helixSpin + s * 0.35 + sp.current.x * 0.25;
    g.rotation.x = sp.current.y * 0.07 + (1 - smooth(clamp01(s))) * 0.06;
    g.rotation.z = (1 - smooth(clamp01(s))) * -0.18;

    const intro = reduced ? 10 : t;
    const bm = beads.current;
    const cm = cores.current;
    if (!bm || !cm) return;
    const sizeMul = piece([0.92, 1.28, 1.0, 0.8], s);

    for (let n = 0; n < N; n++) {
      const a = data.L[k][n];
      const b = data.L[Math.min(3, k + 1)][n];
      const ti = smooth(clamp01((f - delay[n] * 0.4) / 0.6));
      let x = lerp(a.x, b.x, ti);
      let y = lerp(a.y, b.y, ti);
      let z = lerp(a.z, b.z, ti);
      // living motion: slow breathing offset per node
      const ph = n * 1.7;
      const amp = 0.008 + 0.055 * smooth(clamp01(s));
      x += Math.sin(t * 0.7 + ph) * amp;
      y += Math.cos(t * 0.6 + ph * 1.3) * amp;
      z += Math.sin(t * 0.5 + ph * 0.7) * amp;
      // intro: beads converge from the dark into the helix
      const e = smooth(clamp01((intro - 0.2 - delay[n] * 1.1) / 1.4));
      x = lerp(scatter[n].x, x, e);
      y = lerp(scatter[n].y, y, e);
      z = lerp(scatter[n].z, z, e);
      cur[n * 3] = x;
      cur[n * 3 + 1] = y;
      cur[n * 3 + 2] = z;
      const sc = data.size[n] * sizeMul * (0.3 + 0.7 * e);
      wrap(x, y, z, dummy);
      dummy.scale.setScalar(sc);
      dummy.updateMatrix();
      bm.setMatrixAt(n, dummy.matrix);
      dummy.scale.setScalar(sc * 0.42);
      dummy.updateMatrix();
      cm.setMatrixAt(n, dummy.matrix);
    }
    bm.instanceMatrix.needsUpdate = true;
    cm.instanceMatrix.needsUpdate = true;
    cur[CENTER * 3] = cur[CENTER * 3 + 1] = cur[CENTER * 3 + 2] = 0;

    // Edges, weighted per class by stage (additive glow)
    const w = [clamp01(1 - s * 1.4), clamp01(1 - Math.abs(s - 1) * 1.7), clamp01(1 - Math.abs(s - 2) * 1.7), clamp01((s - 2.05) * 1.1)];
    const pos = edgeGeo.getAttribute("position") as THREE.BufferAttribute;
    const col = edgeGeo.getAttribute("color") as THREE.BufferAttribute;
    const gain = [0.95, 0.5, 0.42, 0.6];
    data.edges.forEach((ed, i) => {
      pos.setXYZ(i * 2, cur[ed.a * 3], cur[ed.a * 3 + 1], cur[ed.a * 3 + 2]);
      pos.setXYZ(i * 2 + 1, cur[ed.b * 3], cur[ed.b * 3 + 1], cur[ed.b * 3 + 2]);
      const ca = ed.a === CENTER ? tmpA.set("#ffffff") : tmpA.copy(SRC[data.source[ed.a]]);
      const cb = ed.b === CENTER ? tmpB.set("#9ff7cf") : tmpB.copy(SRC[data.source[ed.b]]);
      const m = w[ed.cls] * gain[ed.cls];
      col.setXYZ(i * 2, ca.r * m, ca.g * m, ca.b * m);
      col.setXYZ(i * 2 + 1, cb.r * m, cb.g * m, cb.b * m);
    });
    pos.needsUpdate = true;
    col.needsUpdate = true;

    // Answer crystal
    const reveal = s <= 2 ? 0 : smooth((s - 2) / 1);
    if (crystal.current) {
      crystal.current.visible = reveal > 0.01;
      crystal.current.scale.setScalar(Math.max(0.001, reveal) * (1 + Math.sin(t * 1.4) * 0.02));
      crystal.current.rotation.set(t * 0.3, t * 0.45, 0);
    }
    if (crystalCore.current) {
      crystalCore.current.visible = reveal > 0.01;
      crystalCore.current.scale.setScalar(Math.max(0.001, reveal) * 0.2);
    }

    // DOM labels: projected from 3D, faded by stage
    const lw = [clamp01(1 - Math.abs(s - 1) * 2.4), clamp01(1 - Math.abs(s - 1) * 2.4), clamp01(1 - Math.abs(s - 1) * 2.4), clamp01((s - 2.6) * 2.5)];
    g.updateWorldMatrix(true, false);
    labels.current.forEach((el, i) => {
      if (!el) return;
      proj.copy(LABEL_POS[i]);
      g.localToWorld(proj);
      proj.project(camera);
      el.style.opacity = String(lw[i]);
      el.style.transform = `translate(${((proj.x + 1) / 2) * vp.width}px, ${((1 - proj.y) / 2) * vp.height}px) translate(-50%, -50%)`;
    });

    if (!announced.current) {
      announced.current = true;
      onFirstFrame();
    }
  });

  return (
    <>
      <color attach="background" args={["#020203"]} />
      <fog attach="fog" args={["#020203", 12, 26]} />
      <ambientLight intensity={0.12} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={4} color="#cfe9ff" position={[-5, 4, 3]} rotation-y={Math.PI / 2.4} scale={[9, 2.5, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#ffffff" position={[0, 7, 0]} rotation-x={Math.PI / 2} scale={[9, 9, 1]} />
        <Lightformer form="rect" intensity={5} color="#a78bfa" position={[6, 1, -3]} rotation-y={-Math.PI / 2.2} scale={[7, 1.4, 1]} />
        <Lightformer form="rect" intensity={3.5} color="#34d399" position={[-3, -4, 4]} rotation-x={-Math.PI / 3} scale={[8, 1.2, 1]} />
        <Lightformer form="ring" intensity={2} color="#38bdf8" position={[0, 0.5, -7]} scale={6} />
      </Environment>

      <group ref={group}>
        <instancedMesh ref={beads} args={[sphere, undefined, N]} frustumCulled={false}>
          <meshPhysicalMaterial
            transmission={low ? 0 : 1}
            transparent={low}
            opacity={low ? 0.55 : 1}
            thickness={0.9}
            roughness={0.06}
            ior={1.5}
            iridescence={0.7}
            iridescenceIOR={1.3}
            clearcoat={1}
            clearcoatRoughness={0.05}
            envMapIntensity={1.4}
            attenuationDistance={1.2}
            attenuationColor="#ffffff"
            color="#ffffff"
          />
        </instancedMesh>
        <instancedMesh ref={cores} args={[sphere, undefined, N]} frustumCulled={false}>
          <meshBasicMaterial toneMapped={false} color="#ffffff" />
        </instancedMesh>

        <lineSegments ref={lines} geometry={edgeGeo} frustumCulled={false}>
          <lineBasicMaterial vertexColors transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </lineSegments>

        <mesh ref={crystal} geometry={ico} visible={false}>
          <meshPhysicalMaterial
            transmission={low ? 0 : 1}
            transparent={low}
            opacity={low ? 0.7 : 1}
            thickness={1.6}
            roughness={0}
            ior={2.0}
            dispersion={0.35}
            iridescence={1}
            clearcoat={1}
            envMapIntensity={2}
            color="#e8fff5"
            attenuationColor="#34d399"
            attenuationDistance={1.1}
          />
        </mesh>
        <mesh ref={crystalCore} geometry={sphere} visible={false}>
          <meshBasicMaterial color={new THREE.Color("#9ff7cf").multiplyScalar(3)} toneMapped={false} />
        </mesh>

      </group>

      <Sparkles count={low ? 30 : 90} scale={[16, 9, 8]} size={2.2} speed={0.25} opacity={0.55} color="#9cc9ff" />

      {!low && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.9} luminanceThreshold={0.62} luminanceSmoothing={0.25} mipmapBlur />
          <ChromaticAberration offset={new THREE.Vector2(0.0006, 0.0008)} radialModulation modulationOffset={0.4} blendFunction={BlendFunction.NORMAL} />
          <Vignette eskil={false} offset={0.2} darkness={0.85} />
          <Noise opacity={0.035} blendFunction={BlendFunction.SOFT_LIGHT} />
          <SMAA />
        </EffectComposer>
      )}
    </>
  );
};

class Boundary extends Component<{ fallback: React.ReactNode; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** CSS stand-in when WebGL is unavailable. */
export const SceneFallback: React.FC = () => (
  <div className="absolute inset-0 grid place-items-center md:pl-[45%]" aria-hidden="true">
    <div className="relative h-72 w-40">
      {Array.from({ length: 18 }, (_, i) => {
        const a = i * 0.5;
        const c = ["#38bdf8", "#a78bfa", "#34d399"][i % 3];
        return (
          <React.Fragment key={i}>
            <span className="absolute h-3 w-3 rounded-full" style={{ left: `${50 + Math.cos(a) * 38}%`, top: `${i * 5.4}%`, background: c, boxShadow: `0 0 14px ${c}` }} />
            <span className="absolute h-3 w-3 rounded-full" style={{ left: `${50 - Math.cos(a) * 38}%`, top: `${i * 5.4}%`, background: c, boxShadow: `0 0 14px ${c}`, opacity: 0.6 }} />
          </React.Fragment>
        );
      })}
    </div>
  </div>
);

function webglOk() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const HelixCanvas: React.FC<{ progress: MotionValue<number>; reduced: boolean; onReady?: () => void }> = ({ progress, reduced, onReady }) => {
  const wrapEl = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [ok] = useState(webglOk);
  const labels = useRef<(HTMLDivElement | null)[]>([]);
  // Phones and very small screens skip refraction + post effects
  const [low] = useState(() => typeof window !== "undefined" && (window.innerWidth < 640 || (navigator.hardwareConcurrency ?? 8) <= 2));

  useEffect(() => {
    const el = wrapEl.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!ok) return <SceneFallback />;
  return (
    <div ref={wrapEl} className="absolute inset-0">
      <Boundary fallback={<SceneFallback />}>
        <Canvas
          dpr={low ? [1, 1.25] : [1, 1.75]}
          camera={{ fov: 32, position: [0, 0.2, 9.6], near: 0.1, far: 50 }}
          gl={{ antialias: false, powerPreference: "high-performance", alpha: false }}
          frameloop={reduced ? "demand" : visible ? "always" : "never"}
          style={{ pointerEvents: "none" }}
        >
          <Scene progress={progress} reduced={reduced} low={low} labels={labels} onFirstFrame={() => onReady?.()} />
        </Canvas>
      </Boundary>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {LABEL_TEXT.map((txt, i) => (
          <div
            key={txt}
            ref={(el) => {
              labels.current[i] = el;
            }}
            style={{ opacity: 0, borderColor: LABEL_COLOR[i] + "66", color: LABEL_COLOR[i] }}
            className="absolute left-0 top-0 whitespace-nowrap rounded-full border bg-black/55 px-3 py-1 text-[12px] font-medium backdrop-blur-md will-change-transform"
          >
            {txt}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HelixCanvas;
