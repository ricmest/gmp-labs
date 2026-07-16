/**
 * Architecture Reference: Modern GMP & Logistics Architect
 * Challenge Lab: Public Works & Urban Transportation Command Center
 */

// Global State Tracker Arrays & Objects
let map; // Store the map instance here
let addressMarker; // Store the validated address marker here
let infoWindow; // Use this to display marker details
let origins = [], destinations = [], stopovers = [];
let activePolylines = [];
let currentWorks = [];
let nearbyMarkers = [];

// Color palette for the 11 SF Supervisorial Districts
const districtColors = {
    "1": "#4285F4",  // Blue
    "2": "#EA4335",  // Red
    "3": "#FBBC04",  // Amber
    "4": "#34A853",  // Green
    "5": "#FF6D01",  // Orange
    "6": "#46BDC6",  // Teal
    "7": "#7B1FA2",  // Purple
    "8": "#F06292",  // Pink
    "9": "#AFB42B",  // Lime
    "10": "#5D4037", // Brown
    "11": "#607D8B"  // Grey-Blue
};

/**
 * ============================================================================
 * CHALLENGE 1 - INITIALIZATION, WEB COMPONENTS & DATA LAYERS
 * ============================================================================
*/
async function initMap() {

    // START_STUDENT_TODO: TASK 1 - Dynamic Library Imports
    // Import the 'maps' library to construct the map instance.

    // END_STUDENT_TODO: TASK 1

    // START_STUDENT_TODO: TASK 2 - Map Instantiation
    // Initialize the Map instance targeted at the DOM element with ID "map".
    // Configure it centered at San Francisco (37.7749, -122.4194), zoom 12,
    // and bind your Cloud-based Custom Map ID (mapId) to enable Advanced Markers.
    // Store your Map instance in the global `map` variable for later use.

    // END_STUDENT_TODO: TASK 2

    infoWindow = new google.maps.InfoWindow();

    // START_STUDENT_TODO: TASK 3 - Data Layer GeoJSON Ingestion
    // Load the local vector layer 'maintenance_districts.geojson' into the map's Data Layer.

    // END_STUDENT_TODO: TASK 3

    // START_STUDENT_TODO: TASK 4 - Data Layer Interactive Event Mapping
    // Add a click listener to the map's Data Layer to handle district feature interaction.
    // Extract 'sup_name' and 'sup_dist_name' from the clicked feature properties to populate the UI element.

    // END_STUDENT_TODO: TASK 4

    // Establish initial core DOM listeners
    document.getElementById("works-toggle").selected = false;
    document.getElementById("works-toggle").addEventListener("change", toggleCurrentWorks);
    document.getElementById("district-toggle").addEventListener('change', setDistrictStyle);
    document.getElementById("reset-btn").addEventListener('click', resetGlobalView);

    // Run initial data pipeline setup
    resetGlobalView();
    await initAutocompletePipeline();
}

/**
 * ============================================================================
 * CHALLENGE 2 - INTELLIGENT DISCOVERY & PLACES AUTOCOMPLETE
 * ============================================================================
 */
