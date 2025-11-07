import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getZipPolygonsGeoJSON } from "@/data/atlanta-zip-polygons";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import type { ZoneData } from "@shared/schema";

interface EnergyZoneMapProps {
  data?: ZoneData;
  selectedZip: string;
  onZipClick?: (zip: string) => void;
}

type MetricLayer = "load" | "carbon" | "cii";

interface ZipMetrics {
  [zip: string]: {
    load_kwh: number;
    carbon_intensity_kg_per_kwh: number;
    cii: number;
    aqi: number;
    price_cents_per_kwh: number;
  };
}

const mockZipMetrics: ZipMetrics = {
  "30308": { load_kwh: 45000, carbon_intensity_kg_per_kwh: 0.42, cii: 0.65, aqi: 52, price_cents_per_kwh: 8.5 },
  "30309": { load_kwh: 52000, carbon_intensity_kg_per_kwh: 0.38, cii: 0.58, aqi: 48, price_cents_per_kwh: 8.2 },
  "30305": { load_kwh: 61000, carbon_intensity_kg_per_kwh: 0.35, cii: 0.52, aqi: 45, price_cents_per_kwh: 8.0 },
  "30306": { load_kwh: 38000, carbon_intensity_kg_per_kwh: 0.45, cii: 0.72, aqi: 55, price_cents_per_kwh: 9.0 },
  "30307": { load_kwh: 41000, carbon_intensity_kg_per_kwh: 0.48, cii: 0.78, aqi: 58, price_cents_per_kwh: 9.2 },
  "30312": { load_kwh: 35000, carbon_intensity_kg_per_kwh: 0.52, cii: 0.85, aqi: 62, price_cents_per_kwh: 9.5 },
  "30310": { load_kwh: 29000, carbon_intensity_kg_per_kwh: 0.55, cii: 0.92, aqi: 65, price_cents_per_kwh: 9.8 },
  "30311": { load_kwh: 33000, carbon_intensity_kg_per_kwh: 0.49, cii: 0.80, aqi: 60, price_cents_per_kwh: 9.3 },
  "30314": { load_kwh: 48000, carbon_intensity_kg_per_kwh: 0.40, cii: 0.62, aqi: 50, price_cents_per_kwh: 8.4 },
  "30315": { load_kwh: 36000, carbon_intensity_kg_per_kwh: 0.51, cii: 0.83, aqi: 61, price_cents_per_kwh: 9.4 },
  "30316": { load_kwh: 32000, carbon_intensity_kg_per_kwh: 0.53, cii: 0.88, aqi: 63, price_cents_per_kwh: 9.6 },
  "30317": { load_kwh: 34000, carbon_intensity_kg_per_kwh: 0.50, cii: 0.81, aqi: 59, price_cents_per_kwh: 9.1 },
  "30318": { load_kwh: 55000, carbon_intensity_kg_per_kwh: 0.36, cii: 0.55, aqi: 46, price_cents_per_kwh: 8.1 },
  "30319": { load_kwh: 58000, carbon_intensity_kg_per_kwh: 0.33, cii: 0.48, aqi: 42, price_cents_per_kwh: 7.8 },
  "30324": { load_kwh: 50000, carbon_intensity_kg_per_kwh: 0.37, cii: 0.60, aqi: 49, price_cents_per_kwh: 8.3 },
  "30327": { load_kwh: 65000, carbon_intensity_kg_per_kwh: 0.30, cii: 0.42, aqi: 38, price_cents_per_kwh: 7.5 },
  "30329": { load_kwh: 47000, carbon_intensity_kg_per_kwh: 0.39, cii: 0.63, aqi: 51, price_cents_per_kwh: 8.6 },
  "30331": { load_kwh: 28000, carbon_intensity_kg_per_kwh: 0.56, cii: 0.95, aqi: 66, price_cents_per_kwh: 10.0 },
};

function getColorForValue(value: number, layer: MetricLayer): string {
  if (layer === "load") {
    if (value < 35000) return "#22c55e";
    if (value < 50000) return "#eab308";
    return "#ef4444";
  } else if (layer === "carbon") {
    if (value < 0.40) return "#22c55e";
    if (value < 0.50) return "#eab308";
    return "#ef4444";
  } else {
    if (value < 0.60) return "#22c55e";
    if (value < 0.80) return "#eab308";
    return "#ef4444";
  }
}

