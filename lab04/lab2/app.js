let map, infoWindow, currentPlace, currentlySelectedMarker;

async function initLab() {

    // TASK 1: Initialize and secure the map-- >
    // TODO: Initialize the map and create a map style on the Cloud Console-- >
    // Create a Map Style and corresponding ID to use here(done in lab 1, if possible this should be done when setting up the lab)-->
    // Import required libraries-- >
    const { Map, InfoWindow } = await google.maps.importLibrary("maps");
    const { Place, PlaceAutocompleteElement } = await google.maps.importLibrary("places");
    < !--3. Initialize the Map-- >
        map = new Map(document.getElementById("map"), {
            center: { lat: 45.523, lng: -122.676 }, // Default city view
            zoom: 13,
            // TODO: Replace "INSERT_YOUR_MAP_ID_HERE" with the "MAP ID" you just created.
            mapId: "INSERT_YOUR_MAP_ID_HERE"
        });
    map.markersArray = [];
    infoWindow = new InfoWindow();
    // END TASK 1 BLOCK

    // TASK 2: Smart Autocomplete-- >
    // TODO: Allow selection of addresses in the US with autocomplete-- >
    // Allow autocompletion on addresses in the text box-- >
    const autocomplete = new PlaceAutocompleteElement({
        // Restrict results to a specific region (e.g., 'us')
        includedRegionCodes: ['us']
    });
    document.getElementById("autocomplete-container").appendChild(autocomplete);

    // Selection of address displays details under the text box-- >
    autocomplete.addEventListener('gmp-select', async ({ placePrediction }) => {
        currentPlace = placePrediction.toPlace();

        // Ensure you use a Field Mask to save taxpayer budget!
        await currentPlace.fetchFields({
            fields: ['displayName', 'formattedAddress']
        });

        document.getElementById("place-name").textContent = currentPlace.displayName;
        document.getElementById("place-address").textContent = currentPlace.formattedAddress;
        document.getElementById("selected-place-details").classList.remove("d-none");
    });
    // END TASK 2 BLOCK

    document.getElementById("validate-btn").addEventListener("click", async () => {
        if (!currentPlace) return alert("Select an address first!");

        // TASK 3: Address validation-- >
        // TODO: Validate the selected address-- >

        // Call the Address Validation API-- >
        // Narrative: Ensure this isn't a vacant lot or missing an apartment number.
        const { AddressValidation } = await google.maps.importLibrary("addressValidation");

        const request = {
            address: {
                regionCode: currentPlace.regionCode || 'US',
                addressLines: [currentPlace.formattedAddress]
            }
        };

        const result = await AddressValidation.fetchAddressValidation(request);

        // Display validation results-- >
        const validationInfo = [];

        if (result.verdict) {
            validationInfo.push(`Validation Grade: ${result.verdict.validationGranularity || 'N/A'}`);
            validationInfo.push(`Address Complete: ${result.verdict.addressComplete ? 'Yes' : 'No'}`);
            validationInfo.push(`Has Unconfirmed Components: ${result.verdict.hasUnconfirmedComponents ? 'Yes' : 'No'}`);
        }

        if (result.address) {
            validationInfo.push(`\nConfirmed Address: ${result.address.formattedAddress || 'N/A'}`);

            if (result.address.missingComponentTypes && result.address.missingComponentTypes.length > 0) {
                validationInfo.push(`Missing Components: ${result.address.missingComponentTypes.join(', ')}`);
            }
        }

        alert(validationInfo.join('\n'));
        console.log("Validating:", currentPlace.id);
        // END TASK 3 BLOCK

    });

    document.getElementById("locate-me").addEventListener("click", () => {

        // --- TASK 4: GEOLOCATION ---
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setCenter(pos);
            });
        }
        // END TASK 4 BLOCK

    });

    document.getElementById("find-clinics").addEventListener("click", async () => {

        // --- TASK 5: NEARBY SEARCH (Health Clinics) ---
        // TODO this part of the lab also needs to add the functions to generate markers for health clinics and EV charging stations
        // Ask the user to add them after the HELPER FUNCTIONS FROM HERE marker
        // - generateListAndMarkers
        // - clearAllMarkers
        // - displayResults
        // - showPlaceDetails

        const center = map.getCenter();
        const request = {
            locationRestriction: {
                center: { lat: center.lat(), lng: center.lng() },
                radius: 5000
            },
            includedTypes: ['hospital', 'medical_clinic'],
            maxResultCount: 10,
            fields: ['displayName', 'location', 'businessStatus', 'regularOpeningHours']
        };

        const { places } = await Place.searchNearby(request);

        if (places && places.length > 0) {
            await generateListAndMarkers(places);
        } else {
            alert("No health clinics found nearby.");
        }
        // END TASK 5 BLOCK

    });

    document.getElementById("find-ev").addEventListener("click", async () => {

        // --- TASK 6: TEXT SEARCH (EV Charging) ---
        const { Place } = await google.maps.importLibrary("places");

        const center = map.getCenter();
        const evOptions = {
            includedType: 'electric_vehicle_charging_station',
            rankPreference: 'RELEVANCE',
            useStrictTypeFiltering: true
        };

        const request = {
            textQuery: "EV Charging Station",
            locationBias: {
                center: { lat: center.lat(), lng: center.lng() },
                radius: 5000
            },
            ...evOptions,
            maxResultCount: 10,
            fields: ['displayName', 'location', 'formattedAddress', 'evChargeOptions']
        };

        const { places } = await Place.searchByText(request);

        if (places && places.length > 0) {
            await generateListAndMarkers(places);
        } else {
            alert("No EV charging stations found nearby.");
        }
    });
    // END TASK 6 BLOCK

}

