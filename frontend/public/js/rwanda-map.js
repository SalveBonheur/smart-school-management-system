/**
 * Rwanda Map Integration for Smart School Transport
 * Interactive maps for route visualization and live bus tracking
 */

// Global map instances
let routeMap = null;
let busTrackingMap = null;
let activeLayers = {
    routes: [],
    buses: [],
    schools: [],
    stops: []
};

// Rwanda coordinates (centered on Kigali)
const RWANDA_CENTER = [-1.9403, 29.8739];
const KIGALI_COORDS = [-1.9441, 30.0619];
const DEFAULT_ZOOM = 13;

// Sample data for schools in Rwanda
const RWANDA_SCHOOLS = [
    { name: "Kigali International School", lat: -1.9441, lng: 30.0619, students: 450 },
    { name: "Green Hills Academy", lat: -1.9365, lng: 30.0789, students: 320 },
    { name: "Kigali Christian School", lat: -1.9512, lng: 30.0456, students: 280 },
    { name: "Rwanda International Academy", lat: -1.9589, lng: 30.0923, students: 380 }
];

// Sample bus routes data
const BUS_ROUTES = {
    north: {
        name: "North Route",
        color: "#3b82f6",
        stops: [
            [-1.9441, 30.0619], // School
            [-1.9350, 30.0700], // Stop 1
            [-1.9280, 30.0750], // Stop 2
            [-1.9200, 30.0800], // Stop 3
            [-1.9100, 30.0850]  // Stop 4
        ]
    },
    south: {
        name: "South Route",
        color: "#10b981",
        stops: [
            [-1.9441, 30.0619], // School
            [-1.9550, 30.0550], // Stop 1
            [-1.9650, 30.0480], // Stop 2
            [-1.9750, 30.0420], // Stop 3
            [-1.9850, 30.0350]  // Stop 4
        ]
    },
    east: {
        name: "East Route",
        color: "#f59e0b",
        stops: [
            [-1.9441, 30.0619], // School
            [-1.9420, 30.0750], // Stop 1
            [-1.9400, 30.0850], // Stop 2
            [-1.9380, 30.0950], // Stop 3
            [-1.9350, 30.1050]  // Stop 4
        ]
    },
    west: {
        name: "West Route",
        color: "#8b5cf6",
        stops: [
            [-1.9441, 30.0619], // School
            [-1.9460, 30.0480], // Stop 1
            [-1.9480, 30.0380], // Stop 2
            [-1.9500, 30.0280], // Stop 3
            [-1.9520, 30.0180]  // Stop 4
        ]
    }
};

// Sample live bus locations
const LIVE_BUSES = [
    { id: "BUS-01", route: "North Route", lat: -1.9280, lng: 30.0750, status: "on-route", students: 28, nextStop: "Gacuriro" },
    { id: "BUS-02", route: "South Route", lat: -1.9650, lng: 30.0480, status: "on-route", students: 32, nextStop: "Kicukiro" },
    { id: "BUS-03", route: "East Route", lat: -1.9400, lng: 30.0850, status: "stopped", students: 25, nextStop: "Remera" },
    { id: "BUS-04", route: "West Route", lat: -1.9480, lng: 30.0380, status: "on-route", students: 30, nextStop: "Nyabugogo" }
];

// Initialize maps when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Rwanda maps...');
    
    // Initialize maps after a short delay to ensure containers are ready
    setTimeout(() => {
        initializeRouteMap();
        initializeBusTrackingMap();
    }, 500);
    
    // Refresh bus locations every 30 seconds
    setInterval(refreshBusLocations, 30000);
});

// ==================== ROUTE MAP FUNCTIONS ====================

function initializeRouteMap() {
    const mapContainer = document.getElementById('routeMap');
    if (!mapContainer) {
        console.log('Route map container not found');
        return;
    }
    
    // Create map
    routeMap = L.map('routeMap').setView(KIGALI_COORDS, DEFAULT_ZOOM);
    
    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(routeMap);
    
    // Add all routes
    showRouteLayer('all');
    
    console.log('Route map initialized');
}

