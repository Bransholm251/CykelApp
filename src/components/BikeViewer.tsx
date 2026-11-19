/**
 * 3D-visning af cyklen med trykbare dele.
 *
 * Drejning: vi bruger en egen, begrænset "orbit"-styring (vandret drej + lidt hældning,
 * ingen zoom/pan) i stedet for OrbitControls, så vi selv kan afgøre, hvornår gesten
 * er vores. Vandrette træk drejer cyklen; lodrette træk overlades til siden, så
 * 3D-visningen aldrig blokerer scroll.
 *
 * Markører: forankringspunkterne aflæses fra modellen (objekter med navnet
 * "<meshName>_anchor", ellers delens midtpunkt) og projiceres til skærmkoordinater,
 * så markørerne kan være almindelige, tilgængelige React Native-knapper.
 */
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, LayoutChangeEvent, PanResponder, StyleSheet, Text, View } from 'react-native';
import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import { Box3, Camera, Color, Euler, Group, Material, Matrix4, Mesh, Object3D, Raycaster, Vector2, Vector3 } from 'three';
import { Rotate3d } from 'lucide-react-native';
import type { Part } from '@/types';
import { colors, fonts } from '@/theme';
import { PartHotspot } from './PartHotspot';
import { BIKE_MODEL, PrimitiveBike } from './bike';
import { GlbBike } from './bike/GlbBike';

const INITIAL = { yaw: -0.35, pitch: 0.12 };
const PITCH_MIN = -0.2;
const PITCH_MAX = 0.4;
const CAMERA = { position: [0, 0.05, 2.75] as [number, number, number], fov: 34 };
const HIGHLIGHT = new Color(colors.accent);
const BLACK = new Color(0, 0, 0);

type Anchors = Record<string, Vector3>;

interface Bridge {
  invalidate(): void;
  camera: Camera;
  root: Group;
}

interface Props {
  parts: Part[];
  selectedPartId: string;
  onSelectPart(partId: string): void;
  /** true mens brugeren drejer cyklen – bruges til at slå scroll fra imens. */
  onRotatingChange?(rotating: boolean): void;
  height?: number;
}

