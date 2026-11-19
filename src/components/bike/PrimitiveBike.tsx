/**
 * Midlertidig low-poly cykel bygget af primitive former.
 *
 * Hver klikbar del er en <group> med samme navn som Part.meshName i seed-data
 * (tires, brakes, chain, gears, saddle, handlebar, lights, pedals).
 * Et tomt objekt med navnet "<meshName>_anchor" bestemmer, hvor markøren vises.
 * En rigtig .glb-model skal følge samme navngivning – se README.
 *
 * Koordinater: x = cyklens længderetning (+x = forhjul), y = op, z = sideretning.
 */
import React, { useMemo } from 'react';
import { Quaternion, Vector3 } from 'three';
import { colors } from '@/theme';

type V3 = [number, number, number];

// Farver fra temaet: stel i sage, hjul og komponenter i grafit (text).
const COLOR = {
  frame: colors.sage,
  tire: colors.text,
  rim: colors.text,
  metal: colors.text,
  dark: colors.text,
  saddle: colors.text,
  light: colors.surface,
  lightGlow: colors.accentTint,
  rearLight: colors.bikeRearLight,
  brake: colors.text,
};

const UP = new Vector3(0, 1, 0);

/** Cylinder mellem to punkter. */
function Tube({ from, to, r = 0.022, color = COLOR.frame }: { from: V3; to: V3; r?: number; color?: string }) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new Vector3(...from);
    const b = new Vector3(...to);
    const dir = b.clone().sub(a);
    return {
      position: a.clone().add(b).multiplyScalar(0.5),
      quaternion: new Quaternion().setFromUnitVectors(UP, dir.clone().normalize()),
      length: dir.length(),
    };
  }, [from, to]);
  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[r, r, length, 8]} />
      <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
    </mesh>
  );
}

function Box({ position, size, color, rotation }: { position: V3; size: V3; color: string; rotation?: V3 }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
}

function Anchor({ name, position }: { name: string; position: V3 }) {
  return <object3D name={`${name}_anchor`} position={position} />;
}

// Nøglepunkter i stellet
const REAR_HUB: V3 = [-0.56, 0.34, 0];
const FRONT_HUB: V3 = [0.56, 0.34, 0];
const BB: V3 = [-0.06, 0.3, 0]; // krankboks
const SEAT_CLUSTER: V3 = [-0.2, 0.78, 0];
const HEAD_TOP: V3 = [0.4, 0.8, 0];
const HEAD_BOTTOM: V3 = [0.44, 0.66, 0];

function Wheel({ center }: { center: V3 }) {
  const spokes = useMemo(() => Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 8), []);
  return (
    <group position={center}>
      <mesh>
        <torusGeometry args={[0.31, 0.034, 8, 32]} />
        <meshStandardMaterial color={COLOR.tire} roughness={0.9} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.275, 0.012, 6, 32]} />
        <meshStandardMaterial color={COLOR.rim} metalness={0.4} roughness={0.4} />
      </mesh>
      {spokes.map((a) => (
        <mesh key={a} rotation={[0, 0, a]}>
          <cylinderGeometry args={[0.004, 0.004, 0.54, 4]} />
          <meshStandardMaterial color={COLOR.rim} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.1, 10]} />
        <meshStandardMaterial color={COLOR.metal} />
      </mesh>
    </group>
  );
}

