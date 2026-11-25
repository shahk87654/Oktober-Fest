"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { FitPreference, Gender } from "@/lib/size-types";

type FitAvatar3DProps = {
  gender: Gender;
  activeMeasurement?: string;
  measurements?: Record<string, number>;
  bodyShape?: string;
  fitPreference?: FitPreference;
  unit?: "metric" | "imperial";
};

const forest = 0x183c30;
const ivory = 0xf7f2e8;
const amber = 0xc99a48;
const burgundy = 0x792d38;

function makeMaterial(color: number, roughness = 0.6) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.06 });
}

function addCapsule(
  parent: THREE.Group,
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number,
  material: THREE.Material,
) {
  const length = start.distanceTo(end);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.82, radius, length, 14), material);
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize());
  parent.add(mesh);
}

function addEllipsoid(
  parent: THREE.Group,
  position: [number, number, number],
  scale: [number, number, number],
  material: THREE.Material,
) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  parent.add(mesh);
}

function measurementRing(
  parent: THREE.Group,
  name: string,
  y: number,
  radius: number,
  activeMeasurement: string | undefined,
) {
  const active = activeMeasurement === name;
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, active ? 0.022 : 0.009, 8, 72),
    new THREE.MeshBasicMaterial({
      color: active ? amber : ivory,
      transparent: true,
      opacity: active ? 0.95 : 0.26,
    }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = y;
  parent.add(ring);
}

function measurementLine(parent: THREE.Group, points: THREE.Vector3[], active: boolean) {
  const curve = new THREE.CatmullRomCurve3(points);
  const line = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 28, active ? 0.018 : 0.007, 6, false),
    new THREE.MeshBasicMaterial({
      color: active ? amber : ivory,
      transparent: true,
      opacity: active ? 0.96 : 0.24,
    }),
  );
  parent.add(line);
}

function disposeObject(object: THREE.Object3D) {
  if (!(object instanceof THREE.Mesh) && !(object instanceof THREE.LineSegments)) return;
  object.geometry.dispose();
  const materials = Array.isArray(object.material) ? object.material : [object.material];
  materials.forEach((material) => material.dispose());
}

const measurementNames: Record<string, string> = {
  height: "Height",
  bust: "Bust",
  underbust: "Underbust",
  chest: "Chest",
  waist: "Waist",
  high_hip: "High hip",
  hip: "Hip",
  shoulder: "Shoulder width",
  back_length: "Back length",
  arm_length: "Arm length",
  sleeve_length: "Sleeve length",
  inseam: "Inseam",
  outseam: "Outseam",
  neck: "Neck",
};

