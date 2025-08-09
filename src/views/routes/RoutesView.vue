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
            <label class="block text-sm font-medium text-gray-700">Search Locations</label>
            <div class="flex">
              <input 
                v-model="searchQuery" 
                @input="filterLocations"
                type="text" 
                class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter location name..."
              >
              <button 
                @click="clearSearch"
                class="px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 rounded-r-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div v-if="filteredLocations.length > 0" class="mt-4">
            <h3 class="font-medium text-gray-900 mb-2">Found Locations ({{ filteredLocations.length }})</h3>
            <div class="space-y-2 max-h-64 overflow-y-auto">
              <div 
                v-for="location in filteredLocations" 
                :key="location.name"
                @click="focusOnLocation(location)"
                class="p-3 bg-white rounded-md shadow-sm cursor-pointer hover:bg-blue-50 hover:border-blue-200 border border-gray-200 transition-colors"
              >
                <div class="flex justify-between items-center">
                  <div>
                    <h4 class="font-medium text-gray-900">{{ location.name }}</h4>
                    <p class="text-sm text-gray-500">{{ location.count }} routes</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else-if="searchQuery" class="mt-4 p-4 bg-white rounded-md shadow">
            <p class="text-gray-500 text-center">No locations found matching "{{ searchQuery }}"</p>
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
import { usePageData } from '@/composables/usePageData';
import { useAppStore } from '@/pinia/app.pinia';
import { getAssetUrl } from '@/utils/config/env';

// Import the marker cluster types
import 'leaflet.markercluster';

// Using any types for Leaflet marker clustering to avoid TypeScript conflicts

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

interface Route {
  id: number;
  route_name: string;
  slug: string;
  description: string;
  location: string;
  map_link: string;
  route_image: string;
  difficulty_level: string;
  duration_hours: string;
  distance_km: string;
  elevation_gain: string;
  season: string;
  status: string;
  lat?: number;
  lng?: number;
}

