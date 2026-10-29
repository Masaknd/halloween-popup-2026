// Shrinks the gothic house scan for the Witching Hours arch: npm run optimize:house -- <source.glb> [output.glb]
//
// - welds and simplifies the dense scanned mesh (it only fills a ~600px arch, so most of its triangles are sub-pixel)
// - resizes the 4K PNG textures and re-encodes them as WebP (EXT_texture_webp)
// - reorders, quantizes and compresses the buffers with meshopt (EXT_meshopt_compression), which the site's loader decodes

import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, meshopt, prune, simplify, textureCompress, weld } from "@gltf-transform/functions";
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from "meshoptimizer";
import sharp from "sharp";

/** Share of triangles kept, and the largest shape error the simplifier may introduce (as a share of the mesh size). */
const SIMPLIFY = { ratio: 0.1, error: 0.002 };
/** Largest texture edge in pixels; the arch is ~600px tall, so 1K holds its detail at a quarter of 2K's GPU memory. */
const TEXTURE_SIZE = 1024;
const WEBP_QUALITY = 82;

const [source, output = "public/models/gothic-house.glb"] = process.argv.slice(2);
if (!source) {
  console.error("usage: npm run optimize:house -- <source.glb> [output.glb]");
  process.exit(1);
}

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.decoder": MeshoptDecoder, "meshopt.encoder": MeshoptEncoder });

const document = await io.read(source);
await document.transform(
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio: SIMPLIFY.ratio, error: SIMPLIFY.error }),
  textureCompress({ encoder: sharp, targetFormat: "webp", resize: [TEXTURE_SIZE, TEXTURE_SIZE], quality: WEBP_QUALITY }),
  prune(),
  dedup(),
  meshopt({ encoder: MeshoptEncoder, level: "medium" }),
);
await io.write(output, document);

const triangles = document
  .getRoot()
  .listMeshes()
  .flatMap((mesh) => mesh.listPrimitives())
  .reduce((sum, primitive) => sum + (primitive.getIndices()?.getCount() ?? 0) / 3, 0);
console.log(`wrote ${output}: ${Math.round(triangles)} triangles`);