export function BikeViewer({ parts, selectedPartId, onSelectPart, onRotatingChange, height = 270 }: Props) {
  const rotation = useRef({ ...INITIAL });
  const [view, setView] = useState({ ...INITIAL });
  const [size, setSize] = useState({ w: 0, h: height });
  const [anchors, setAnchors] = useState<Anchors | null>(null);
  const bridge = useRef<Bridge | null>(null);
  const container = useRef<React.ComponentRef<typeof View>>(null);
  const origin = useRef({ x: 0, y: 0 });
  const rafPending = useRef(false);

  const meshNames = useMemo(() => parts.map((p) => p.meshName), [parts]);
  const selectedMesh = parts.find((p) => p.id === selectedPartId)?.meshName;

  const partsRef = useRef(parts);
  partsRef.current = parts;
  const onSelectRef = useRef(onSelectPart);
  onSelectRef.current = onSelectPart;
  const onRotRef = useRef(onRotatingChange);
  onRotRef.current = onRotatingChange;

  const pick = useCallback((x: number, y: number) => {
    const b = bridge.current;
    if (!b || !size.w) return;
    const ndc = new Vector2((x / size.w) * 2 - 1, -(y / size.h) * 2 + 1);
    const ray = new Raycaster();
    b.root.updateMatrixWorld(true);
    ray.setFromCamera(ndc, b.camera);
    const names = new Set(partsRef.current.map((p) => p.meshName));
    for (const hit of ray.intersectObject(b.root, true)) {
      let o: Object3D | null = hit.object;
      while (o && !names.has(o.name)) o = o.parent;
      if (o) {
        const part = partsRef.current.find((p) => p.meshName === o!.name);
        if (part) onSelectRef.current(part.id);
        return;
      }
    }
  }, [size]);
  const pickRef = useRef(pick);
  pickRef.current = pick;

  const responder = useMemo(() => {
    let start = { ...INITIAL };
    let rotating = false;
    const end = () => {
      if (rotating) onRotRef.current?.(false);
      rotating = false;
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      // Stjæl gesten fra en markør, hvis brugeren trækker vandret.
      onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.2,
      onPanResponderGrant: () => {
        start = { ...rotation.current };
        rotating = false;
        container.current?.measure((_x, _y, _w, _h, pageX, pageY) => {
          origin.current = { x: pageX, y: pageY };
        });
      },
      onPanResponderMove: (_, g) => {
        if (!rotating) {
          if (Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy) * 1.2) {
            rotating = true;
            onRotRef.current?.(true);
          } else return;
        }
        rotation.current = {
          yaw: start.yaw + g.dx * 0.011,
          pitch: Math.min(PITCH_MAX, Math.max(PITCH_MIN, start.pitch + g.dy * 0.004)),
        };
        bridge.current?.invalidate();
        if (!rafPending.current) {
          rafPending.current = true;
          requestAnimationFrame(() => {
            rafPending.current = false;
            setView({ ...rotation.current });
          });
        }
      },
      // Lad ScrollView overtage lodrette træk, så længe vi ikke drejer.
      onPanResponderTerminationRequest: () => !rotating,
      onPanResponderRelease: (e, g) => {
        if (!rotating && Math.abs(g.dx) < 8 && Math.abs(g.dy) < 8) {
          pickRef.current(e.nativeEvent.pageX - origin.current.x, e.nativeEvent.pageY - origin.current.y);
        }
        end();
      },
      onPanResponderTerminate: end,
    });
  }, []);

  // Projicér forankringspunkter til skærmkoordinater.
  const markers = useMemo(() => {
    const b = bridge.current;
    if (!anchors || !b || !size.w) return [];
    b.camera.updateMatrixWorld();
    const m = new Matrix4().makeRotationFromEuler(new Euler(view.pitch, view.yaw, 0));
    return parts.flatMap((part) => {
      const a = anchors[part.meshName];
      if (!a) return [];
      const world = a.clone().applyMatrix4(m);
      const p = world.clone().project(b.camera);
      return [{ part, x: ((p.x + 1) / 2) * size.w, y: ((1 - p.y) / 2) * size.h, behind: world.z < -0.02 }];
    });
  }, [anchors, view, size, parts]);

  const selectedMarker = markers.find((mk) => mk.part.id === selectedPartId);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height: h } = e.nativeEvent.layout;
    setSize({ w: width, h });
  };

  return (
    <View ref={container} style={[styles.wrap, { height }]} onLayout={onLayout} {...responder.panHandlers}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {size.w > 0 ? (
          <Canvas
            style={{ flex: 1 }}
            frameloop="demand"
            camera={CAMERA}
            gl={{ antialias: true }}
            shadows={false}
            onCreated={(state) => state.gl.setClearColor('#FFFFFF', 1)}
          >
            <ambientLight intensity={1.1} />
            <directionalLight position={[2, 3, 2]} intensity={1.6} />
            <directionalLight position={[-2, 1, -2]} intensity={0.5} />
            <Suspense fallback={null}>
              <Scene
                rotation={rotation}
                meshNames={meshNames}
                selectedMesh={selectedMesh}
                onReady={(b, a) => {
                  bridge.current = b;
                  setAnchors(a);
                }}
              />
            </Suspense>
          </Canvas>
        ) : null}
      </View>

      {!anchors ? (
        <View style={styles.loading} pointerEvents="none">
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : null}

      {markers.map((mk) => (
        <PartHotspot
          key={mk.part.id}
          label={mk.part.name}
          x={mk.x}
          y={mk.y}
          behind={mk.behind}
          selected={mk.part.id === selectedPartId}
          onPress={() => onSelectPart(mk.part.id)}
        />
      ))}

      {selectedMarker ? <NameBubble name={selectedMarker.part.name} x={selectedMarker.x} y={selectedMarker.y} width={size.w} /> : null}

      <View style={styles.hint} pointerEvents="none">
        <Rotate3d size={14} color={colors.textSecondary} />
        <Text style={styles.hintText}>Træk for at dreje 3D</Text>
      </View>
    </View>
  );
}