function showRouteLayer(routeType) {
    if (!routeMap) return;
    
    // Clear existing layers
    activeLayers.routes.forEach(layer => routeMap.removeLayer(layer));
    activeLayers.schools.forEach(layer => routeMap.removeLayer(layer));
    activeLayers.stops.forEach(layer => routeMap.removeLayer(layer));
    
    activeLayers.routes = [];
    activeLayers.schools = [];
    activeLayers.stops = [];
    
    // Update button states
    document.querySelectorAll('.map-control-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event?.target?.classList.add('active');
    
    // Show routes based on selection
    if (routeType === 'all') {
        Object.keys(BUS_ROUTES).forEach(key => addRouteToMap(BUS_ROUTES[key]));
    } else if (BUS_ROUTES[routeType]) {
        addRouteToMap(BUS_ROUTES[routeType]);
    }
    
    // Add schools
    addSchoolsToMap();
}

function addRouteToMap(routeData) {
    // Create polyline for route
    const polyline = L.polyline(routeData.stops, {
        color: routeData.color,
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 10'
    }).addTo(routeMap);
    
    // Add stop markers
    routeData.stops.forEach((stop, index) => {
        const marker = L.circleMarker(stop, {
            radius: 8,
            fillColor: routeData.color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
        }).addTo(routeMap);
        
        marker.bindPopup(`
            <strong>${routeData.name}</strong><br>
            Stop ${index + 1}<br>
            <small>${index === 0 ? 'School Location' : 'Pickup Point'}</small>
        `);
        
        activeLayers.stops.push(marker);
    });
    
    activeLayers.routes.push(polyline);
}

function addSchoolsToMap() {
    RWANDA_SCHOOLS.forEach(school => {
        const marker = L.marker([school.lat, school.lng], {
            icon: createCustomIcon('school')
        }).addTo(routeMap);
        
        marker.bindPopup(`
            <div class="bus-status-popup">
                <h4><i class="fas fa-school"></i> ${school.name}</h4>
                <div class="bus-info-row">
                    <span>Students:</span>
                    <span>${school.students}</span>
                </div>
                <div class="bus-info-row">
                    <span>Status:</span>
                    <span class="status-badge on-route">Active</span>
                </div>
            </div>
        `);
        
        activeLayers.schools.push(marker);
    });
}

// ==================== BUS TRACKING MAP FUNCTIONS ====================

function initializeBusTrackingMap() {
    const mapContainer = document.getElementById('busTrackingMap');
    if (!mapContainer) {
        console.log('Bus tracking map container not found');
        return;
    }
    
    // Create map
    busTrackingMap = L.map('busTrackingMap').setView(KIGALI_COORDS, 12);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(busTrackingMap);
    
    // Add live buses
    updateBusMarkers();
    
    // Add schools
    RWANDA_SCHOOLS.forEach(school => {
        L.marker([school.lat, school.lng], {
            icon: createCustomIcon('school')
        }).addTo(busTrackingMap)
        .bindPopup(`<strong>${school.name}</strong><br>${school.students} students`);
    });
    
    console.log('Bus tracking map initialized');
}

function updateBusMarkers() {
    if (!busTrackingMap) return;
    
    // Clear existing bus markers
    activeLayers.buses.forEach(layer => busTrackingMap.removeLayer(layer));
    activeLayers.buses = [];
    
    // Add current bus locations
    LIVE_BUSES.forEach(bus => {
        const marker = L.marker([bus.lat, bus.lng], {
            icon: createCustomIcon('bus')
        }).addTo(busTrackingMap);
        
        marker.bindPopup(`
            <div class="bus-status-popup">
                <h4><i class="fas fa-bus"></i> ${bus.id}</h4>
                <div class="bus-info-row">
                    <span>Route:</span>
                    <span>${bus.route}</span>
                </div>
                <div class="bus-info-row">
                    <span>Students:</span>
                    <span>${bus.students}</span>
                </div>
                <div class="bus-info-row">
                    <span>Next Stop:</span>
                    <span>${bus.nextStop}</span>
                </div>
                <div class="bus-info-row">
                    <span>Status:</span>
                    <span class="status-badge ${bus.status}">${bus.status.replace('-', ' ')}</span>
                </div>
            </div>
        `);
        
        activeLayers.buses.push(marker);
    });
}

function refreshBusLocations() {
    // Simulate bus movement
    LIVE_BUSES.forEach(bus => {
        // Add slight random movement
        bus.lat += (Math.random() - 0.5) * 0.001;
        bus.lng += (Math.random() - 0.5) * 0.001;
    });
    
    updateBusMarkers();
    
    // Show notification
    if (typeof showNotification === 'function') {
        showNotification('Bus locations updated', 'success');
    }
}

function centerOnKigali() {
    if (busTrackingMap) {
        busTrackingMap.setView(KIGALI_COORDS, 13);
    }
}

function toggleTrafficLayer() {
    // Toggle traffic layer visibility
    const btn = event.target.closest('.map-control-btn');
    btn.classList.toggle('active');
    
    if (typeof showNotification === 'function') {
        showNotification('Traffic layer ' + (btn.classList.contains('active') ? 'enabled' : 'disabled'), 'info');
    }
}

// ==================== UTILITY FUNCTIONS ====================

function createCustomIcon(type) {
    const colors = {
        school: '#10b981',
        bus: '#f59e0b',
        stop: '#8b5cf6',
        student: '#06b6d4'
    };
    
    const icons = {
        school: 'fa-school',
        bus: 'fa-bus',
        stop: 'fa-map-marker-alt',
        student: 'fa-user'
    };
    
    return L.divIcon({
        className: 'custom-marker ' + type,
        html: `<i class="fas ${icons[type]}"></i>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });
}

// View specific route on map
function viewRouteMap(routeName) {
    showSection('routes');
    setTimeout(() => {
        const routeKey = routeName.toLowerCase().replace(' route', '');
        showRouteLayer(routeKey);
    }, 300);
}

console.log('Rwanda Map module loaded');
