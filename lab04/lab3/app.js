/**
 * CORE INITIALIZATION
 * Utilizing the newest importLibrary pattern.
 */
let map, routesService, matrixService;
let origin;
let destinations = [];
let activePolylines = [];
let centerSanFranciscoCoords = { lat: 37.7749, lng: -122.4194 };
let originTransportAgencyCoords = { lat: 37.7747579, lng: -122.4203093 };
let originTransportAgencyName = "Municipal Transportation Agency";
let originGeneralHospitalCoords = { lat: 37.7554699, lng: -122.4080238 };
let originGeneralHospitalName = "General Hospital, SF";

async function initMap() {
    // START TASK 1. Import the necessary libraries
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker"); // Added PinElement
    const { Route, RouteMatrix } = await google.maps.importLibrary('routes');
    // makes the route and routematrix object available outside of this function
    routesService = Route;
    matrixService = RouteMatrix;
    // END TASK 1. Import the necessary libraries

    // START TASK 2. Initialize the Map
    map = new Map(document.getElementById("map"), {
        center: centerSanFranciscoCoords,
        zoom: 13,
        mapId: "CIVIC_THEME_ID" // Highlight public buildings (REQUIRED for Advanced Markers)
    })
    // END TASK 2. Initialize the Map

    // START TASK 3. Add the click listener to drop a marker
    map.addListener("click", (event) => {
        const clickedLatLng = event.latLng;

        const pin = new PinElement({
            glyphText: (destinations.length + 1).toString(),
            glyphColor: "white",
        });

        const marker = new AdvancedMarkerElement({
            map: map,
            position: clickedLatLng,
            content: pin,
            title: `Destination ${destinations.length + 1}`,
            gmpDraggable: true // Allows moving the marker after dropping
        });
        destinations.push(marker);

        logEntry(`Marker dropped at: ${clickedLatLng.lat().toFixed(4)}, ${clickedLatLng.lng().toFixed(4)} (Total ${destinations.length} markers)`);
    });
    // END TASK 3. Add the click listener to drop a marker

    logEntry("Civic Engine Initialized. Click anywhere on the map to drop a destination marker.");
}

initMap();

/**
 * EMERGENCY SERVICE DISPATCH
 * Goal: Traffic-aware routing with cost-effective field masking.
 */
async function dispatchServiceCallResponse() {
    if (!destinations || destinations.length !== 1) {
        alert("Choose a single service call destination first.");
        return;
    }

    clearRoutes();

    await setOrigin(originTransportAgencyCoords, originTransportAgencyName);

    // START TASK 4. Send a request to get traffic aware routing between two points
    const request = {
        origin: originTransportAgencyCoords,
        destination: destinations[0].position,
        travelMode: 'DRIVING',
        routingPreference: 'TRAFFIC_AWARE'
    };

    const fields = ['durationMillis', 'distanceMeters', 'path', 'viewport'];

    routesService.computeRoutes({ ...request, fields: fields })
    .then((response) => {
        const route = response.routes[0]; // The response contains an array of routes

        // Create polylines from the route data
        // This handles both basic paths and traffic-aware paths automatically
        activePolylines = route.createPolylines();

        // Set each polyline on the map
        activePolylines.forEach(polyline => {
            polyline.setMap(map);
        });

        // Zoom the map to fit the entire route
        if (route.viewport) {
            map.fitBounds(route.viewport);
        }

        logEntry(`Route rendered. Distance: ${(route.distanceMeters / 1000).toFixed(2)} km`);
    })
    .catch((e) => logEntry("Routes Request failed: " + e.message));
    // END TASK 4. Send a request to get traffic aware routing between two points
}

/**
 * MOBILE CLINIC OPTIMIZATION
 * Goal: Optimize stops to reduce environmental impact.
 */