function NameBubble({ name, x, y, width }: { name: string; x: number; y: number; width: number }) {
  const bubbleW = Math.max(72, name.length * 8 + 24);
  const left = Math.min(Math.max(8, x - bubbleW / 2), width - bubbleW - 8);
  const above = y > 50;
  return (
    <View
      pointerEvents="none"
      importantForAccessibility="no"
      accessibilityElementsHidden
      style={[styles.bubble, { width: bubbleW, left, top: above ? y - 46 : y + 18 }]}
    >
      <Text style={styles.bubbleText} numberOfLines={1}>{name}</Text>
    </View>
  );
}

/** Indhold i Canvas: modellen, rotation, highlight og udlæsning af forankringspunkter. */
function Scene({
  rotation,
  meshNames,
  selectedMesh,
  onReady,
}: {
  rotation: React.RefObject<{ yaw: number; pitch: number }>;
  meshNames: string[];
  selectedMesh?: string;
  onReady(bridge: Bridge, anchors: Anchors): void;
}) {
  const root = useRef<Group>(null);
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);

  useFrame(() => {
    const r = root.current;
    if (!r) return;
    r.rotation.set(rotation.current.pitch, rotation.current.yaw, 0);
  });

  // Aflæs forankringspunkter (i root-koordinater, uden rotation).
  useEffect(() => {
    const r = root.current;
    if (!r) return;
    r.rotation.set(0, 0, 0);
    r.updateMatrixWorld(true);
    const anchors: Anchors = {};
    for (const name of meshNames) {
      const anchor = r.getObjectByName(`${name}_anchor`);
      const obj = anchor ?? r.getObjectByName(name);
      if (!obj) continue;
      const world = anchor ? anchor.getWorldPosition(new Vector3()) : new Box3().setFromObject(obj).getCenter(new Vector3());
      anchors[name] = r.worldToLocal(world);
    }
    onReady({ invalidate, camera, root: r }, anchors);
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meshNames.join(',')]);

  // Svag highlight på den valgte del.
  useEffect(() => {
    const r = root.current;
    if (!r) return;
    const names = new Set(meshNames);
    r.traverse((o) => {
      const mesh = o as Mesh;
      if (!mesh.isMesh) return;
      let p: Object3D | null = mesh;
      while (p && !names.has(p.name)) p = p.parent;
      const on = Boolean(p && p.name === selectedMesh);
      const mats = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as (Material & {
        emissive?: Color;
        emissiveIntensity?: number;
        userData: { baseEmissive?: Color; baseIntensity?: number };
      })[];
      for (const mat of mats) {
        if (!mat.emissive) continue;
        if (!mat.userData.baseEmissive) {
          mat.userData.baseEmissive = mat.emissive.clone();
          mat.userData.baseIntensity = mat.emissiveIntensity ?? 1;
        }
        if (on) {
          mat.emissive.copy(HIGHLIGHT);
          mat.emissiveIntensity = 0.45;
        } else {
          mat.emissive.copy(mat.userData.baseEmissive ?? BLACK);
          mat.emissiveIntensity = mat.userData.baseIntensity ?? 1;
        }
      }
    });
    invalidate();
  }, [selectedMesh, meshNames, invalidate]);

  return (
    <group ref={root}>
      {BIKE_MODEL != null ? <GlbBike source={BIKE_MODEL} /> : <PrimitiveBike />}
    </group>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#FFFFFF', overflow: 'hidden' },
  loading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  hint: {
    position: 'absolute',
    left: 12,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(244,246,243,0.92)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  hintText: { fontFamily: fonts.medium, fontSize: 12, color: colors.textSecondary },
  bubble: {
    position: 'absolute',
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  bubbleText: { fontFamily: fonts.semibold, fontSize: 13, color: '#FFFFFF' },
});