function createFigure(
  gender: Gender,
  activeMeasurement?: string,
  measurements?: Record<string, number>,
  bodyShape?: string,
  fitPreference: FitPreference = "regular",
) {
  const group = new THREE.Group();
  const body = new THREE.Group();
  group.add(body);
  const isWomen = gender === "women";
  const figureMaterial = makeMaterial(ivory, 0.48);
  const clothMaterial = makeMaterial(isWomen ? burgundy : forest, 0.7);
  const accentMaterial = makeMaterial(amber, 0.42);
  const bustValue = measurements?.bust ?? measurements?.chest ?? (isWomen ? 92 : 102);
  const waistValue = measurements?.waist ?? (isWomen ? 76 : 88);
  const hipValue = measurements?.hip ?? (isWomen ? 98 : 100);
  const shoulderValue = measurements?.shoulder ?? (isWomen ? 40 : 46);
  const shapeShoulder = isWomen
    ? bodyShape === "inverted-triangle" ? 1.12 : bodyShape === "pear" ? 0.94 : 1
    : bodyShape === "broad" || bodyShape === "athletic" ? 1.12 : bodyShape === "round" ? 0.96 : 1;
  const shapeWaist = isWomen
    ? bodyShape === "hourglass" ? 0.88 : bodyShape === "apple" ? 1.12 : bodyShape === "pear" ? 0.96 : 1
    : bodyShape === "round" ? 1.14 : bodyShape === "athletic" ? 0.94 : 1;
  const shapeHip = isWomen
    ? bodyShape === "pear" ? 1.12 : bodyShape === "hourglass" ? 1.08 : bodyShape === "inverted-triangle" ? 0.94 : 1
    : bodyShape === "round" ? 1.08 : bodyShape === "athletic" ? 0.96 : 1;
  const chestScale = THREE.MathUtils.clamp(bustValue / (isWomen ? 92 : 102), 0.84, 1.2);
  const waistScale = THREE.MathUtils.clamp((waistValue / (isWomen ? 76 : 88)) * shapeWaist, 0.8, 1.24);
  const hipScale = THREE.MathUtils.clamp((hipValue / (isWomen ? 98 : 100)) * shapeHip, 0.82, 1.2);
  const shoulderScale = THREE.MathUtils.clamp((shoulderValue / (isWomen ? 40 : 46)) * shapeShoulder, 0.86, 1.18);
  const ease = fitPreference === "relaxed" ? 1.08 : fitPreference === "fitted" ? 0.97 : 1;
  const shoulderWidth = (isWomen ? 0.34 : 0.4) * shoulderScale;
  const chestWidth = (isWomen ? 0.29 : 0.32) * chestScale * ease;
  const hipWidth = (isWomen ? 0.35 : 0.31) * hipScale * ease;
  const heightScale = THREE.MathUtils.clamp((measurements?.height ?? 170) / 170, 0.8, 1.2);
  body.scale.y = heightScale;
  body.position.y = 0.61 * (heightScale - 1);

  addEllipsoid(body, [0, 2.44, 0], [0.19, 0.24, 0.18], figureMaterial);
  addCapsule(body, new THREE.Vector3(0, 2.1, 0), new THREE.Vector3(0, 2.27, 0), isWomen ? 0.085 : 0.105, figureMaterial);

  addEllipsoid(body, [0, 1.83, 0], [shoulderWidth, isWomen ? 0.31 : 0.36, isWomen ? 0.2 : 0.23], clothMaterial);
  addEllipsoid(body, [0, 1.56, 0], [chestWidth, isWomen ? 0.26 : 0.32, isWomen ? 0.19 : 0.22], clothMaterial);
  if (isWomen) {
    const bustRadius = THREE.MathUtils.clamp(chestScale, 0.88, 1.18);
    for (const side of [-1, 1]) {
      addEllipsoid(body, [side * 0.115 * bustRadius, 1.7, 0.155], [0.12 * bustRadius, 0.12 * bustRadius, 0.075], clothMaterial);
    }
  }
  addEllipsoid(body, [0, 1.28, 0], [(isWomen ? 0.235 : 0.29) * waistScale * ease, 0.25, 0.18], clothMaterial);
  addEllipsoid(body, [0, 0.94, 0], [hipWidth, isWomen ? 0.31 : 0.27, isWomen ? 0.23 : 0.21], isWomen ? clothMaterial : figureMaterial);
  addEllipsoid(body, [0, 0.7, 0], [isWomen ? 0.39 * hipScale * ease : 0.3 * hipScale * ease, isWomen ? 0.24 : 0.2, isWomen ? 0.24 : 0.2], clothMaterial);

  const armRadius = isWomen ? 0.075 : 0.095;
  for (const side of [-1, 1]) {
    addCapsule(
      body,
      new THREE.Vector3(side * shoulderWidth * 0.8, 1.98, 0),
      new THREE.Vector3(side * 0.46, 1.4, 0.02),
      armRadius,
      figureMaterial,
    );
    addCapsule(
      body,
      new THREE.Vector3(side * 0.46, 1.4, 0.02),
      new THREE.Vector3(side * 0.48, 0.98, 0.03),
      armRadius * 0.82,
      figureMaterial,
    );
    addEllipsoid(body, [side * 0.48, 0.92, 0.03], [0.06, 0.1, 0.055], accentMaterial);

    addCapsule(
      body,
      new THREE.Vector3(side * 0.15, 0.7, 0),
      new THREE.Vector3(side * 0.18, 0.18, 0.01),
      0.13 * hipScale,
      clothMaterial,
    );
    addCapsule(
      body,
      new THREE.Vector3(side * 0.18, 0.2, 0.01),
      new THREE.Vector3(side * 0.19, -0.56, 0.02),
      0.09,
      figureMaterial,
    );
    addEllipsoid(body, [side * 0.19, -0.61, 0.1], [0.105, 0.06, 0.2], accentMaterial);
  }

  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.012, 8, 28), accentMaterial);
  collar.position.set(0, 2.16, 0);
  collar.rotation.x = Math.PI / 2;
  body.add(collar);

  measurementRing(body, "bust", 1.75, 0.39 * chestScale, activeMeasurement);
  measurementRing(body, "chest", 1.75, 0.42 * chestScale, activeMeasurement);
  measurementRing(body, "underbust", 1.56, 0.32 * chestScale, activeMeasurement);
  measurementRing(body, "waist", 1.28, 0.27 * waistScale, activeMeasurement);
  measurementRing(body, "high_hip", 1.07, 0.34 * hipScale, activeMeasurement);
  measurementRing(body, "hip", 0.9, 0.39 * hipScale, activeMeasurement);
  measurementRing(body, "shoulder", 2, shoulderWidth + 0.05, activeMeasurement);
  measurementRing(body, "neck", 2.15, 0.13, activeMeasurement);
  measurementLine(body, [
    new THREE.Vector3(0.57, 2.45, 0.03),
    new THREE.Vector3(0.57, 1.65, 0.03),
    new THREE.Vector3(0.57, 0.82, 0.03),
    new THREE.Vector3(0.57, -0.58, 0.03),
  ], activeMeasurement === "height");
  measurementLine(body, [
    new THREE.Vector3(0, 2.13, -0.22),
    new THREE.Vector3(0, 1.75, -0.23),
    new THREE.Vector3(0, 1.28, -0.2),
  ], activeMeasurement === "back_length");
  measurementLine(body, [
    new THREE.Vector3(shoulderWidth, 1.98, 0),
    new THREE.Vector3(0.46, 1.4, 0.02),
    new THREE.Vector3(0.48, 0.98, 0.03),
  ], activeMeasurement === "sleeve_length" || activeMeasurement === "arm_length");
  measurementLine(body, [
    new THREE.Vector3(-0.15, 0.68, 0),
    new THREE.Vector3(-0.18, 0.18, 0.01),
    new THREE.Vector3(-0.19, -0.56, 0.02),
  ], activeMeasurement === "inseam");
  measurementLine(body, [
    new THREE.Vector3(-0.34, 0.72, 0),
    new THREE.Vector3(-0.35, 0.18, 0.01),
    new THREE.Vector3(-0.29, -0.56, 0.02),
  ], activeMeasurement === "outseam");
  measurementLine(body, [
    new THREE.Vector3(-shoulderWidth, 2, 0),
    new THREE.Vector3(shoulderWidth, 2, 0),
  ], activeMeasurement === "shoulder");

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(0.86, 0.008, 6, 90),
    new THREE.MeshBasicMaterial({ color: amber, transparent: true, opacity: 0.56 }),
  );
  halo.rotation.x = Math.PI / 2;
  halo.position.y = -0.68;
  group.add(halo);
  return group;
}

