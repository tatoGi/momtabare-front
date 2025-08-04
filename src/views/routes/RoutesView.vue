<template>
  <div class="h-screen flex flex-col">
    <div class="bg-white shadow p-4">
      <h1 class="text-2xl font-bold">{{ $t('routes') }}</h1>
    </div>
    
    <div class="flex-1 flex flex-col md:flex-row overflow-hidden">
      <!-- Map Container -->
      <div class="flex-1 h-full">
        <div id="map" class="w-full h-full"></div>
      </div>
      
      <!-- Search Panel -->
      <div class="w-full md:w-96 bg-gray-50 p-4 overflow-y-auto">
        <div class="space-y-4">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">From</label>
            <div class="flex">
              <input 
                v-model="origin" 
                @keyup.enter="() => searchLocation('origin')"
                type="text" 
                class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter starting location"
              >
              <button 
                @click="() => searchLocation('origin')"
                class="px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 rounded-r-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">To</label>
            <div class="flex">
              <input 
                v-model="destination" 
                @keyup.enter="() => searchLocation('destination')"
                type="text" 
                class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter destination"
              >
              <button 
                @click="() => searchLocation('destination')"
                class="px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 rounded-r-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div v-if="routeInfo" class="mt-4 p-4 bg-white rounded-md shadow">
            <h3 class="font-medium text-gray-900">Route Information</h3>
            <p class="text-sm text-gray-600 mt-1">Distance: {{ routeInfo.distance }} km</p>
            <p class="text-sm text-gray-600">Duration: {{ routeInfo.time }} min</p>
          </div>
          
          <div class="space-y-2">
            <button 
              @click="calculateRoute"
              :disabled="!canCalculateRoute"
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Get Directions
            </button>
            
            <button 
              @click="clearRoute"
              class="w-full bg-white text-gray-700 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Clear Route
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, computed } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

// Import the marker cluster types
import 'leaflet.markercluster';

declare module 'leaflet' {
  export interface MarkerClusterGroupOptions extends LayerOptions {
    maxClusterRadius?: number | ((zoom: number) => number);
    iconCreateFunction?: (cluster: any) => L.DivIcon | L.Icon | L.IconOptions;
  }

  export class MarkerClusterGroup extends Layer {
    constructor(options?: MarkerClusterGroupOptions);
    addLayer(layer: Layer): this;
    removeLayer(layer: Layer): this;
    clearLayers(): this;
    getBounds(): LatLngBounds;
  }

  // Add to the L namespace
  export namespace L {
    export function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;
  }
}

// Sample region images (replace with your actual image paths)
const regionImages: Record<string, string> = {
  'Tbilisi': 'https://example.com/images/tbilisi.jpg',
  'Kutaisi': 'https://example.com/images/kutaisi.jpg',
  'Batumi': 'https://example.com/images/batumi.jpg',
  'Rustavi': 'https://example.com/images/rustavi.jpg',
  'Gori': 'https://example.com/images/gori.jpg',
  'Zugdidi': 'https://example.com/images/zugdidi.jpg',
  'Poti': 'https://example.com/images/poti.jpg',
  'Telavi': 'https://example.com/images/telavi.jpg',
  'Akhaltsikhe': 'https://example.com/images/akhaltsikhe.jpg',
  'Mtskheta': 'https://example.com/images/mtskheta.jpg'
};

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

// Interfaces
interface Location {
  name: string;
  lat: number;
  lng: number;
  count: number;
}

interface RouteConnection {
  from: string;
  to: string;
  count: number;
}

interface RouteInfo {
  distance: string;
  time: string;
}

