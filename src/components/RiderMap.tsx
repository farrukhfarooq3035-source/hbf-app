'use client';

import { useMemo } from 'react';

/** Padding in degrees for bbox */
const PADDING = 0.01;

function bboxFromPoints(points: { lat: number; lng: number }[]) {
  if (points.length === 0) return { minLat: 31.52, minLng: 74.35, maxLat: 31.53, maxLng: 74.36 };
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  return {
    minLat: Math.min(...lats) - PADDING,
    minLng: Math.min(...lngs) - PADDING,
    maxLat: Math.max(...lats) + PADDING,
    maxLng: Math.max(...lngs) + PADDING,
  };
}

interface RiderMapProps {
  /** Store position (fixed) */
  storeLat: number;
  storeLng: number;
  /** Rider position (optional - if not set, shows only store) */
  riderLat?: number | null;
  riderLng?: number | null;
  /** Height of map container */
  height?: number;
  className?: string;
}

export function RiderMap({
  storeLat,
  storeLng,
  riderLat,
  riderLng,
  height = 240,
  className = '',
}: RiderMapProps) {
  const points = useMemo(() => {
    const p: { lat: number; lng: number }[] = [{ lat: storeLat, lng: storeLng }];
    if (riderLat != null && riderLng != null && !Number.isNaN(riderLat) && !Number.isNaN(riderLng)) {
      p.push({ lat: riderLat, lng: riderLng });
    }
    return p;
  }, [storeLat, storeLng, riderLat, riderLng]);

  const { minLat, minLng, maxLat, maxLng } = useMemo(() => bboxFromPoints(points), [points]);

  /** OSM embed: bbox is minLon,minLat,maxLon,maxLat; marker is single lat,lon - we show rider if available else store */
  const markerLat = riderLat != null && riderLng != null ? riderLat : storeLat;
  const markerLng = riderLat != null && riderLng != null ? riderLng : storeLng;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${minLng},${minLat},${maxLng},${maxLat}&layer=mapnik&marker=${markerLat},${markerLng}`;
  const viewUrl = `https://www.openstreetmap.org/?mlat=${markerLat}&mlon=${markerLng}#map=16/${markerLat}/${markerLng}`;

  return (
    <div className={className}>
      <iframe
        title="Map"
        src={embedUrl}
        width="100%"
        height={height}
        className="border border-gray-200 dark:border-gray-600 rounded-xl w-full"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <a
        href={viewUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-primary hover:underline mt-1 inline-block"
      >
        Open in new tab
      </a>
    </div>
  );
}