export function FitAvatar3D({
  gender,
  activeMeasurement,
  measurements,
  bodyShape,
  fitPreference = "regular",
  unit = "metric",
}: FitAvatar3DProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const dragRef = useRef({ active: false, lastX: 0, lastY: 0 });
  const autoRotateRef = useRef(true);
  const [view, setView] = useState<"front" | "side" | "back">("front");
  const initialFigure = useRef({ gender, activeMeasurement, measurements, bodyShape, fitPreference });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(forest);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 30);
    camera.position.set(0, 1.1, 5.3);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      host.dataset.webglUnavailable = "true";
      host.setAttribute("role", "status");
      host.setAttribute("aria-label", "Interactive 3D is unavailable on this device. Your size recommendation will still work.");
      return;
    }
    delete host.dataset.webglUnavailable;
    host.setAttribute("role", "application");
    host.setAttribute("aria-label", "Drag to rotate the three-dimensional fit model");
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xfff6e5, 0x183c30, 2.2));
    const keyLight = new THREE.DirectionalLight(0xffedcf, 3.2);
    keyLight.position.set(-3, 5, 4);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(amber, 95, 10);
    rimLight.position.set(2, 2.7, -2);
    scene.add(rimLight);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(1.05, 64),
      new THREE.MeshStandardMaterial({ color: 0x254a3c, roughness: 0.82, metalness: 0.05 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.76;
    scene.add(floor);
    const grid = new THREE.GridHelper(5, 24, amber, 0x315747);
    grid.position.y = -0.75;
    const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material];
    gridMaterials.forEach((material) => {
      material.transparent = true;
      material.opacity = 0.2;
    });
    scene.add(grid);

    const model = createFigure(
      initialFigure.current.gender,
      initialFigure.current.activeMeasurement,
      initialFigure.current.measurements,
      initialFigure.current.bodyShape,
      initialFigure.current.fitPreference,
    );
    modelRef.current = model;
    scene.add(model);

    const resizeObserver = new ResizeObserver(() => {
      if (!host.clientWidth || !host.clientHeight) return;
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    });
    resizeObserver.observe(host);

    let frame = 0;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animate = () => {
      frame = window.requestAnimationFrame(animate);
      if (autoRotateRef.current && !dragRef.current.active && !prefersReducedMotion) model.rotation.y += 0.0015;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      scene.traverse(disposeObject);
      renderer.dispose();
      renderer.domElement.remove();
      modelRef.current = null;
    };
  }, []);

  useEffect(() => {
    const model = modelRef.current;
    if (!model) return;
    const freshModel = createFigure(gender, activeMeasurement, measurements, bodyShape, fitPreference);
    const oldBody = model.children[0];
    const oldHalo = model.children[1];
    if (oldBody) {
      model.remove(oldBody);
      oldBody.traverse(disposeObject);
    }
    if (oldHalo) {
      model.remove(oldHalo);
      oldHalo.traverse(disposeObject);
    }
    freshModel.children.forEach((child) => {
      if (child instanceof THREE.Group) {
        model.add(child);
      } else {
        model.add(child);
      }
    });
  }, [gender, activeMeasurement, measurements, bodyShape, fitPreference]);

  const measurementName = activeMeasurement
    ? measurementNames[activeMeasurement] ?? activeMeasurement.replaceAll("_", " ")
    : "Body proportions";
  const measurementValue = activeMeasurement ? measurements?.[activeMeasurement] : undefined;
  const shownValue = typeof measurementValue === "number"
    ? `${(unit === "imperial" ? measurementValue / 2.54 : measurementValue).toFixed(1)} ${unit === "imperial" ? "in" : "cm"}`
    : "Add measurement";
  const shapeLabel = bodyShape ? bodyShape.replaceAll("-", " ") : "not set";
  const fitLabel = fitPreference === "fitted" ? "Close" : fitPreference === "relaxed" ? "Relaxed" : "Classic";

  const setOrientation = (next: "front" | "side" | "back") => {
    setView(next);
    autoRotateRef.current = next === "front";
    if (modelRef.current) {
      const target = next === "front" ? 0 : next === "side" ? Math.PI / 2 : Math.PI;
      modelRef.current.rotation.y = target;
    }
  };

  return (
    <section className="fit-avatar-shell" aria-label="Interactive three-dimensional fit model">
      <div className="fit-avatar-topline">
        <span><i /> LIVE FIT MODEL</span>
        <span>3D · DRAG / ARROWS</span>
      </div>
      <div
        ref={hostRef}
        className="fit-avatar-canvas"
        onPointerDown={(event) => {
          autoRotateRef.current = false;
          dragRef.current = { active: true, lastX: event.clientX, lastY: event.clientY };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!dragRef.current.active || !modelRef.current) return;
          const dx = event.clientX - dragRef.current.lastX;
          const dy = event.clientY - dragRef.current.lastY;
          modelRef.current.rotation.y += dx * 0.009;
          modelRef.current.rotation.x = THREE.MathUtils.clamp(modelRef.current.rotation.x + dy * 0.003, -0.16, 0.16);
          dragRef.current.lastX = event.clientX;
          dragRef.current.lastY = event.clientY;
        }}
        onPointerUp={(event) => {
          dragRef.current.active = false;
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => { dragRef.current.active = false; }}
        onKeyDown={(event) => {
          if (!modelRef.current) return;
          const directions: Record<string, [number, number]> = {
            ArrowLeft: [-0.16, 0],
            ArrowRight: [0.16, 0],
            ArrowUp: [0, -0.08],
            ArrowDown: [0, 0.08],
          };
          const direction = directions[event.key];
          if (!direction) return;
          event.preventDefault();
          autoRotateRef.current = false;
          modelRef.current.rotation.y += direction[0];
          modelRef.current.rotation.x = THREE.MathUtils.clamp(modelRef.current.rotation.x + direction[1], -0.16, 0.16);
        }}
        role="application"
        aria-label="Interactive fit model. Drag or use arrow keys to rotate."
        aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown"
        tabIndex={0}
      >
        <div className="fit-avatar-measurement">{activeMeasurement?.replaceAll("_", " ") ?? "your silhouette"}</div>
        <div className="fit-avatar-crosshair" aria-hidden="true">+</div>
      </div>
      <div className="fit-avatar-controls" role="group" aria-label="Model view">
        {(["front", "side", "back"] as const).map((angle) => (
          <button type="button" className={view === angle ? "is-active" : ""} key={angle} onClick={() => setOrientation(angle)} aria-pressed={view === angle}>
            {angle}
          </button>
        ))}
        <button type="button" className="fit-avatar-reset" onClick={() => setOrientation("front")} aria-label="Reset model view">
          <RotateCcw size={13} />
        </button>
      </div>
      <div className="fit-avatar-readout">
        <div className="fit-avatar-readout-cell">
          <span>BODY FRAME</span>
          <strong>{gender === "women" ? "Women" : "Men"}</strong>
          <small>{bodyShape ? `${shapeLabel} proportions` : "Shape not set yet"}</small>
        </div>
        <div className="fit-avatar-readout-cell">
          <span>FIT PREFERENCE</span>
          <strong>{fitLabel}</strong>
          <small>Ease profile</small>
        </div>
        <div className="fit-avatar-reading">
          <span>LIVE MEASUREMENT</span>
          <div><strong>{measurementName}</strong><b>{shownValue}</b></div>
        </div>
      </div>
      <p className="fit-avatar-caption">
        Illustrative fit model · updates as you answer · not a body scan.
      </p>
    </section>
  );
}
