"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import Link from "next/link";

// Fix for default marker icon in Next.js/Leaflet
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const customIcon = new L.Icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to auto-center map bounds based on courts list
function MapUpdater({ courts }: { courts: any[] }) {
    const map = useMap();

    useEffect(() => {
        if (courts.length > 0) {
            // Filter out invalid coords
            const valid = courts.filter(c => c.lat && c.lng);
            if (valid.length > 0) {
                const bounds = L.latLngBounds(valid.map(c => [c.lat, c.lng]));
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }
        }
    }, [courts, map]);

    return null;
}

export default function LeafletMap({ courts }: { courts: any[] }) {
    // Default to Center of USA if no courts
    const defaultCenter: [number, number] = [39.8283, -98.5795];
    const center = courts.length > 0 && courts[0].lat && courts[0].lng
        ? [courts[0].lat, courts[0].lng] as [number, number]
        : defaultCenter;

    const zoom = courts.length > 0 ? 13 : 4;

    return (
        <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="h-full w-full z-0" style={{ height: "100%", width: "100%" }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {/* Using CartoDB Voyager for a cleaner, modern look map */}

            <MapUpdater courts={courts} />

            {courts.map((court) => (
                court.lat && court.lng && (
                    <Marker
                        key={court.id}
                        position={[court.lat, court.lng]}
                        icon={customIcon}
                    >
                        <Popup>
                            <div className="p-1 min-w-[150px]">
                                <h3 className="font-bold text-sm mb-1">{court.name}</h3>
                                <p className="text-xs text-gray-500 mb-2 truncate">{court.address}</p>
                                <Link href={`/court/${court.id}`} className="text-xs font-semibold text-primary hover:underline">
                                    View Details
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                )
            ))}
        </MapContainer>
    );
}