initLab();

/* --- HELPER FUNCTIONS FROM HERE --- */

// Helper to generate a list and markers for a list of places
async function generateListAndMarkers(places) {
    // Ensure you have loaded the 'marker' library
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    displayResults(places);
    clearAllMarkers();
    places.forEach(place => {
        const marker = new AdvancedMarkerElement({
            position: place.location,
            map: map,
            gmpClickable: true, // Must be set to true for clicks to be detected
            title: place.displayName
        });
        marker.addEventListener('gmp-click', () => {
            // do not centre the map on the selected place when clicking on marker, as it feels unnatural
            showPlaceDetails(place, marker);
        });
        place.marker = marker;
        map.markersArray.push(marker);
    });
}

// Helper to clear all markers from the map
function clearAllMarkers() {
    map.markersArray.forEach(marker => marker.setMap(null));
    map.markersArray = [];
    currentlySelectedMarker = null;
}

// Helper to display results in the sidebar
function displayResults(places) {
    const list = document.getElementById("results-list");
    list.innerHTML = "";
    places.forEach(place => {
        const item = document.createElement("button");
        item.className = "list-group-item list-group-item-action small";
        item.innerHTML = `<strong>${place.displayName}</strong>`;
        item.onclick = () => {
            // centre the map on the selected place when clicking on list item, so item is always in view
            map.setCenter(place.location);
            showPlaceDetails(place, place.marker);
        };
        list.appendChild(item);
    });
}

// Shared helper to show place details in InfoWindow
// This function contains the code for tasks 8/9
// Copy and paste the entire function and then describe in detail the block for tasks 8/9
async function showPlaceDetails(place, marker) {
    // Highlight the selected marker
    if (currentlySelectedMarker) {
        // Reset previously selected marker to default
        currentlySelectedMarker.content = null;
        currentlySelectedMarker.zIndex = null;
    }

    if (marker) {
        // Highlight new marker (blue color and bring to front)
        const { PinElement } = await google.maps.importLibrary("marker");
        const bluePinElement = new PinElement({
            background: "#4285F4",
            borderColor: "#1a73e8",
            glyphColor: "#ffffff"
        });
        marker.content = bluePinElement.element;
        marker.zIndex = 1000;
        currentlySelectedMarker = marker;
    }

    // TODO: Tasks 8/9 - show details with AddressDescriptor and Accessibility
    // This part of the function is one of the concepts that needs to be covered in the lab.
    // Fetch additional fields for detailed information

    // TASK 8 / 9: AddressDescriptor and Accessibility-- >
    await place.fetchFields({
        fields: ['addressDescriptor', 'accessibilityOptions', 'displayName', 'formattedAddress']
    });

    let content = `<div><strong>${place.displayName}</strong><br>`;
    content += `<em>${place.formattedAddress || ''}</em><br>`;

    if (place.addressDescriptor) {
        content += `<br><strong>Address Details:</strong><br>`;
        if (place.addressDescriptor.areas) {
            content += `Areas: ${place.addressDescriptor.areas.map(a => `<em>${a.place.displayName}</em>`).join(' ; ')}<br>`;
        }
        if (place.addressDescriptor.landmarks) {
            content += `Landmarks: ${place.addressDescriptor.landmarks.map(l => `<em>${l.place.displayName}</em>`).join(' ; ')}<br>`;
        }
    }

    if (place.accessibilityOptions && (place.accessibilityOptions.wheelchairAccessibleEntrance !== undefined || place.accessibilityOptions.wheelchairAccessibleParking !== undefined)) {
        content += `<br><strong>Accessibility:</strong><br>`;
        if (place.accessibilityOptions.wheelchairAccessibleEntrance !== undefined) {
            content += `Wheelchair Accessible Entrance: ${place.accessibilityOptions.wheelchairAccessibleEntrance ? 'Yes' : 'No'}<br>`;
        }
        if (place.accessibilityOptions.wheelchairAccessibleParking !== undefined) {
            content += `Wheelchair Accessible Parking: ${place.accessibilityOptions.wheelchairAccessibleParking ? 'Yes' : 'No'}<br>`;
        }
    }

    content += `</div>`;
    infoWindow.setContent(content);
    // Open using the marker as anchor to ensure proper positioning above the marker
    infoWindow.open(map, marker);
    // END TASKS 8/9 BLOCK

    // Ensure the marker is reset when the infoWindow is closed
    google.maps.event.addListenerOnce(infoWindow, 'closeclick', () => {
        if (currentlySelectedMarker) {
            // Reset previously selected marker to default
            currentlySelectedMarker.content = null;
            currentlySelectedMarker.zIndex = null;
            currentlySelectedMarker = null;
        }
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
            } else if (labId !== 'lab2') {
                window.location.href = `/${labId}/index.html`;
            }
            break;
        default:
            window.alert("Invalid lab ID");
    }
}
