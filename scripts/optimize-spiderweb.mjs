// Shrinks the Blender spider web export for the hero: npm run optimize:spiderweb -- <source.glb> [output.glb]
//
// - drops Blender helpers (the deformer plane and the template dew drop parked off to the side)
// - bakes the thread ribbons (far thinner than a pixel on screen) into their centre lines, drawn as GL lines
// - batches the ~2000 dew drops into one instanced mesh (EXT_mesh_gpu_instancing)
// - compresses the buffers with meshopt (EXT_meshopt_compression), which the site's loader already decodes
//
// Positions are not quantized: quantizing would fold a scale into the node transforms, which the instanced dew can't
// follow, and the breeze shader works in the web's own coordinates.

import { NodeIO, Primitive } from "@gltf-transform/core";
import { ALL_EXTENSIONS, EXTMeshoptCompression } from "@gltf-transform/extensions";
import { dedup, instance, prune } from "@gltf-transform/functions";
import { MeshoptDecoder, MeshoptEncoder } from "meshoptimizer";

const WEB_NODE = "Spiderweb";
const HELPER_NODE = "Deformer Plane";
const DROP_NODE = /^WaterDrp/;

const [source, output = "public/models/spiderweb.glb"] = process.argv.slice(2);
if (!source) {
  console.error("usage: npm run optimize:spiderweb -- <source.glb> [output.glb]");
  process.exit(1);
}

/**
 * Each thread is a ribbon strip of vertex pairs (2n, 2n + 1) whose triangles join neighbouring pairs; the pair midpoints
 * are the thread's centre line, and every triangle that spans two pairs is one line segment.
 */
function ribbonToLines(positions, indices) {
  const pairCount = Math.floor(positions.length / 6);
  const centres = new Float32Array(pairCount * 3);
  for (let pair = 0; pair < pairCount; pair += 1) {
    for (let axis = 0; axis < 3; axis += 1) {
      centres[pair * 3 + axis] = (positions[pair * 6 + axis] + positions[pair * 6 + 3 + axis]) / 2;
    }
  }
  const links = new Set();
  const segments = [];
  for (let corner = 0; corner < indices.length; corner += 3) {
    const pairs = [...new Set([indices[corner], indices[corner + 1], indices[corner + 2]].map((v) => v >> 1))].sort(
      (a, b) => a - b,
    );
    for (let i = 1; i < pairs.length; i += 1) {
      const key = pairs[i - 1] * pairCount + pairs[i];
      if (links.has(key)) continue;
      links.add(key);
      segments.push(pairs[i - 1], pairs[i]);
    }
  }
  const IndexArray = pairCount < 65536 ? Uint16Array : Uint32Array;
  return { centres, segments: IndexArray.from(segments) };
}

/** Rotates vector v by unit quaternion q = [x, y, z, w]. */
function rotate([x, y, z, w], v) {
  const tx = 2 * (y * v[2] - z * v[1]);
  const ty = 2 * (z * v[0] - x * v[2]);
  const tz = 2 * (x * v[1] - y * v[0]);
  return [v[0] + w * tx + (y * tz - z * ty), v[1] + w * ty + (z * tx - x * tz), v[2] + w * tz + (x * ty - y * tx)];
}

/** Hamilton product a * b of quaternions [x, y, z, w]. */
function multiply([ax, ay, az, aw], [bx, by, bz, bw]) {
  return [
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz,
  ];
}

/**
 * instance() parks the dew batch at the scene root with world-space instance transforms. Move it under the web and
 * express each drop in the web's own space (the web node carries only a rotation), so the dew stays with its threads.
 */
function moveDewUnderWeb(webNode) {
  const batch = document.getRoot().listNodes().find((node) => node.getExtension("EXT_mesh_gpu_instancing"));
  if (!batch) throw new Error("instance() made no dew batch");
  if (webNode.getTranslation().some((v) => v !== 0) || webNode.getScale().some((v) => v !== 1)) {
    throw new Error(`"${WEB_NODE}" has a translation or scale; only a rotation is handled`);
  }
  const [qx, qy, qz, qw] = webNode.getRotation();
  const inverse = [-qx, -qy, -qz, qw];
  const instancing = batch.getExtension("EXT_mesh_gpu_instancing");
  const translations = instancing.getAttribute("TRANSLATION");
  const rotations = instancing.getAttribute("ROTATION");
  for (let i = 0; i < translations.getCount(); i += 1) {
    translations.setElement(i, rotate(inverse, translations.getElement(i, [])));
    if (rotations) rotations.setElement(i, multiply(inverse, rotations.getElement(i, [])));
  }
  for (const scene of document.getRoot().listScenes()) scene.removeChild(batch);
  webNode.addChild(batch);
}

await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.encoder": MeshoptEncoder, "meshopt.decoder": MeshoptDecoder });
const document = await io.read(source);
const root = document.getRoot();

for (const node of root.listNodes()) {
  const isStrayDrop = DROP_NODE.test(node.getName()) && !node.getParentNode();
  if (node.getName() === HELPER_NODE || isStrayDrop) node.dispose();
}

const web = root.listNodes().find((node) => node.getName() === WEB_NODE);
const ribbon = web?.getMesh()?.listPrimitives()[0];
const ribbonPositions = ribbon?.getAttribute("POSITION")?.getArray();
const ribbonIndices = ribbon?.getIndices()?.getArray();
if (!ribbon || !ribbonPositions || !ribbonIndices) throw new Error(`${source}: no indexed "${WEB_NODE}" ribbon mesh`);

const { centres, segments } = ribbonToLines(ribbonPositions, ribbonIndices);
const buffer = root.listBuffers()[0];
ribbon
  .setMode(Primitive.Mode.LINES)
  .setAttribute("NORMAL", null)
  .setAttribute("POSITION", document.createAccessor().setType("VEC3").setArray(centres).setBuffer(buffer))
  .setIndices(document.createAccessor().setType("SCALAR").setArray(segments).setBuffer(buffer));

await document.transform(instance({ min: 2 }), prune(), dedup());
moveDewUnderWeb(web);
document
  .createExtension(EXTMeshoptCompression)
  .setRequired(true)
  .setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.FILTER });
await io.write(output, document);
console.log(`wrote ${output}: ${centres.length / 3} thread points, ${segments.length / 2} thread segments`);