async function optimizeHealthClinic() {
    if (!destinations || destinations.length < 1) {
        alert("Choose a one or more mobile clinic stops first.");
        return;
    }

    clearRoutes();

    await setOrigin(originGeneralHospitalCoords, originGeneralHospitalName);

    // START TASK 5. Send a request to get an optimized route along several waypoints
    const request = {
        origin: originGeneralHospitalCoords,
        destination: originGeneralHospitalCoords,
        // Map the destination array to the intermediate waypoints format
        intermediates: destinations.map(m => m.position),
        travelMode: 'DRIVING',
        /**
         * STUDENT TASK:
         * Enable GA waypoint optimization for municipal efficiency.
         */
        optimizeWaypointOrder: true
    };

    // Define the field mask (using JS SDK property names)
    const fields = [ 'optimizedIntermediateWaypointIndices', 'path', 'distanceMeters', 'viewport' ];

    // Call the Routes Service
    routesService.computeRoutes({ ...request, fields })
    .then((response) => {
        const route = response.routes[0];

        // Render the optimized route on the map
        activePolylines = route.createPolylines();
        activePolylines.forEach(polyline => {
            polyline.setOptions({
                icons: [{
                    icon: { 
                        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                        fillColor: '#FFFFFF',
                        fillOpacity: 1,
                        strokeColor: '#000000',
                        strokeWeight: 1,
                        scale: 3
                    },
                    offset: '0',
                    repeat: '50px'
                }]
            });
            polyline.setMap(map);
        });

        // Zoom the map to fit the entire route
        if (route.viewport) {
            map.fitBounds(route.viewport);
        }

        // Log the results
        const order = route.optimizedIntermediateWaypointIndices;

        // Mark the waypoints clearly
        const { PinElement } = google.maps.marker;
        
        // Ensure destination markers have default pins if they don't have them yet (initial drop)
        // or we just overwrite them below.
        
        // 1. Update the Origin marker
        const originPin = new PinElement({
            background: "#4285F4", // Keep blue for origin
            borderColor: "#174ea6",
            glyphText: "O",
            glyphColor: "white",
        });
        origin.content = originPin;

        // 2. Update each waypoint with its sequence number (1-based index)
        // 'order' contains the indices of 'destinations' in the optimized order.
        order.forEach((destinationIndex, sequenceIndex) => {
            const marker = destinations[destinationIndex];
            const pin = new PinElement({
                glyphText: (sequenceIndex + 1).toString(),
                glyphColor: "white",
            });
            marker.content = pin;
        });

        logEntry(`Clinic Itinerary Optimized. Waypoint Order: ${JSON.stringify(order)}`);
        logEntry(`Total Optimized Distance: ${(route.distanceMeters / 1000).toFixed(2)} km`);
    })
    .catch((e) => {
        logEntry("Optimization failed: " + e.message);
    });
    // END TASK 5. Send a request to get an optimized route along several waypoints
}

/**
 * SAFE PARATRANSIT ARRIVAL
 * Goal: Ensure safety for elderly and disabled residents.
 */
async function precisionParatransit() {
    if (!destinations || destinations.length !== 1) {
        alert("Choose a single paratransit arrival destination first.");
        return;
    }

    clearRoutes();

    await setOrigin(originTransportAgencyCoords, originTransportAgencyName);

    // START TASK 6. Send a request to take into account the side of the road for easy access to destinations
    const request = {
        origin: originTransportAgencyCoords,
        destination: {
            location: destinations[0].position,
            /**
             * STUDENT TASK:
             * Apply safety arrival constraints for paratransit compliance.
             */
            sideOfRoad: true // Required for paratransit safety compliance
        },
        travelMode: 'DRIVING'
    };

    // Define the field mask (using JS SDK property names)
    const fields = [ 'path', 'distanceMeters', 'viewport' ];

    // Call the Routes Service
    routesService.computeRoutes({ ...request, fields })
    .then((response) => {
        const route = response.routes[0];

        // Render the optimized route on the map
        activePolylines = route.createPolylines();
        activePolylines.forEach(polyline => polyline.setMap(map));

        // Zoom the map to fit the entire route
        if (route.viewport) {
            map.fitBounds(route.viewport);
        }

        // Log the results
        const order = route.optimizedIntermediateWaypointIndices;
        logEntry("Precision safety arrival set.");
        logEntry(`Total Optimized Distance: ${(route.distanceMeters / 1000).toFixed(2)} km`);
    })
    .catch((e) => {
        logEntry("Optimization failed: " + e.message);
    });
    // END TASK 6. Send a request to get an optimized routes along several waypoints
}

/**
 * SUSTAINABILITY ANALYSIS
 * Goal: Calculate diesel fuel consumption and toll impact.
 */