export function PrimitiveBike() {
  return (
    // Flyt cyklen, så dens midte ligger i origo (drejepunktet).
    <group position={[0, -0.5, 0]}>
      {/* Stel (ikke klikbart) */}
      <group name="frame">
        <Tube from={BB} to={SEAT_CLUSTER} r={0.024} />
        <Tube from={SEAT_CLUSTER} to={HEAD_TOP} r={0.022} />
        <Tube from={BB} to={HEAD_BOTTOM} r={0.026} />
        <Tube from={HEAD_BOTTOM} to={HEAD_TOP} r={0.028} />
        <Tube from={[BB[0], BB[1], 0.04]} to={[REAR_HUB[0], REAR_HUB[1], 0.05]} r={0.013} />
        <Tube from={[BB[0], BB[1], -0.04]} to={[REAR_HUB[0], REAR_HUB[1], -0.05]} r={0.013} />
        <Tube from={[SEAT_CLUSTER[0], SEAT_CLUSTER[1], 0.02]} to={[REAR_HUB[0], REAR_HUB[1], 0.05]} r={0.011} />
        <Tube from={[SEAT_CLUSTER[0], SEAT_CLUSTER[1], -0.02]} to={[REAR_HUB[0], REAR_HUB[1], -0.05]} r={0.011} />
        <Tube from={[HEAD_BOTTOM[0], HEAD_BOTTOM[1], 0.04]} to={[FRONT_HUB[0], FRONT_HUB[1], 0.05]} r={0.014} color={COLOR.metal} />
        <Tube from={[HEAD_BOTTOM[0], HEAD_BOTTOM[1], -0.04]} to={[FRONT_HUB[0], FRONT_HUB[1], -0.05]} r={0.014} color={COLOR.metal} />
      </group>

      {/* Dæk & hjul */}
      <group name="tires">
        <Wheel center={REAR_HUB} />
        <Wheel center={FRONT_HUB} />
        <Anchor name="tires" position={[FRONT_HUB[0] + 0.22, FRONT_HUB[1] - 0.22, 0.04]} />
      </group>

      {/* Bremser: klodser ved for- og baghjul + greb på styret */}
      <group name="brakes">
        <Box position={[0.47, 0.64, 0.05]} size={[0.06, 0.05, 0.02]} color={COLOR.brake} />
        <Box position={[0.47, 0.64, -0.05]} size={[0.06, 0.05, 0.02]} color={COLOR.brake} />
        <Box position={[-0.36, 0.62, 0.05]} size={[0.06, 0.05, 0.02]} color={COLOR.brake} />
        <Box position={[-0.36, 0.62, -0.05]} size={[0.06, 0.05, 0.02]} color={COLOR.brake} />
        <Box position={[0.43, 0.96, 0.17]} size={[0.1, 0.015, 0.025]} color={COLOR.dark} rotation={[0, 0.2, -0.3]} />
        <Anchor name="brakes" position={[0.47, 0.64, 0.07]} />
      </group>

      {/* Kæde: øvre og nedre løb mellem klinge og tandhjul */}
      <group name="chain">
        <Tube from={[BB[0], BB[1] + 0.1, 0.07]} to={[REAR_HUB[0], REAR_HUB[1] + 0.05, 0.07]} r={0.008} color={COLOR.dark} />
        <Tube from={[BB[0], BB[1] - 0.1, 0.07]} to={[REAR_HUB[0], REAR_HUB[1] - 0.05, 0.07]} r={0.008} color={COLOR.dark} />
        <Anchor name="chain" position={[-0.3, 0.38, 0.08]} />
      </group>

      {/* Gear: forklinge, kassette og bagskifter */}
      <group name="gears">
        <mesh position={[BB[0], BB[1], 0.07]}>
          <torusGeometry args={[0.1, 0.012, 6, 24]} />
          <meshStandardMaterial color={COLOR.metal} metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[REAR_HUB[0], REAR_HUB[1], 0.07]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.055, 0.055, 0.03, 14]} />
          <meshStandardMaterial color={COLOR.metal} metalness={0.5} roughness={0.4} />
        </mesh>
        <Box position={[REAR_HUB[0] + 0.01, REAR_HUB[1] - 0.1, 0.08]} size={[0.04, 0.09, 0.02]} color={COLOR.dark} />
        <Anchor name="gears" position={[REAR_HUB[0] + 0.01, REAR_HUB[1] - 0.12, 0.09]} />
      </group>

      {/* Sadel + sadelpind */}
      <group name="saddle">
        <Tube from={SEAT_CLUSTER} to={[-0.23, 0.93, 0]} r={0.014} color={COLOR.metal} />
        <Box position={[-0.24, 0.955, 0]} size={[0.26, 0.045, 0.11]} color={COLOR.saddle} />
        <Anchor name="saddle" position={[-0.24, 1.0, 0]} />
      </group>

      {/* Styr + frempind */}
      <group name="handlebar">
        <Tube from={HEAD_TOP} to={[0.38, 0.94, 0]} r={0.016} color={COLOR.metal} />
        <mesh position={[0.37, 0.95, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.013, 0.013, 0.46, 8]} />
          <meshStandardMaterial color={COLOR.metal} />
        </mesh>
        <mesh position={[0.37, 0.95, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.08, 8]} />
          <meshStandardMaterial color={COLOR.dark} />
        </mesh>
        <mesh position={[0.37, 0.95, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.08, 8]} />
          <meshStandardMaterial color={COLOR.dark} />
        </mesh>
        <Anchor name="handlebar" position={[0.36, 0.99, -0.12]} />
      </group>

      {/* Lys: forlygte på styret og baglygte under sadlen */}
      <group name="lights">
        <mesh position={[0.47, 0.88, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.025, 0.06, 10]} />
          <meshStandardMaterial color={COLOR.light} emissive={COLOR.lightGlow} emissiveIntensity={0.15} />
        </mesh>
        <Box position={[-0.24, 0.86, 0]} size={[0.03, 0.04, 0.04]} color={COLOR.rearLight} />
        <Anchor name="lights" position={[0.52, 0.88, 0]} />
      </group>

      {/* Pedaler + krank */}
      <group name="pedals">
        <Tube from={[BB[0], BB[1], 0.09]} to={[BB[0] + 0.05, BB[1] - 0.16, 0.09]} r={0.012} color={COLOR.metal} />
        <Tube from={[BB[0], BB[1], -0.09]} to={[BB[0] - 0.05, BB[1] + 0.16, -0.09]} r={0.012} color={COLOR.metal} />
        <Box position={[BB[0] + 0.05, BB[1] - 0.16, 0.14]} size={[0.09, 0.02, 0.07]} color={COLOR.dark} />
        <Box position={[BB[0] - 0.05, BB[1] + 0.16, -0.14]} size={[0.09, 0.02, 0.07]} color={COLOR.dark} />
        <Anchor name="pedals" position={[BB[0] + 0.05, BB[1] - 0.18, 0.15]} />
      </group>
    </group>
  );
}
