import { TOMB_PATH } from "@/lib/shapes";

/** Shared clip paths in objectBoundingBox units, so any element can wear them via CSS. */
export function OrganicDefs() {
  return (
    <svg width="0" height="0" aria-hidden className="absolute">
      <defs>
        {/* weathered tombstone with chipped edges */}
        <clipPath id="clip-tomb" clipPathUnits="objectBoundingBox">
          <path d={TOMB_PATH} />
        </clipPath>
      </defs>
    </svg>
  );
}
