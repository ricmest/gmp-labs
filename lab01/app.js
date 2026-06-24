let map;
const cityHallCoords = { lat: 37.7792, lng: -122.4192 }; // Default San Francisco City Hall

async function initMap() {

    // TASK 4: Initialize the Map
    // TODO: Replace "INSERT YOUR MAP ID HERE" with the "MAP ID" you just created.

    // Request libraries when needed, not in the script tag.
    const { Map } = await google.maps.importLibrary("maps");

    map = new Map(document.getElementById("map"), {
        center: cityHallCoords,
        zoom: 13,
        mapId: "INSERT_YOUR_MAP_ID_HERE",
    });
    // END TASK 4: Initialize the Map

    // TASK 5: Geolocation
    // TODO: Add the function to dynamically pan and zoom the map to the user's location

    // END TASK 5: Geolocation   

    // TASK 6: Basic Markers (Legacy)
    // TODO: Create a basic google.maps.Marker at City Hall

    // END TASK 6: Basic Markers (Legacy)

    // TASK 7: Advanced Markers (Modern)
    // TODO: Import Marker library and create an AdvancedMarkerElement

    // END TASK 7: Advanced Markers (Modern)

    // TASK 8: Data-Driven Styling (School Districts)
    // TODO: Use getFeatureLayer to style the 'SCHOOL_DISTRICT' layer

    // END TASK 8: Data-Driven Styling (School Districts)

    // TASK 9: GeoJSON Data Layer
    // TODO: Load the provided GeoJSON file and set dynamic styling

    // END TASK 9: GeoJSON Data Layer

    const resetBtn = document.getElementById("reset-btn");

    // TASK 10: Custom Controls
    // TODO: Push the 'Reset' button into the map's TOP_LEFT control position

    // END TASK 10: Custom Controls

    const panoBtn = document.getElementById("pano-btn");

    // TASK 11: Street View Service
    // TODO: Initialize a Street View Panorama in the 'pano' div

    // END TASK 11: Street View Service

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
    const workspace = document.getElementById('lab-workspace');
    const unavailable = document.getElementById('unavailable-workspace');
    const navItems = document.querySelectorAll('.nav-item-global');

    navItems.forEach((item, index) => {
        item.classList.remove('active');
        if (labId === `lab${index + 1}`) {
            item.classList.add('active');
        }
    });

    if (labId === 'lab1') {
        workspace.style.display = "flex";
        unavailable.style.display = "none";
        if (map) google.maps.event.trigger(map, "resize");
    } else {
        workspace.style.display = "none";
        unavailable.style.display = "flex";
    }
}