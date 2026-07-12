let map;
const cityHallCoords = { lat: 37.7792, lng: -122.4192 }; // Default San Francisco City Hall

async function initMap() {

    // TASK 2 & 3: Initialize the Map
    // TODO: Initialize map with a Map ID to enable Cloud Styling and the Vector Engine

    // Request libraries when needed, not in the script tag.
    const { Map } = await google.maps.importLibrary("maps");

    map = new Map(document.getElementById("map"), {
        center: cityHallCoords,
        zoom: 13,
        // TODO: Replace "INSERT_YOUR_MAP_ID_HERE" with the "MAP ID" you just created.
        mapId: "INSERT_YOUR_MAP_ID_HERE"
    });
    // END TASK 2 & 3: Initialize the Map

    // TASK 4: Geolocation
    document.getElementById("locate-btn").addEventListener("click", () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                /* TODO: Center the map on user location and zoom in */
                map.panTo(pos);
                //map.panTo(pos);
                map.setZoom(15);

            });
        }
    });
    // END TASK 4: Geolocation

    // TASK 5: Basic Markers (Legacy)
    // TODO: Create a basic google.maps.Marker at City Hall
    const legacyMarker = new google.maps.Marker({
        position: cityHallCoords,
        map: map,
        title: "City Hall (Legacy Marker)"
    });
    // END TASK 5: Basic Markers (Legacy)

    // TASK 6: Advanced Markers (Modern)
    // TODO: Import Marker library and create an AdvancedMarkerElement
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

    const pin = new PinElement({ background: "#FBBC04" });
    const advMarker = new AdvancedMarkerElement({
        map,
        position: { lat: 37.7749, lng: -122.4194 },
        content: pin,
        title: "Main Library (Advanced Marker)"
    });
    // END TASK 6: Advanced Markers (Modern)

    // TASK 7: Data-Driven Styling (School Districts)
    // TODO: Use getFeatureLayer to style the 'SCHOOL_DISTRICT' layer
    const featureLayer = map.getFeatureLayer('SCHOOL_DISTRICT');

    const applySchoolStyles = () => {
        const isVisible = document.getElementById('school-toggle').selected;

        featureLayer.style = (options) => {
            // Only show if the toggle is 'ON'
            if (!isVisible) {
                return {};
            }

            if (options.feature.placeId === "ChIJTyCM6zGAhYARcobigWphLnM") {
                return {
                    fillColor: "#003366",
                    fillOpacity: 0.3,
                    strokeColor: "#003366",
                    strokeWeight: 2,
                };
            }
        };
    };
    // 3. Set the initial style (hidden by default)
    applySchoolStyles();
    // 4. Update the map whenever the switch is toggled
    document.getElementById('school-toggle').addEventListener('change', applySchoolStyles);
    // END TASK 7: Data-Driven Styling (School Districts)

    // TASK 8: GeoJSON Data Layer
    // TODO: Load the provided GeoJSON file and set dynamic styling

    // 1. Load the data once
    map.data.loadGeoJson('flood_zones.geojson'); // https://data.sfgov.org/Energy-and-Environment/FEMA-FIRM-Flood-Hazards-Coastal-2021-Update/jyce-e25k/about_data
    // 2. Define the styling logic in a reusable way
    const applyFloodStyles = () => {
        const isVisible = document.getElementById('flood-toggle').selected;

        map.data.setStyle((feature) => {
            // Only show if the toggle is 'ON'
            if (!isVisible) {
                return { visible: false };
            }

            // Determine color based on the 'risk_level' property in the GeoJSON
            const risk = feature.getProperty('fld_zone');
            let color = 'gray'; // Default

            if (risk === 'AE' || risk === 'AO' || risk === 'VE') {
                color = '#dc3545'; // Matching the Red Legend
            } else if (risk === 'D') {
                color = '#ffc107'; // Matching the Orange/Warning Legend
            } else if (risk === 'X') {
                color = '#198754'; // Matching the Green/Low Legend
            }

            return {
                fillColor: color,
                strokeColor: color,
                strokeWeight: 2,
                fillOpacity: 0.4,
                visible: true
            };
        });
    };
    // 3. Set the initial style (hidden by default)
    applyFloodStyles();
    // 4. Update the map whenever the switch is toggled
    document.getElementById('flood-toggle').addEventListener('change', applyFloodStyles);
    // END TASK 8: GeoJSON Data Layer

    const resetBtn = document.getElementById("reset-btn");

    // TASK 9: Custom Controls
    // TODO: Push the 'Reset' button into the map's TOP_LEFT control position
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(resetBtn);

    // Add your click logic
    resetBtn.addEventListener("click", () => {
        map.panTo({ lat: 37.7749, lng: -122.4194 });
        map.setZoom(12);
    });
    // END TASK 9: Custom Controls

    const panoBtn = document.getElementById("pano-btn");

    // TASK 10: Street View Service
    // TODO: Initialize a Street View Panorama in the 'pano' div
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(panoBtn);

    const panorama = new google.maps.StreetViewPanorama(
        document.getElementById("pano"),
        { position: cityHallCoords, pov: { heading: 165, pitch: 0 } }
    );
    map.setStreetView(panorama);
    // END TASK 10: Street View Service

    // Add your click logic
    panoBtn.addEventListener("click", () => {
        const panoDiv = document.getElementById("pano");
        const mapDiv = document.getElementById("map");

        if (panoDiv.style.display === "none" || panoDiv.style.display === "") {
            // Show it
            mapDiv.style.height = "70vh";
            panoDiv.style.height = "30vh";
            panoDiv.style.display = "block";

        } else {
            // Hide it
            mapDiv.style.height = "100vh";
            panoDiv.style.height = "0vh";
            panoDiv.style.display = "none";
        }
    });

}

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
            } else if (labId !== 'lab1') {
                window.location.href = `/${labId}/index.html`;
            }
            break;
        default:
            window.alert("Invalid lab ID");
    }
}
