/**
 * Indlæser en rigtig cykelmodel (.glb). Se README for navngivning af dele.
 *
 * Brug: læg filen i assets/models/bike.glb og sæt BIKE_MODEL i
 * src/components/bike/index.ts til `require('../../../assets/models/bike.glb')`.
 */
import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei/native';
import { Box3, Mesh, Vector3 } from 'three';

/** Modellen skaleres, så den er ca. så lang som den primitive cykel. */
const TARGET_LENGTH = 1.75;

export function GlbBike({ source }: { source: number | string }) {
  const { scene } = useGLTF(source as string);

  const model = useMemo(() => {
    const root = scene.clone(true);
    // Egne materialer pr. mesh, så highlight ikke smitter af på andre dele.
    root.traverse((o) => {
      if ((o as Mesh).isMesh) {
        const m = o as Mesh;
        m.material = Array.isArray(m.material) ? m.material.map((x) => x.clone()) : m.material.clone();
        m.castShadow = false;
        m.receiveShadow = false;
      }
    });
    // Centrer og skaler.
    const box = new Box3().setFromObject(root);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const scale = TARGET_LENGTH / Math.max(size.x, size.z, 0.0001);
    root.scale.setScalar(scale);
    root.position.copy(center.multiplyScalar(-scale));
    return root;
  }, [scene]);

  return <primitive object={model} />;
}