export default defineComponent({
  name: 'RoutesView',
  setup() {
    // Get page data and app store
    const { currentPageData } = usePageData();
    const appStore = useAppStore();
    const currentLocale = computed(() => appStore.getLanguage);
    // Reactive variables
    const searchQuery = ref('');
    const map = ref<L.Map | null>(null);
    const filteredLocations = ref<Location[]>([]);
    const markers = ref<L.Marker[]>([]);
    const markerClusterGroup = ref<any>(null);
    const processedRoutes = ref<Route[]>([]);

    // Helper function to get attribute value by key and locale
    const getRouteAttribute = (post: any, key: string, locale?: string) => {
      if (!post.attributes) return '';

      // Try to find attribute with specific locale first
      if (locale) {
        const localeAttr = post.attributes.find((attr: any) => 
          attr.attribute_key === key && attr.locale === locale
        );
        if (localeAttr) return localeAttr.attribute_value;
      }

      // Fallback to attribute without locale or first match
      const attr = post.attributes.find((attr: any) => 
        attr.attribute_key === key && (!attr.locale || attr.locale === 'en')
      );
      return attr ? attr.attribute_value : '';
    };

    // Process backend route data
    const processBackendRoutes = () => {
      if (!currentPageData.value?.posts) return [];

      return currentPageData.value.posts.map((post: any) => {
        const locale = currentLocale.value;
        
        return {
          id: post.id,
          route_name: getRouteAttribute(post, 'route_name', locale) || getRouteAttribute(post, 'route_name', 'en'),
          slug: getRouteAttribute(post, 'slug', locale) || getRouteAttribute(post, 'slug', 'en'),
          description: getRouteAttribute(post, 'description', locale) || getRouteAttribute(post, 'description', 'en'),
          location: getRouteAttribute(post, 'location', locale) || getRouteAttribute(post, 'location', 'en'),
          map_link: getRouteAttribute(post, 'map_link'),
          route_image: getRouteAttribute(post, 'route_image'),
          difficulty_level: getRouteAttribute(post, 'difficulty_level'),
          duration_hours: getRouteAttribute(post, 'duration_hours'),
          distance_km: getRouteAttribute(post, 'distance_km'),
          elevation_gain: getRouteAttribute(post, 'elevation_gain'),
          season: getRouteAttribute(post, 'season'),
          status: getRouteAttribute(post, 'status'),
          // Extract coordinates from map_link if available
          ...extractCoordinatesFromMapLink(getRouteAttribute(post, 'map_link'))
        };
      }).filter((route: Route) => route.status === 'active');
    };

    // Extract coordinates from Google Maps link
    const extractCoordinatesFromMapLink = (mapLink: string) => {
      if (!mapLink) return { lat: undefined, lng: undefined };
      
      // Try to extract coordinates from various Google Maps URL formats
      const patterns = [
        /@(-?\d+\.?\d*),(-?\d+\.?\d*)/, // @lat,lng format
        /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/, // !3dlat!4dlng format
        /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/, // ll=lat,lng format
      ];
      
      for (const pattern of patterns) {
        const match = mapLink.match(pattern);
        if (match) {
          return {
            lat: parseFloat(match[1]),
            lng: parseFloat(match[2])
          };
        }
      }
      
      // Fallback coordinates for Georgia if no coordinates found
      return { lat: 41.7151, lng: 44.8271 };
    };

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
      const mapInstance = L.map('map', {
        center: [41.7151, 44.8271],
        zoom: 8,
        layers: [L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        })]
      });
      
      map.value = mapInstance;

      // Initialize marker cluster group
      const clusterGroup = new (L as any).MarkerClusterGroup({
        iconCreateFunction: (cluster: any) => {
          const count = cluster.getChildCount();
          return L.divIcon({
            html: `<div class="cluster-icon">${count}</div>`,
            className: 'custom-cluster-icon',
            iconSize: [40, 40]
          });
        }
      });
      
      markerClusterGroup.value = clusterGroup;

      // Add cluster group to map
      clusterGroup.addTo(mapInstance);
      
      // Load all locations initially
      loadLocations(georgiaRoutes);
    };

    // Load locations on map
    const loadLocations = (locations: Location[]) => {
      // Clear existing markers
      if (markerClusterGroup.value) {
        markerClusterGroup.value.clearLayers();
      }
      markers.value = [];

      // Add markers to the cluster group
      locations.forEach(location => {
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
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        
        // Add marker to cluster group
        markerClusterGroup.value?.addLayer(marker);
        markers.value.push(marker);
      });

      // Add cluster group to map if not already added
      if (markerClusterGroup.value && map.value) {
        if (!map.value.hasLayer(markerClusterGroup.value)) {
          map.value.addLayer(markerClusterGroup.value);
        }
      }
    };

    // Load routes on map
    const loadRoutes = (routes: Route[]) => {
      if (!map.value || !markerClusterGroup.value) return;

      // Clear existing markers
      markerClusterGroup.value.clearLayers();
      markers.value = [];

      routes.forEach(route => {
        if (!route.lat || !route.lng) return; // Skip routes without coordinates

        const marker = L.marker([route.lat, route.lng], {
          icon: createCustomIcon(route.route_name, 1)
        });

        // Create popup content with route details
        const imageUrl = route.route_image ? 
          getAssetUrl(`storage/${route.route_image}`) : 
          'https://via.placeholder.com/300x150?text=Route+Image';
          
        const difficultyColors: Record<string, string> = {
          'easy': '#22c55e',
          'moderate': '#f59e0b', 
          'hard': '#ef4444',
          'extreme': '#7c2d12'
        };
        
        const difficultyColor = difficultyColors[route.difficulty_level] || '#6b7280';
        
        const popupContent = `
          <div class="popup-content">
            <div class="popup-image" style="background-image: url('${imageUrl}');">
              <div class="popup-overlay">
                <h3>${route.route_name}</h3>
              </div>
            </div>
            <div class="popup-details">
              <p><strong>Location:</strong> ${route.location}</p>
              <p><strong>Description:</strong> ${route.description}</p>
              <div style="display: flex; gap: 10px; margin: 8px 0;">
                <span style="background: ${difficultyColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
                  ${route.difficulty_level.toUpperCase()}
                </span>
                <span style="background: #e5e7eb; color: #374151; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
                  ${route.season.toUpperCase()}
                </span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 8px 0; font-size: 12px;">
                <div><strong>Duration:</strong> ${route.duration_hours}h</div>
                <div><strong>Distance:</strong> ${route.distance_km}km</div>
                <div><strong>Elevation:</strong> ${route.elevation_gain}m</div>
                <div><strong>Season:</strong> ${route.season}</div>
              </div>
              ${route.map_link ? `
                <button class="show-routes-btn" onclick="window.open('${route.map_link}', '_blank')">
                  Open in Google Maps
                </button>
              ` : ''}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          maxWidth: 300,
          className: 'custom-popup'
        });

        markers.value.push(marker);
        markerClusterGroup.value!.addLayer(marker);
      });

      // Fit map to show all markers if there are any
      if (markers.value.length > 0) {
        const group = new (L as any).featureGroup(markers.value as any);
        map.value!.fitBounds(group.getBounds().pad(0.1));
      }
    };

    // Filter locations based on search query
    const filterLocations = () => {
      const query = searchQuery.value.toLowerCase().trim();
      
      if (query === '') {
        // Show all locations
        filteredLocations.value = [];
        loadLocations(georgiaRoutes);
      } else {
        // Filter locations
        const filtered = georgiaRoutes.filter(location => 
          location.name.toLowerCase().includes(query)
        );
        filteredLocations.value = filtered;
        loadLocations(filtered);
      }
    };

    // Focus on a specific location
    const focusOnLocation = (location: Location) => {
      if (map.value) {
        map.value.setView([location.lat, location.lng], 10);
        
        // Find and open the popup for this location
        const marker = markers.value.find(m => {
          const latLng = m.getLatLng();
          return Math.abs(latLng.lat - location.lat) < 0.001 && 
                 Math.abs(latLng.lng - location.lng) < 0.001;
        });
        
        if (marker) {
          marker.openPopup();
        }
      }
    };

    // Clear search
    const clearSearch = () => {
      searchQuery.value = '';
      filteredLocations.value = [];
      loadLocations(georgiaRoutes);
      
      // Reset map view
      if (map.value) {
        map.value.setView(defaultCoords, 7);
      }
    };

    // Lifecycle hooks
    onMounted(() => {
      initMap();
      
      // Process and load backend routes
      processedRoutes.value = processBackendRoutes();
      console.log('📍 Processed routes:', processedRoutes.value);
      
      // Load routes on map
      if (processedRoutes.value.length > 0) {
        loadRoutes(processedRoutes.value);
      }
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
      searchQuery,
      filteredLocations,
      filterLocations,
      focusOnLocation,
      clearSearch
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
  color: white;
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