async function analyzeEnvironmentalImpact() {
    // Validation: Ensure we have exactly two markers (Origin & Destination)
    if (!destinations || destinations.length !== 2) {
        alert("Choose two points on the map to generate a sustainability report.");
        return;
    }

    // Clear existing routes before drawing the new one
    clearRoutes();

    // START TASK 7. Send a request to calculate fuel consumption and toll costs
    // Build the request object
    const request = {
        origin: destinations[0].position,
        destination: destinations[1].position,
        travelMode: 'DRIVING',
        // 1. Change preference to OPTIMAL
        routingPreference: 'TRAFFIC_AWARE_OPTIMAL',
        // 2. Request the fuel-efficient reference route
        requestedReferenceRoutes: ['FUEL_EFFICIENT'],
        // 3. Request fuel consumption and toll data
        extraComputations: ['TOLLS', 'FUEL_CONSUMPTION'],
        routeModifiers: { vehicleInfo: { emissionType: 'DIESEL' } }
    };

    // Use JS SDK property names for the field mask
    // We add 'path' and 'viewport' so we can render the result visually
    const fields = [
        'travelAdvisory',
        'path',
        'viewport',
        'distanceMeters'];

    // Call computeRoutes using the Promise pattern
    routesService.computeRoutes({ ...request, fields })
    .then((response) => {
        const route = response.routes[0];

        // Render the route on the map
        activePolylines = route.createPolylines();
        activePolylines.forEach(polyline => polyline.setMap(map));

        // Zoom to fit the route
        if (route.viewport) {
            map.fitBounds(route.viewport);
        }

        // Extract and log the sustainability data
        // Access results via the top-level properties
        const fuel = (route.travelAdvisory?.fuelConsumptionMicroliters || 0) / 1000000; // Convert to liters
        const tolls = route.travelAdvisory?.tollInfo;

        logEntry(`Sustainability Report:`);
        logEntry(`- Estimated Fuel: ${fuel.toFixed(2)}L (Diesel)`);
        logEntry(`- Toll Data: ${tolls ? "Tolls present on route" : "No tolls detected"}`);
        logEntry(`- Total Distance: ${(route.distanceMeters / 1000).toFixed(2)} km`);
    })
    .catch((e) => {
        logEntry("Sustainability Analysis failed: " + e.message);
    });
    // END TASK 7. Send a request to calculate fuel consumption and toll costs
}

/**
 * TRANSIT EQUITY ASSESSMENT
 * Goal: Identify "service deserts" using Route Matrix[cite: 50, 60].
 */
async function assessNeighborhoodEquity() {
    if (!destinations || destinations.length < 2) {
        alert("Choose two or more destinations to assess neighborhood equity.");
        return;
    }

    clearRoutes();

    await addOriginStyledMarker(originTransportAgencyCoords, originTransportAgencyName);
    await addOriginStyledMarker(originGeneralHospitalCoords, originGeneralHospitalName);

    // START TASK 8. Send a request to get a matrix of routes between given origins and destinations
    const request = {
        origins: [ originTransportAgencyCoords, originGeneralHospitalCoords ],
        destinations: destinations.map(m => m.position),
        travelMode: 'DRIVING'
    };

    // Define the field mask (using JS SDK property names)
    const fields = [ 'durationMillis', 'distanceMeters', 'condition' ];

    // Call the Routes Service
    matrixService.computeRouteMatrix({ ...request, fields })
    .then((response) => {
        logEntry("<b>Neighborhood Equity Assessment Results:</b>");
        
        const originNames = [ originTransportAgencyName, originGeneralHospitalName ];

        response.matrix.rows.forEach((row, originIndex) => {
            logEntry(`<u>From ${originNames[originIndex]}:</u>`);
            row.items.forEach((item, destinationIndex) => {
                const condition = item.condition;
                // Check both condition AND status
                // status.code === 0 (or undefined in some cases) means OK
                const isRouteValid = item.condition === 'ROUTE_EXISTS' && (!item.status || item.status.code === 0);

                if (isRouteValid) {
                    const distanceKm = (item.distanceMeters / 1000).toFixed(2);
                    const durationMins = Math.round(item.durationMillis / 60000);
                    logEntry(`- Destination ${destinationIndex + 1}: ${condition} (${distanceKm} km, ${durationMins} mins)`);
                } else {
                    logEntry(`- Destination ${destinationIndex + 1}: <span style="color: red;">No route found</span>`);
                }
            });
        })
    })
    .catch((e) => {
        logEntry("Neighborhood equity assessment failed: " + e.message);
    });
    // END TASK 8. Send a request to get a matrix of routes between given origins and destinations
}

/**
 * PEAK CONGESTION MODELING
 * Goal: Future-proof city infrastructure using predictive data[cite: 55].
 */