async function initAutocompletePipeline() {
    // START_STUDENT_TODO: TASK 5 - Places (New) Web Component Setup
    // Import the 'places' library and instantiate the next-gen 'PlaceAutocompleteElement'.
    // Bind its location bias contextually to the current map center view.

    // END_STUDENT_TODO: TASK 5

    // Inject the Autocomplete Web Component inside the standard layout panel container
    const container = document.getElementById("autocomplete-container");
    container.innerHTML = "";
    container.appendChild(autocomplete);

    // Handle UI layout plotting for autocomplete selections
    const plotPlace = async (place) => {
        const { PinElement, AdvancedMarkerElement } = await google.maps.importLibrary("marker");
        const munsIcon = new PinElement({
            glyphText: "🏛",
            background: "#4285F4",
            borderColor: "#1a73e8",
            glyphColor: "white"
        });

        if (addressMarker) addressMarker.setMap(null);

        addressMarker = new AdvancedMarkerElement({
            map: map,
            position: place.location,
            content: munsIcon,
            title: place.formattedAddress
        });

        map.setCenter(place.location);
        map.setZoom(16);
        document.getElementById('validation-output').innerHTML =
            `<div class="alert alert-success mt-2">Selected: ${place.formattedAddress}</div>`;
    };

    // START_STUDENT_TODO: TASK 6 - Autocomplete Event Processing
    // Add a 'gmp-select' listener to the Autocomplete element.
    // Use place.fetchFields to request the 'displayName', 'location', and 'formattedAddress' fields.

    // END_STUDENT_TODO: TASK 6

    const handleAddressValidationResponse = async (response) => {
        const { PinElement, AdvancedMarkerElement } = await google.maps.importLibrary("marker");
        const { location } = response.geocode;
        const formattedAddress = response.address.formattedAddress;

        const munsIcon = new PinElement({
            glyphText: "⌂",
            background: "#C2185B",
            borderColor: "#880E4F",
            glyphColor: "white"
        });

        if (addressMarker) addressMarker.setMap(null);

        addressMarker = new AdvancedMarkerElement({
            map: map,
            position: location,
            content: munsIcon,
            title: formattedAddress
        });

        // Attach dynamic contextual operational panel dispatch configuration triggers
        addressMarker.addListener("click", async () => {
            const content = `
                <div class="site-details">
                    <h5 class="mb-1 text-primary">${formatPostalAddressDetails(response.address.postalAddress)}</h5>
                    ${getNearbyButtonHtml(location)}
                    ${getNavigationButtonsHtml('address')}                        
                </div>
            `;
            document.getElementById('address-descriptor').innerHTML = content;

            addNearbyButtonListeners(["government_office", "local_government_office"]);
            addNavigationButtonsListeners('address', addressMarker);
        });

        map.setCenter(addressMarker.position);
        map.setZoom(16);
        document.getElementById('validation-output').innerHTML =
            `<div class="alert alert-success mt-2">Validated: ${formattedAddress}</div>`;
    }

    // Bind Address Validation API Processing Trigger
    document.getElementById("validate-btn").addEventListener("click", async () => {
        const userInput = autocomplete.value;
        if (!userInput) return alert("Please enter an address.");
        document.getElementById('validation-output').innerHTML = '';
        console.log("Validating and Plotting...");

        try {
            // START_STUDENT_TODO: TASK 7 - Address Validation API Implementation
            // 1. Import 'addressValidation' and 'marker' libraries.
            // 2. Formulate and submit an address validation request using 'AddressValidation.fetchAddressValidation'.
            // 3. Pass the response to 'handleAddressValidationResponse' for plotting and display.

            // END_STUDENT_TODO: TASK 7

        } catch (error) {
            console.error("Error validating address:", error);
            document.getElementById('validation-output').innerHTML =
                `<div class="alert alert-danger mt-2">Error connecting to Validation API.</div>`;
        }
    });
}

/**
 * ============================================================================
 * CHALLENGE 3 -  MANY-TO-MANY ANALYSIS & NEIGHBORHOOD EQUITY MATRIX
 * ============================================================================
 */

const handleRouteMatrixResponse = (response) => {
    const originNames = origins.map((marker, index) =>
        marker.title || `Origin ${index + 1}`
    );

    let assessmentHtml = `
        <div class="site-details">
            <h5 class="mb-2 text-primary">Neighborhood Equity Assessment Results</h5>
    `;

    response.matrix.rows.forEach((row, originIndex) => {
        assessmentHtml += `
        <div class="mb-3">
            <p class="mb-1"><u>${originNames[originIndex]}:</u></p>
            <ul class="mb-0">
        `;

        row.items.forEach((item, destinationIndex) => {
            const isRouteValid = item.condition === 'ROUTE_EXISTS' && (!item.status || item.status.code === 0);
            const itemTitle = destinations[destinationIndex].title || `Destination ${destinationIndex + 1}`;

            if (isRouteValid) {
                const distanceKm = (item.distanceMeters / 1000).toFixed(2);
                const durationMins = Math.round(item.durationMillis / 60000);

                assessmentHtml += `
                    <li>
                        <u>${itemTitle}</u><br>
                        ${distanceKm} km, ${durationMins} mins
                    </li>
                `;
            } else {
                assessmentHtml += `
                    <li>
                        <u>${itemTitle}</u>:
                        <span style="color: red;">NO ROUTE</span>
                    </li>
                `;
            }
        });

        assessmentHtml += `</ul></div>`;
    });

    assessmentHtml += `</div>`;
    document.getElementById('address-descriptor').innerHTML = assessmentHtml;
}

