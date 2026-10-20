import * as THREE from "three";

const scratch = new THREE.Vector3();

/** Projects the normalized pointer onto the z = 0 plane in world space. */
export function pointerOnPlane(pointer: THREE.Vector2, camera: THREE.Camera, out: THREE.Vector3): THREE.Vector3 {
  scratch.set(pointer.x, pointer.y, 0.5).unproject(camera).sub(camera.position).normalize();
  const distance = -camera.position.z / scratch.z;
  return out.copy(camera.position).addScaledVector(scratch, distance);
}