export default defineComponent({
  name: 'RoutesView',
  setup() {
    // Reactive variables
    const origin = ref('');
    const destination = ref('');
    const routeInfo = ref<RouteInfo | null>(null);
    const map = ref<L.Map | null>(null);
    const markers = ref<L.Marker[]>([]);
    const routeLayer = ref<L.Polyline | null>(null);
    const markerClusterGroup = ref<L.MarkerClusterGroup | null>(null);

    // Default coordinates for Tbilisi
    const defaultCoords: [number, number] = [41.7151, 44.8271];

    // Sample data for Georgian cities
    const georgiaRoutes: Location[] = [
      { name: 'Tbilisi', lat: 41.7151, lng: 44.8271, count: 3 },
      { name: 'Kutaisi', lat: 42.2483, lng: 42.6983, count: 5 },
      { name: 'Batumi', lat: 41.6168, lng: 41.6367, count: 8 },
      { name: 'Rustavi', lat: 41.5727, lng: 44.9833, count: 2 },
      { name: 'Gori', lat: 41.9815, lng: 44.1126, count: 4 },
      { name: 'Zugdidi', lat: 42.5088, lng: 41.8708, count: 3 },
      { name: 'Poti', lat: 42.1464, lng: 41.6780, count: 6 },
      { name: 'Telavi', lat: 41.9208, lng: 45.4815, count: 3 },
      { name: 'Akhaltsikhe', lat: 41.6390, lng: 42.9826, count: 2 },
      { name: 'Mtskheta', lat: 41.8412, lng: 44.7180, count: 7 },
    ];

  

    // Computed property
    const canCalculateRoute = computed(() => {
      return origin.value.trim() !== '' && destination.value.trim() !== '';
    });

    // Create custom marker icon
    const createCustomIcon = (name: string, count: number) => {
      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="marker-container">
            <div class="marker-circle">
              <span>${count}</span>
            </div>
            <div class="marker-label">${name}</div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      });
    };

    // Initialize map
    const initMap = () => {
      map.value = L.map('map').setView(defaultCoords, 7);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map.value);
      
      // Initialize marker cluster group
      markerClusterGroup.value = (L as any).markerClusterGroup({
        maxClusterRadius: 60,
        iconCreateFunction: function(cluster: any) {
          const childCount = cluster.getChildCount();
          return L.divIcon({
            html: `<div class="cluster">${childCount}</div>`,
            className: 'marker-cluster',
            iconSize: L.point(40, 40, true)
          });
        }
      });

      // Add markers to the cluster group
      georgiaRoutes.forEach(location => {
        const marker = L.marker(
          [location.lat, location.lng],
          {
            icon: createCustomIcon(location.name, location.count),
            title: location.name
          }
        );

        // Create popup content with region image
        const popupContent = `
          <div class="popup-content">
            <div class="popup-image" style="background-image: url(${regionImages[location.name] || 'https://via.placeholder.com/200x150?text=No+Image'})">
              <div class="popup-overlay">
                <h3>${location.name}</h3>
              </div>
            </div>
            <div class="popup-details">
              <p><strong>Routes:</strong> ${location.count}</p>
              <button class="show-routes-btn" data-location="${location.name}">Show Routes</button>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        
        // Add marker to cluster group
        markerClusterGroup.value?.addLayer(marker);
        markers.value.push(marker);
      });

      // Add cluster group to map
      if (markerClusterGroup.value) {
        (map.value as any).addLayer(markerClusterGroup.value);
      }
      
      // Add route connections
      routeConnections.forEach(connection => {
        const from = georgiaRoutes.find(loc => loc.name === connection.from);
        const to = georgiaRoutes.find(loc => loc.name === connection.to);
        
        if (from && to && map.value) {
          L.polyline(
            [[from.lat, from.lng], [to.lat, to.lng]],
            {
              color: '#3b82f6',
              weight: 2 + (connection.count / 5),
              opacity: 0.7,
              dashArray: '5, 5'
            }
          ).addTo(map.value);
        }
      });
    };

    // Search for location
    const searchLocation = async (type: 'origin' | 'destination') => {
      const query = type === 'origin' ? origin.value : destination.value;
      if (!query.trim()) return;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
        );
        const data = await response.json();
        
        if (data && data.length > 0) {
          const { lat, lon, display_name } = data[0];
          const coords: [number, number] = [parseFloat(lat), parseFloat(lon)];
          
          // Remove existing marker for this type
          const markerIndex = type === 'origin' ? 0 : 1;
          if (markers.value[markerIndex]) {
            map.value?.removeLayer(markers.value[markerIndex]);
          }
          
          // Create custom icon
          const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${type === 'origin' ? '#10b981' : '#ef4444'}; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white;">
                    ${type === 'origin' ? 'A' : 'B'}
                  </div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
          
          // Add new marker
          const marker = L.marker(coords, { icon })
            .addTo(map.value!)
            .bindPopup(`${type === 'origin' ? 'Origin' : 'Destination'}: ${display_name}`);
          
          // Store marker
          if (!markers.value[markerIndex]) {
            markers.value[markerIndex] = marker;
          } else {
            markers.value[markerIndex] = marker;
          }
          
          // Update input with formatted address
          const shortName = display_name.split(',')[0];
          if (type === 'origin') {
            origin.value = shortName;
          } else {
            destination.value = shortName;
          }
          
          // Center map on location
          map.value?.setView(coords, 13);
        }
      } catch (error) {
        console.error('Error searching location:', error);
      }
    };

    // Calculate route (simplified version without routing library)
    const calculateRoute = () => {
      if (markers.value.length < 2) return;
      
      // Clear existing route
      if (routeLayer.value) {
        map.value?.removeLayer(routeLayer.value);
      }
      
      const coords = markers.value.map(marker => marker.getLatLng());
      
      // Create simple line between points
      routeLayer.value = L.polyline(coords, {
        color: '#3b82f6',
        weight: 5,
        opacity: 0.8
      }).addTo(map.value!);
      
      // Calculate approximate distance and time
      const distance = coords[0].distanceTo(coords[1]) / 1000; // Convert to km
      const time = Math.ceil(distance * 1.5); // Rough estimate: 1.5 minutes per km
      
      routeInfo.value = {
        distance: distance.toFixed(1),
        time: time.toString()
      };
      
      // Fit map to show route
      map.value?.fitBounds(routeLayer.value.getBounds(), { padding: [20, 20] });
    };

    // Clear route
    const clearRoute = () => {
      if (routeLayer.value) {
        map.value?.removeLayer(routeLayer.value);
        routeLayer.value = null;
      }
      
      // Clear markers
      markers.value.forEach(marker => {
        if (marker) {
          map.value?.removeLayer(marker);
        }
      });
      markers.value = [];
      
      // Clear form
      origin.value = '';
      destination.value = '';
      routeInfo.value = null;
    };

    // Lifecycle hooks
    onMounted(() => {
      initMap();
    });

    onBeforeUnmount(() => {
      if (map.value) {
        if (markerClusterGroup.value) {
          markerClusterGroup.value.clearLayers();
          (map.value as any).removeLayer(markerClusterGroup.value);
        }
        map.value.remove();
        map.value = null;
      }
    });

    return {
      origin,
      destination,
      canCalculateRoute,
      routeInfo,
      searchLocation,
      calculateRoute,
      clearRoute
    };
  },
});
</script>

<style>
/* Map container styles */
#map {
  min-height: 600px;
  height: 100%;
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

/* Marker styles */
.marker-container {
  text-align: center;
  cursor: pointer;
}

.marker-circle {
  width: 30px;
  height: 30px;
  background: #3b82f6;
  border-radius: 50%;
  margin: 0 auto 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 12px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.marker-label {
  font-size: 11px;
  font-weight: 600;
  color: #333;
  text-shadow: 0 0 2px white, 0 0 2px white, 0 0 2px white, 0 0 2px white;
  white-space: nowrap;
}

/* Popup styles */
.popup-content {
  min-width: 220px;
}

.popup-image {
  height: 150px;
  background-size: cover;
  background-position: center;
  border-radius: 8px 8px 0 0;
  position: relative;
  overflow: hidden;
}

.popup-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 10px;
  text-align: left;
}

.popup-overlay h3 {
  margin: 0;
  font-size: 18px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.popup-details {
  padding: 10px;
  background: white;
  border-radius: 0 0 8px 8px;
}

.show-routes-btn {
  display: block;
  width: 100%;
  padding: 8px;
  margin-top: 8px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.show-routes-btn:hover {
  background: #2563eb;
}

/* Cluster marker styles */
.marker-cluster {
  background: rgba(59, 130, 246, 0.8);
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.8);
}

.marker-cluster div {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

/* Custom marker styles */
.custom-marker {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .flex-col {
    flex-direction: column;
  }
  .h-screen {
    height: auto;
  }
  #map {
    height: 70vh;
    min-height: 400px;
  }
}

/* Leaflet popup customization */
.leaflet-popup-content-wrapper {
  border-radius: 8px;
}

.leaflet-popup-content {
  margin: 12px 16px;
}
</style>