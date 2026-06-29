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

    // TASK 3: Core Initialization & Advanced Markers
    // TODO: Import the necessary libraries

    // TODO: Initialize the Map   

    // TODO: Add the click listener to drop a marker

    // END TASK 3: Core Initialization & Advanced Markers

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

    // TASK 4: Send a request to get traffic aware routing between two points

    // END TASK 4: Send a request to get traffic aware routing between two points
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

    // TASK 5: Send a request to get an optimized route along several waypoints

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

    // TASK 6: Safe Paratransit Arrival (Side of Road)
    // TODO: Send a request to take into account the side of the road for easy access to destinations

    // END TASK 6: Safe Paratransit Arrival (Side of Road)
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

    // TASK 7: Sustainability & Environmental Impact
    // TODO: Send a request to calculate fuel consumption and toll costs


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

    // TASK 8: Transit Equity Assessment (Route Matrix)
    // TODO: Send a request to get a matrix of routes between given origins and destinations

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

    // TASK 9: Peak Congestion Modeling (Predictive Traffic)
    // TODO: Send a request to calculate route time based on time of day


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
    const workspace = document.getElementById('lab-workspace');
    const unavailable = document.getElementById('unavailable-workspace');
    const navItems = document.querySelectorAll('.nav-item-global');

    navItems.forEach((item, index) => {
        item.classList.remove('active');
        if (labId === `lab${index + 1}`) {
            item.classList.add('active');
        }
    });

    if (labId === 'lab3') {
        workspace.style.display = "flex";
        unavailable.style.display = "none";
        if (map) google.maps.event.trigger(map, "resize");
    } else {
        workspace.style.display = "none";
        unavailable.style.display = "flex";
    }
}