function initRouteMatrixPipeline() {
    document.getElementById("matrix-btn").addEventListener("click", async () => {
        console.log("Analyzing Response Matrix...");

        if (origins.length < 2 || destinations.length < 2 || stopovers.length !== 0) {
            alert("Please select two or more origins and destinations with no stopovers before service desert analysis.");
            return;
        }

        // START_STUDENT_TODO: TASK 8 - Route Matrix v2 Core Engine
        // 1. Import the modern 'routes' library.
        // 2. Restructure global tracking arrays into a spatial array configuration object.
        // 3. Formulate structural field masking declarations ('durationMillis', 'distanceMeters', 'condition').
        // 4. Call 'RouteMatrix.computeRouteMatrix' using the prepared execution arrays.

        // END_STUDENT_TODO: TASK 8
    });
}
initRouteMatrixPipeline();

/**
 * ============================================================================
 * CHALLENGE 4 - SINGLE VEHICLE DISPATCH, ECO-ROUTING & TURN-BY-TURN
 * ============================================================================
*/

const handleComputeRoutesResponse = (response) => {
    const route = response.routes[0];

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

    if (route.viewport) {
        map.fitBounds(route.viewport);
    }
}

function initRoutesV2Pipeline() {
    document.getElementById("optimize-btn").addEventListener("click", async () => {
        console.log("Dispatching Fleet via Routes API...");

        if (origins.length !== 1 || destinations.length !== 1) {
            alert("Please select exactly one origin and one destination before optimizing. You can also add stopovers if needed.");
            return;
        }

        try {
            // START_STUDENT_TODO: TASK 9 - Enterprise Routes API v2 Engine
            // 1. Import the modern 'routes' library.
            // 2. Implement the 'Route.computeRoutes' logic, factoring in destination arrays and dynamic travel settings.
            // 3. Add eco-routing options and intermediate waypoints dynamically to your payload configuration arrays.
            // 4. Call route.createPolylines() on the response object to overlay the encoded paths on the map context.
            // HINT:  const { Route } = ...

            // END_STUDENT_TODO: TASK 9

        } catch (error) {
            console.error("Route API error:", error);
            alert("Unable to optimize route.");
        }
    });
}
initRoutesV2Pipeline();

/**
 * ============================================================================
 * CHALLENGE 5 - COMPREHENSIVE LOCALIZED SPATIAL DISCOVERY (NEARBY PLACES SEARCH)
 * ============================================================================
 */

const handleNearbyPlace = async (place) => {
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
    const pin = new PinElement({
        glyphText: "🏢",
        background: "#4285F4",
        glyphColor: "white",
    });

    const marker = new AdvancedMarkerElement({
        map,
        position: place.location,
        title: place.displayName,
        content: pin,
    });

    marker.addListener("click", () => {
        infoWindow.setContent(`
              <strong>${place.displayName}</strong><br>Nearby Facility<br>  
              ${getNavigationButtonsHtml('info')}
        `);
        infoWindow.open(map, marker);
        const readyListener = infoWindow.addListener("domready", () => {
            addNavigationButtonsListeners('info', marker);
            // Context clean up: remove the listener so it doesn't duplicate on subsequent actions
            google.maps.event.removeListener(readyListener);
        });
    });

    nearbyMarkers.push(marker);
}

async function findNearbyFacilities(lat, lng, types) {
    nearbyMarkers.forEach(m => m.setMap(null));
    nearbyMarkers = [];

    // START_STUDENT_TODO: TASK 10 - Next-Gen Nearby Place Search (New) Implementation
    // 1. Import 'places' and 'marker' libraries.
    // 2. Build a native nearby extraction configuration model targeted at a center search position.
    // 3. Restrict output to field-masked arrays ('displayName', 'location', 'businessStatus').
    // 4. Execute the 'Place.searchNearby' query
    // 5. Iterate over each nearby place and pass it to 'handleNearbyPlace' to render on the map
    // 6. Fit the map bounds to the extracted locations

    // END_STUDENT_TODO: TASK 10
}

/**
 * ============================================================================
 * CHALLENGE 6 - PIPELINES, LAYOUT OVERLAYS & STRUCTURAL INTEGRATION PARSERS
 * ============================================================================
 */
function toggleCurrentWorks() {
    const isVisible = document.getElementById('works-toggle').selected;
    currentWorks.forEach(item => {
        item.setMap(isVisible ? map : null);
    });
}