export function EnergyZoneMap({ data, selectedZip, onZipClick }: EnergyZoneMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const popup = useRef<maplibregl.Popup | null>(null);
  const [activeLayer, setActiveLayer] = useState<MetricLayer>("load");
  const [mapError, setMapError] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!mapContainer.current) return;

    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    const isDark = theme === "dark";
    
    let initialMap: maplibregl.Map;
    
    try {
      initialMap = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          "osm-tiles": {
            type: "raster",
            tiles: isDark 
              ? ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"]
              : ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap contributors"
          }
        },
        layers: [
          {
            id: "osm-layer",
            type: "raster",
            source: "osm-tiles",
            paint: isDark 
              ? { "raster-brightness-min": 0.2, "raster-brightness-max": 0.5, "raster-saturation": -0.5 }
              : {}
          }
        ],
        glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf"
      },
      center: [-84.388, 33.749],
      zoom: 10.5,
      maxZoom: 14,
      minZoom: 9
    });
    } catch (error: any) {
      console.error("Failed to initialize MapLibre GL:", error);
      setMapError(error.message || "WebGL not supported in this environment");
      return;
    }

    initialMap.on("error", (e) => {
      console.error("MapLibre GL error:", e);
      if (e.error?.message?.includes("WebGL")) {
        setMapError("WebGL not supported in this environment");
      }
    });

    initialMap.addControl(new maplibregl.NavigationControl(), "top-right");

    initialMap.on("load", () => {
      const geojson = getZipPolygonsGeoJSON();

      initialMap.addSource("zip-polygons", {
        type: "geojson",
        data: geojson as any
      });

      initialMap.addLayer({
        id: "zip-fills",
        type: "fill",
        source: "zip-polygons",
        paint: {
          "fill-color": "#666",
          "fill-opacity": 0.85
        }
      });

      initialMap.addLayer({
        id: "zip-borders",
        type: "line",
        source: "zip-polygons",
        paint: {
          "line-color": isDark ? "#888" : "#333",
          "line-width": [
            "case",
            ["==", ["get", "zip"], selectedZip],
            4,
            2
          ]
        }
      });

      initialMap.addLayer({
        id: "zip-selected-highlight",
        type: "line",
        source: "zip-polygons",
        paint: {
          "line-color": "#3b82f6",
          "line-width": [
            "case",
            ["==", ["get", "zip"], selectedZip],
            4,
            0
          ],
          "line-opacity": [
            "case",
            ["==", ["get", "zip"], selectedZip],
            1,
            0
          ]
        }
      });

      initialMap.addLayer({
        id: "zip-labels",
        type: "symbol",
        source: "zip-polygons",
        layout: {
          "text-field": ["get", "zip"],
          "text-size": 12,
          "text-font": ["Open Sans Regular"]
        },
        paint: {
          "text-color": isDark ? "#fff" : "#000",
          "text-halo-color": isDark ? "#000" : "#fff",
          "text-halo-width": 1
        }
      });

      updateChoropleth(initialMap, "load");
    });

    popup.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 15
    });

    initialMap.on("mousemove", "zip-fills", (e) => {
      if (!e.features || e.features.length === 0) return;
      
      initialMap.getCanvas().style.cursor = "pointer";
      
      const feature = e.features[0];
      const zip = feature.properties?.zip;
      
      const metricsSource = (data && data.all_zips_metrics) ? data.all_zips_metrics : mockZipMetrics;
      const metrics = metricsSource[zip];

      if (metrics && popup.current) {
        const html = `
          <div style="padding: 8px; min-width: 180px;">
            <div style="font-weight: 600; margin-bottom: 6px; font-size: 14px;">ZIP ${zip}</div>
            <div style="font-size: 12px; line-height: 1.6;">
              <div>Load: ${(metrics.load_kwh / 1000).toFixed(1)}k kWh</div>
              <div>Carbon: ${metrics.carbon_intensity_kg_per_kwh.toFixed(3)} kg/kWh</div>
              <div>CII: ${metrics.cii.toFixed(2)}</div>
              <div>AQI: ${metrics.aqi}</div>
              <div>Price: ${metrics.price_cents_per_kwh.toFixed(1)}¢/kWh</div>
            </div>
          </div>
        `;

        popup.current.setLngLat(e.lngLat).setHTML(html).addTo(initialMap);
      }
    });

    initialMap.on("mouseleave", "zip-fills", () => {
      initialMap.getCanvas().style.cursor = "";
      if (popup.current) {
        popup.current.remove();
      }
    });

    initialMap.on("click", "zip-fills", (e) => {
      if (!e.features || e.features.length === 0) return;
      const zip = e.features[0].properties?.zip;
      if (zip && onZipClick) {
        onZipClick(zip);
      }
    });

    map.current = initialMap;

    return () => {
      if (popup.current) {
        popup.current.remove();
      }
      initialMap.remove();
      map.current = null;
    };
  }, [theme]);

  useEffect(() => {
    if (map.current && map.current.isStyleLoaded()) {
      updateChoropleth(map.current, activeLayer);
    }
  }, [activeLayer, data]);

  useEffect(() => {
    if (map.current && map.current.isStyleLoaded() && map.current.getLayer("zip-selected-highlight")) {
      map.current.setPaintProperty("zip-selected-highlight", "line-width", [
        "case",
        ["==", ["get", "zip"], selectedZip],
        4,
        0
      ]);
      map.current.setPaintProperty("zip-selected-highlight", "line-opacity", [
        "case",
        ["==", ["get", "zip"], selectedZip],
        1,
        0
      ]);
      map.current.setPaintProperty("zip-borders", "line-width", [
        "case",
        ["==", ["get", "zip"], selectedZip],
        4,
        2
      ]);
    }
  }, [selectedZip]);

  const updateChoropleth = (mapInstance: maplibregl.Map, layer: MetricLayer) => {
    if (!mapInstance.getLayer("zip-fills")) return;

    const fillColors: any[] = ["match", ["get", "zip"]];

    const metricsSource = (data && data.all_zips_metrics) ? data.all_zips_metrics : mockZipMetrics;

    Object.entries(metricsSource).forEach(([zip, metrics]) => {
      let value: number;
      if (layer === "load") {
        value = metrics.load_kwh;
      } else if (layer === "carbon") {
        value = metrics.carbon_intensity_kg_per_kwh;
      } else {
        value = metrics.cii;
      }
      
      const color = getColorForValue(value, layer);
      fillColors.push(zip, color);
    });

    fillColors.push("#999");

    mapInstance.setPaintProperty("zip-fills", "fill-color", fillColors);
  };

  const handleLayerChange = (layer: MetricLayer) => {
    setActiveLayer(layer);
  };

  if (mapError) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-muted/30 rounded-lg" style={{ minHeight: "500px" }} data-testid="map-fallback">
        <div className="text-center p-8">
          <div className="text-muted-foreground mb-4">
            <svg className="h-16 w-16 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p className="text-sm font-medium mb-2">Interactive Map Unavailable</p>
          <p className="text-xs text-muted-foreground max-w-sm">
            {mapError}
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Atlanta Metro ZIP Codes: 30305-30331
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          size="sm"
          variant={activeLayer === "load" ? "default" : "outline"}
          onClick={() => handleLayerChange("load")}
          data-testid="button-layer-load"
        >
          Load
        </Button>
        <Button
          size="sm"
          variant={activeLayer === "carbon" ? "default" : "outline"}
          onClick={() => handleLayerChange("carbon")}
          data-testid="button-layer-carbon"
        >
          Carbon
        </Button>
        <Button
          size="sm"
          variant={activeLayer === "cii" ? "default" : "outline"}
          onClick={() => handleLayerChange("cii")}
          data-testid="button-layer-cii"
        >
          CII
        </Button>
      </div>
      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-lg"
        style={{ minHeight: "500px" }}
        data-testid="map-container"
      />
    </div>
  );
}