async function modelPeakInfrastructure() {
    // Validation: Ensure we have exactly two markers (Origin & Destination)
    if (!destinations || destinations.length !== 2) {
        alert("Choose two points on the map to generate a peak congestion report.");
        return;
    }

    // Clear existing routes before drawing the new one
    clearRoutes();

    // Get departure time from the input field (format HH:MM)
    const timeValue = document.getElementById('departure-time').value;

    // VALIDATION: Check if timeValue exists and matches HH:MM format
    if (!timeValue || !timeValue.includes(':')) {
        alert("Please enter a valid departure time in HH:MM format.");
        return;
    }

    const [hours, minutes] = timeValue.split(':');
    const h = parseInt(hours);
    const m = parseInt(minutes);

    // VALIDATION: Check if hours and minutes are valid numbers
    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
        alert("Invalid time entered. Please use HH:MM format (e.g., 17:00).");
        return;
    }

    const departureDate = new Date();
    departureDate.setHours(h, m, 0, 0);

    // FIX: If the time has already passed today, set it to tomorrow
    const now = new Date();
    let dayLabel = "Today";
    if (departureDate <= now) {
        departureDate.setDate(departureDate.getDate() + 1);
        dayLabel = "Tomorrow";
    }

    // START TASK 9. Send a request to calculate route time based on time of day
    // Build the request object
    const request = {
        origin: destinations[0].position,
        destination: destinations[1].position,
        travelMode: 'DRIVING',
        // 1. Change preference to OPTIMAL
        routingPreference: 'TRAFFIC_AWARE_OPTIMAL',
        // 2. Select a traffic model
        trafficModel: 'pessimistic',
        // 2. Add departure time
        departureTime: departureDate,
    };

    // Define the field mask (using JS SDK property names)
    const fields = [ 'path', 'distanceMeters', 'viewport', 'durationMillis' ];

    routesService.computeRoutes({ ...request, fields })
    .then((response) => {
        const route = response.routes[0];

        // 1. Render the route on the map
        activePolylines = route.createPolylines();
        activePolylines.forEach(polyline => polyline.setMap(map));

        // 2. Zoom to fit the route
        if (route.viewport) {
            map.fitBounds(route.viewport);
        }

        // 3. Log useful information
        const durationMins = Math.round(route.durationMillis / 60000);
        logEntry(`Predictive Congestion Modeling Active:`);
        logEntry(`- Projected Distance: ${(route.distanceMeters / 1000).toFixed(2)} km`);
        logEntry(`- Projected Peak Duration: ${durationMins} mins`);
        logEntry(`- Modeling Departure: ${timeValue} ${dayLabel} (Local Time)`);
    })
    .catch((e) => {
        logEntry("Peak modeling failed: " + e.message);
    });
    // END TASK 9. Send a request to calculate route time based on time of day
}

function logEntry(msg) {
    const log = document.getElementById("log-window");
    log.innerHTML += `<div>> ${msg}</div>`;
    log.scrollTop = log.scrollHeight;
}

function resetPortal() {
    logEntry("Command Center reset to City Hall.");
    map.setCenter({ lat: 37.7749, lng: -122.4194 });
    map.setZoom(13);
}

function clearMarkers() {
    // Remove existing markers from the map
    destinations.forEach(m => { m.map = null; });
    destinations = [];
    // Clear the origin marker from the map and reset the variable
    if (origin) {
        origin.map = null;
        origin = null;
    }
    logEntry("All markers cleared.");
}

function clearRoutes() {
    // Clear existing routes from the map
    activePolylines.forEach(p => p.setMap(null));
    activePolylines = [];
    logEntry("All routes cleared.");
}

function clearMarkersAndRoutes() {
    clearMarkers();
    clearRoutes();
}

async function setOrigin(originCoords, name = "Dispatch Origin") {
    // Clear existing origin marker if it exists
    if (origin) origin.map = null;
    origin = await addOriginStyledMarker(originCoords, name);
}

async function addOriginStyledMarker(originCoords, name) {
    // Import PinElement and create a blue marker
    const { PinElement, AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    const bluePin = new PinElement({
        background: "#4285F4", // Blue color
        borderColor: "#174ea6",
        glyphColor: "white",
    });

    // Assign the new marker to the global 'origin' variable
    return new AdvancedMarkerElement({
        map: map,
        position: originCoords,
        content: bluePin,
        title: name
    });
}

/* --- NAVIGATION LOGIC --- */
function showLab(labId) {
    switch (labId) {
        // Avoid issues with invalid lab IDs
        case 'lab1':
        case 'lab2':
        case 'lab3':
        case 'lab4':
            if (labId === 'lab4') {
                window.location.href = '/index.html';
            } else if (labId !== 'lab3') {
                window.location.href = `/${labId}/index.html`;
            }
            break;
        default:
            window.alert("Invalid lab ID");
    }
}