function setDistrictStyle() {
    const isVisible = document.getElementById('district-toggle').selected;

    // START_STUDENT_TODO: TASK 11 - Declarative Data Layer Stylizer
    // Bind a functional execution engine inside 'map.data.setStyle' to dynamically theme
    // supervisorial polygons. Source the styling configurations directly from 'districtColors' based on 'sup_dist'.

    // END_STUDENT_TODO: TASK 11
}

function resetGlobalView() {
    // START_STUDENT_TODO: TASK 12 - Viewport Reset Actions
    // Program map center position reset configurations back to core town hall coordinates.

    // END_STUDENT_TODO: TASK 12

    document.getElementById('district-toggle').selected = true;
    setDistrictStyle();

    document.getElementById("works-toggle").selected = false;
    renderCurrentWorks();

    nearbyMarkers.forEach(m => m.setMap(null));
    nearbyMarkers = [];

    origins.forEach(m => m.setMap(null));
    origins = [];
    stopovers.forEach(m => m.setMap(null));
    stopovers = [];
    destinations.forEach(m => m.setMap(null));
    destinations = [];

    activePolylines.forEach(p => p.setMap(null));
    activePolylines = [];

    if (addressMarker) addressMarker.setMap(null);
    addressMarker = null;
    document.getElementById('validation-output').innerHTML = '';
    document.getElementById('address-descriptor').innerHTML = 'Select a marker for landmark info';
}

function parseWKT(wkt) {
    if (!wkt) return null;
    if (wkt.startsWith('POINT')) {
        const coords = wkt.match(/\((.*)\)/)[1].split(' ');
        return { lat: parseFloat(coords[1]), lng: parseFloat(coords[0]) };
    } else if (wkt.startsWith('LINESTRING')) {
        const pairs = wkt.match(/\((.*)\)/)[1].split(', ');
        return pairs.map(pair => {
            const coords = pair.trim().split(' ');
            return { lat: parseFloat(coords[1]), lng: parseFloat(coords[0]) };
        });
    }
    return null;
}

function parseCSV(csvText) {
    const lines = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
        const char = csvText[i];
        const nextChar = csvText[i + 1];

        if (inQuotes) {
            if (char === '"') {
                if (nextChar === '"') {
                    currentField += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                currentField += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                currentRow.push(currentField);
                currentField = '';
            } else if (char === '\n' || char === '\r') {
                currentRow.push(currentField);
                if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
                    lines.push(currentRow);
                }
                currentRow = [];
                currentField = '';
                if (char === '\r' && nextChar === '\n') i++;
            } else {
                currentField += char;
            }
        }
    }
    if (currentRow.length > 0 || currentField !== '') {
        currentRow.push(currentField);
        lines.push(currentRow);
    }

    const headers = lines[0];
    return lines.slice(1).map(row => {
        return headers.reduce((obj, header, i) => {
            obj[header] = row[i];
            return obj;
        }, {});
    });
}

async function renderCurrentWorks() {
    try {
        const response = await fetch('current_works.csv');
        const csvText = await response.text();
        const projects = parseCSV(csvText);

        currentWorks.forEach(marker => marker.setMap(null));
        currentWorks = [];

        const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

        projects.forEach(project => {
            const pointCoord = parseWKT(project['CoOrdinate Point']);
            if (pointCoord) {
                const pin = new PinElement({
                    glyphText: "🚧",
                    background: "#FBBC04",
                    glyphColor: "white",
                    scale: 0.8
                });

                const marker = new AdvancedMarkerElement({
                    position: pointCoord,
                    content: pin,
                    title: project['Name'],
                    map: null
                });

                marker.addListener("click", () => {
                    const content = `
                        <div class="site-details">
                            <h5 class="mb-1 text-primary">${project['Name']}</h5>
                            <p class="mb-1"><strong>Agency:</strong> ${project['Agency Name']}</p>
                            <p class="mb-1"><strong>Status:</strong> ${project['Project Status']} (${project['Project Phase']})</p>
                            <p class="mb-1"><strong>Type:</strong> ${project['Facility Type']}</p>
                            <p class="mb-1"><strong>Dates:</strong> ${project['Start Date']} - ${project['End Date']}</p>
                            <p class="mb-0"><strong>Description:</strong> ${project['Description'] || 'No description available'}</p>
                            ${getNearbyButtonHtml(pointCoord)}
                            ${getNavigationButtonsHtml('works')}
                        </div>
                    `;
                    document.getElementById('address-descriptor').innerHTML = content;

                    addNearbyButtonListeners(['transit_depot']);
                    addNavigationButtonsListeners('works', marker);
                });

                currentWorks.push(marker);
            }
        });
        console.log(`Loaded ${currentWorks.length} work sites from CSV.`);
    } catch (error) {
        console.error("Error loading current works CSV:", error);
    }
}

