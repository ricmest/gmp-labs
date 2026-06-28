let map, infoWindow, currentPlace, currentlySelectedMarker;

async function initLab() {

    // TASK 2: Initialize the Map
    // TODO: Replace "INSERT YOUR MAP ID HERE" with the "MAP ID" you just created.

    const { Map, InfoWindow } = await google.maps.importLibrary("maps");
    const { Place, PlaceAutocompleteElement } = await google.maps.importLibrary("places");
    // Initialize the Map
    map = new Map(document.getElementById("map"), {
        center: { lat: 45.523, lng: -122.676 }, // Default city view
        zoom: 13,
        mapId: "INSERT YOUR MAP ID HERE" // This is necessary to enable Cloud Styling and use AdvancedMarkerElement
    });
    map.markersArray = [];
    infoWindow = new InfoWindow();

    // END TASK 2: Initialize the Map

    // TASK 3: Smart Autocomplete
    // TODO: Allow selection of addresses in the US with autocomplete

    // TODO: Selection of address displays details under the text box

    // END TASK 3: Smart Autocomplete

    document.getElementById("validate-btn").addEventListener("click", async () => {
        if (!currentPlace) return alert("Select an address first!");


        // TASK 4: Address validation
        // TODO: Validate the selected address

        // TODO: Display validation results

        // END TASK 4: Address validation

        // TASK 5: Geolocation

        // END TASK 5: Geolocation

    });

    document.getElementById("find-clinics").addEventListener("click", async () => {

        // TASK 6: Proximity SEARCH (Health Clinics)
        // TODO: Generate markers for health clinics and EV charging stations

        // END TASK 6: Proximity SEARCH (Health Clinics)

    });

    document.getElementById("find-ev").addEventListener("click", async () => {

        // TASK 7: TEXT SEARCH (EV Charging)

        // END TASK 7: TEXT SEARCH (EV Charging)

    });
}


initLab();

/* --- HELPER FUNCTIONS FROM HERE --- */

// TASK 8: Implementing Map Markers and UI Helpers

// TODO: Helper to generate a list and markers for a list of places

// TODO: Helper to clear all markers from the map

// TODO: Helper to display results in the sidebar   

// END TASK 8: Implementing Map Markers and UI Helpers

// TASK 9: Accessibility & Operational Awareness    
// TODO: Shared helper to show place details in InfoWindow

// END TASK 9: Accessibility & Operational Awareness  

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

    if (labId === 'lab2') {
        workspace.style.display = "flex";
        unavailable.style.display = "none";
        if (map) google.maps.event.trigger(map, "resize");
    } else {
        workspace.style.display = "none";
        unavailable.style.display = "flex";
    }
}