function getNearbyButtonHtml(pointCoord) {
    return `
        <button class="btn btn-sm btn-outline-primary mt-2 w-100 nearby-search-btn" 
                data-lat="${pointCoord.lat}" 
                data-lng="${pointCoord.lng}">
            <i class="bi bi-geo-alt-fill me-1"></i> Find Nearby Facilities
        </button>
    `;
}

function addNearbyButtonListeners(types) {
    const btn = document.querySelector('.nearby-search-btn');
    if (btn) {
        btn.onclick = async (e) => {
            const lat = parseFloat(e.currentTarget.getAttribute('data-lat'));
            const lng = parseFloat(e.currentTarget.getAttribute('data-lng'));
            await findNearbyFacilities(lat, lng, types);
        };
    }
}

function getNavigationButtonsHtml(prefix) {
    return `
        <button class="btn btn-sm btn-outline-info mt-2 w-100 ${prefix}-add-origin-btn"> 
            <i class="bi bi-geo-alt-fill me-1"></i> Add to Starting Points
        </button>
        <button class="btn btn-sm btn-outline-info mt-2 w-100 ${prefix}-add-waypoint-btn"> 
            <i class="bi bi-signpost-split-fill me-1"></i> Add To Stopovers
        </button>
        <button class="btn btn-sm btn-outline-info mt-2 w-100 ${prefix}-add-end-btn">
            <i class="bi bi-flag-fill me-1"></i> Add to Ending Points
        </button>
    `;
}

function addNavigationButtonsListeners(prefix, marker) {
    const btn1 = document.querySelector(`.${prefix}-add-origin-btn`);
    if (btn1) {
        btn1.onclick = async (e) => {
            const { PinElement } = await google.maps.importLibrary("marker");
            marker.content = new PinElement({
                background: "#4285F4",
                borderColor: "#174ea6",
                glyphText: (origins.length + 1).toString(),
                glyphColor: "white",
            });
            origins.push(marker);
        };
    }

    const btn2 = document.querySelector(`.${prefix}-add-waypoint-btn`);
    if (btn2) {
        btn2.onclick = async (e) => {
            const { PinElement } = await google.maps.importLibrary("marker");
            marker.content = new PinElement({
                background: "#00ACC1",
                borderColor: "#006064",
                glyphText: (stopovers.length + 1).toString(),
                glyphColor: "white",
            });
            stopovers.push(marker);
        };
    }

    const btn3 = document.querySelector(`.${prefix}-add-end-btn`);
    if (btn3) {
        btn3.onclick = async (e) => {
            const { PinElement } = await google.maps.importLibrary("marker");
            marker.content = new PinElement({
                background: "#EA4335",
                borderColor: "#B31412",
                glyphText: (destinations.length + 1).toString(),
                glyphColor: "white",
            });
            destinations.push(marker);
        };
    }
}

function formatPostalAddressDetails(postalAddress) {
    if (!postalAddress) {
        return `<h5 class="mb-1 text-primary">Address unavailable</h5>`;
    }

    const streetAddress = (postalAddress.addressLines || []).join("<br>");
    const cityStateZip = [
        postalAddress.postalCode,
        postalAddress.locality,
        postalAddress.administrativeArea
    ].filter(Boolean).join(", ");

    return `
        <h5 class="mb-1 text-primary">Validated Address</h5>
        <p class="mb-1"><strong>Street:</strong><br>${streetAddress || "Not available"}</p>
        <p class="mb-1"><strong>ZIP/City/State:</strong><br>${cityStateZip || "Not available"}</p>
        <p class="mb-0"><strong>Country:</strong><br>${postalAddress.regionCode || "Not available"}</p>
    `;
}

// Global script bootstrap execution entrypoint
initMap();

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
            } else {
                window.location.href = `/${labId}/index.html`;
            }
            break;
        default:
            window.alert("Invalid lab ID");
    }
}
