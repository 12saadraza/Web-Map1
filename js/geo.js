
//  var map = L.map('map').setView([36.3167, 74.6500], 9);
  var map = L.map('map', {
closePopupOnClick: false // Disable closing popups on map click
}).setView([24.8607, 67.0011], 9);

  // Add base layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Add these right after map initialization
let activePopup = null;

// Add popup control handler
map.on('popupopen', function(e) {
    if (activePopup && activePopup !== e.popup) {
        map.closePopup(activePopup);
    }
    activePopup = e.popup;
});

map.on('popupclose', function(e) {
    if (activePopup === e.popup) {
        activePopup = null;
    }
});
  function addLabels(feature, layer) {
      if (feature.properties && feature.properties.name) {
          layer.bindTooltip(feature.properties.name, { permanent: false, direction: 'auto' });
      }
  }
  function searchData() {
    var input = document.getElementById('searchInput').value.toLowerCase();
    var selectedLayers = [];

    // List of your checkbox IDs
    var checkboxes = ['villagesCheckbox', 'villages1Checkbox', 'passesCheckbox', 'hotelCheckbox', 'touristPointsCheckbox', 'potholesCheckbox'];
    checkboxes.forEach(function (checkboxId) {
        var checkbox = document.getElementById(checkboxId);
        if (checkbox && checkbox.checked) {
            selectedLayers.push(checkboxId.replace('Checkbox', '').toLowerCase());
        }
    });

// Function to create markers with popups
function createMarker(feature, latlng, iconType) {
    let marker = L.marker(latlng, { 
        icon: icons[iconType],
        riseOnHover: true  // Bring marker to front when hovering
    });

    if (feature.properties) {
        marker.bindPopup(createPopupContent(feature), { 
            autoClose: false,
            closeButton: false, // We'll add custom close button
            className: 'forced-popup'
        });

        // Add custom close button
        marker.on('popupopen', function(e) {
            const popup = e.popup;
            const closeBtn = L.DomUtil.create('button', 'popup-close');
            closeBtn.innerHTML = '×';
            closeBtn.onclick = () => map.closePopup(popup);
            
            popup.getElement()
                .querySelector('.leaflet-popup-content-wrapper')
                .prepend(closeBtn);
        });
    }
    return marker;
}
// Apply to various layers
var touristPointsLayer = L.geoJSON.ajax('src/touristpoints1.geojson', {
    pointToLayer: function (feature, latlng) {
        return createMarker(feature, latlng, 'touristpoints');
    }
}).addTo(map);

var hotelsLayer = L.geoJSON.ajax('src/hotels2.geojson', {
    pointToLayer: function (feature, latlng) {
        return createMarker(feature, latlng, 'hotels');
    }
}).addTo(map);

var passesLayer = L.geoJSON.ajax('src/passes.geojson', {
    pointToLayer: function (feature, latlng) {
        return createMarker(feature, latlng, 'passes');
    }
}).addTo(map);

var villagesLayer = L.geoJSON.ajax('src/villages.geojson', {
    pointToLayer: function (feature, latlng) {
        return createMarker(feature, latlng, 'villages');
    }
}).addTo(map);


    // Highlight and zoom to matching features
    selectedLayers.forEach(function (layerName) {
        if (window[layerName + 'Layer']) {
            window[layerName + 'Layer'].eachLayer(function (layer) {
                if (layer.feature && layer.feature.properties) {
                    var name = layer.feature.properties.name;
                    if (name && name.toLowerCase().includes(input)) {
                        // Highlight the feature
                        if (layer.feature.geometry.type === "Polygon" || layer.feature.geometry.type === "LineString") {
                            // For polygons or lines, apply style
                            layer.setStyle({
                                weight: 5,
                                color: '#ff0000', // Red border color
                                fillColor: '#ff0000', // Red fill color
                                fillOpacity: 0.5 // Semi-transparent fill
                            });
                            map.fitBounds(layer.getBounds()); // Zoom to the geometry
                        } else if (layer.feature.geometry.type === "Point") {
                            // For points, update the icon to a highlighted version
                            layer.setIcon(
                                L.icon({
                                    iconUrl: 'icons/highlighted-marker.svg', // Highlighted marker icon
                                    iconSize: [50, 50],
                                    iconAnchor: [25, 50], // Position the icon correctly
    popupAnchor: [0, -50], // Position the popup above the bubble
    className: 'bubble-marker' // Larger size for emphasis
                                })
                            );
                            var coordinates = layer.feature.geometry.coordinates;
                            map.setView([coordinates[1], coordinates[0]], 12); // Center and zoom
                        }

                        // Reset styles after a timeout
                        setTimeout(function () {
                            if (layer.feature.geometry.type === "Polygon" || layer.feature.geometry.type === "LineString") {
                                // Reset vector layer style
                                layer.setStyle({
                                    weight: 2,
                                    color: '#3388ff', // Default border color
                                    fillColor: '#3388ff', // Default fill color
                                    fillOpacity: 0.2 // Default opacity
                                });
                            } else if (layer.feature.geometry.type === "Point") {
                                // Reset marker icon to original
                                layer.setIcon(
                                    icons[layerName] // Use the original icon from your `icons` object
                                );
                            }
                        }, 3000); // Reset highlight after 3 seconds
                    }
                }
            });
        }
    });
}



  // Event listener for Enter key in the search input
  document.getElementById('searchInput').addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
          searchData();
      }
  });
  // Define custom icons using the names of the GeoJSON files
  var icons = {
      hotels: L.icon({ iconUrl: 'icons/hotel.svg', iconSize: [20, 20] }),
      touristpoints: L.icon({ iconUrl: 'icons/touristpoint.svg', iconSize: [35, 35] }),
      passes: L.icon({ iconUrl: 'icons/village1.svg', iconSize: [15, 15] }),
      glaciers: L.icon({ iconUrl: 'icons/glacier.png', iconSize: [15, 15] }),
      villages: L.icon({ iconUrl: 'icons/village.svg', iconSize: [15, 15] }),
      villages1: L.icon({ iconUrl: 'icons/village1.svg', iconSize: [20, 20] }), // Proper icon
      highlighted: L.icon({
          iconUrl: 'icons/highlighted-marker.svg',
          iconSize: [50, 50],
          iconAnchor: [25, 50],
          popupAnchor: [0, -50],
          className: 'bubble-marker'
      }),

    highlighted: L.icon({ iconUrl: 'icons/highlighted-marker.svg', iconSize: [30, 30] })
      // Add other icons as needed
  };

  // Modify pointToLayer function to use the appropriate icon
  function pointToLayer(feature, latlng, layerType) {
      return L.marker(latlng, { icon: icons[layerType] });
  }

  // Define and load layers with custom icons
  var boundaryLayer = L.geoJSON.ajax('src/boundary.geojson').addTo(map);
 //* var hotelsLayer = L.geoJSON.ajax('src/hotels.geojson', {
     // pointToLayer: function(feature, latlng) {
      //    return pointToLayer(feature, latlng, 'hotels');
    //  }
  //}).addTo(map);

  var passesLayer = L.geoJSON.ajax('src/passes.geojson', {
      pointToLayer: function(feature, latlng) {
  var marker = L.marker(latlng, { icon: icons.passes });

  if (feature.properties) {
      var popupContent = '';
      if (feature.properties.name) {
          popupContent += '<strong>'+feature.properties.name +'</strong>'+ '<br>';
      }
      if (feature.properties.desc) {
          popupContent +=feature.properties.desc;
      }
      if (feature.properties.imageUrl) {
          popupContent += '<img src="' + feature.properties.imageUrl + '" alt="' + feature.properties.name + '" style="width:300px; height:200px; cursor:pointer; border:2px solid black;">';
}

      marker.bindPopup(popupContent, { autoClose: false });
  }

  return marker;
},
onEachFeature: function(feature, layer) {
  // Check if the feature has a property 'name' and bind a tooltip
  if (feature.properties && feature.properties.name) {
      layer.bindTooltip(feature.properties.name, { permanent: false, direction: 'auto' });
  }
}
}).addTo(map);


  var villagesLayer = L.geoJSON.ajax('src/villages.geojson', {
      pointToLayer: function(feature, latlng) {
  var marker = L.marker(latlng, { icon: icons.villages });

  if (feature.properties) {
      var popupContent = '';
      if (feature.properties.name) {
          popupContent += '<strong>'+feature.properties.name +'</strong>'+ '<br>' ;
      }
      if (feature.properties.desc) {
          popupContent +=feature.properties.desc;
      }
      
      if (feature.properties.imageUrl) {
          popupContent += '<img src="' + feature.properties.imageUrl + '" alt="' + feature.properties.name + '" style="width:300px; height:200px;">';
      marker.bindPopup(popupContent, { autoClose: false });
      }
  }

  return marker;
},
onEachFeature: function(feature, layer) {
  // Check if the feature has a property 'name' and bind a tooltip
  if (feature.properties && feature.properties.name) {
      layer.bindTooltip(feature.properties.name, { permanent: false, direction: 'auto' });
  }
}
}).addTo(map);


  function toggleLayer(checkboxId, layer) {
      var checkbox = document.getElementById(checkboxId);
      checkbox.addEventListener('change', function() {
          if (this.checked) {
              layer.addTo(map);
          } else {
              map.removeLayer(layer);
          }
          updateLegend();
      });
  }
     
  // Toggle layers based on checkboxes
  toggleLayer('boundaryCheckbox', boundaryLayer);
  toggleLayer('villagesCheckbox', villagesLayer);
  toggleLayer('passesCheckbox', passesLayer);

// Function to update the legend based on selected layers
function updateLegend() {
var layersInfo = {
  "Boundary": { layer: boundaryLayer, color: "blue", type: "line" },
  "Potholes": { layer: villagesLayer, icon: icons.villages, type: "point" },
  "Parking, Encroachment, Sewage": { layer: passesLayer, icon: icons.passes, type: "point" }
  
  // Add other layers as needed
};

var legendContent = '<strong>Legend</strong><br>';
for (var key in layersInfo) {
  if (map.hasLayer(layersInfo[key].layer)) {
      if (layersInfo[key].type === "point") {
          // For point layers, use icon with 'icon-symbol' class
          legendContent += '<i class="icon-symbol" style="background-image: url(' + layersInfo[key].icon.options.iconUrl + ');"></i> ' + key + '<br>';
      } else {
          // For line layers, use colored line with 'line-symbol' class
          legendContent += '<i class="line-symbol" style="background: ' + layersInfo[key].color + ';"></i> ' + key + '<br>';
      }
  }
}

var legendDiv = document.getElementById('map-legend');
if (legendDiv) {
  legendDiv.innerHTML = legendContent;
}
}


  var legend = L.control({ position: 'bottomleft' });
  legend.onAdd = function(map) {
      var div = L.DomUtil.create('div', 'info legend');
      div.id = 'map-legend';
      div.innerHTML = '';
      return div;
  };
  legend.addTo(map);

// Create and add a label control for "@geomapink.com"
// Create and add a label control for "@geomapink.com"
var label = L.control({ position: 'bottomright' });

label.onAdd = function(map) {
  var div = L.DomUtil.create('div', 'map-label');
  div.innerHTML = 'TRIP road safety program';
  div.style.backgroundColor = 'white';
  div.style.padding = '2px 6px';           // Smaller padding
  div.style.borderRadius = '4px';
  div.style.boxShadow = '0 1px 5px rgba(0,0,0,0.3)';
  div.style.fontSize = '11px';            // Smaller text
  div.style.marginBottom = '10px';        // Push it further down
  return div;
};

label.addTo(map);

// Initial call to update the legend and event listener for layer changes
updateLegend();
map.on('overlayadd overlayremove', updateLegend);


// Initial call to update the legend and event listener for layer changes
updateLegend();
map.on('overlayadd overlayremove', updateLegend);



  function printMap() {
window.print(); // This triggers the browser's print dialog
}
  function resetZoom() {
      map.setView([36.3167, 74.6500], 9);
  }
  function smoothZoomIn() {
      var currentZoom = map.getZoom();
      var newZoom = currentZoom + .3;
      map.flyTo(map.getCenter(), newZoom);
  }

  function smoothZoomOut() {
      var currentZoom = map.getZoom();
      var newZoom = currentZoom - .3;
      map.flyTo(map.getCenter(), newZoom);
  }

  // Smooth Panning Functions
  function panLeft() {
      var currentCenter = map.getCenter();
      var offsetX = 0.05; // Adjust the offset value as needed
      var newCenter = L.latLng(currentCenter.lat, currentCenter.lng - offsetX);
      map.panTo(newCenter);
  }

  function panRight() {
      var currentCenter = map.getCenter();
      var offsetX = 0.01; // Adjust the offset value as needed
      var newCenter = L.latLng(currentCenter.lat, currentCenter.lng + offsetX);
      map.panTo(newCenter);
  }
  // Assuming map is already initialized and assigned to variable 'map'

// Initialize the FeatureGroup to store editable layers
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var drawControl = new L.Control.Draw({
  edit: {
    featureGroup: drawnItems,
  },
  draw: {
    polyline: true,
    polygon: true,
    rectangle: true,
    circle: true,
    marker: true
  }
});
map.addControl(drawControl);

map.on(L.Draw.Event.CREATED, function(event) {
  var layer = event.layer;
  drawnItems.addLayer(layer);
});

document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'sidebar-toggle';
    toggleBtn.innerHTML = '☰ Menu';
    document.body.appendChild(toggleBtn);
    
    const sidebar = document.querySelector('.right-sidebar');
    
    toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('open');
        toggleBtn.classList.toggle('hidden');
    });
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function(e) {
        if (sidebar.classList.contains('open') && 
            !sidebar.contains(e.target) && 
            e.target !== toggleBtn) {
            sidebar.classList.remove('open');
            toggleBtn.classList.remove('hidden');
        }
    });
    
    // Your existing image modal code
    const images = document.querySelectorAll('.bubble-marker img');
    const closeButtons = document.querySelectorAll('.close-fullscreen');
    
    images.forEach((image, index) => {
        image.addEventListener('click', function() {
            this.classList.toggle('full-screen-image');
            closeButtons[index].style.display = this.classList.contains('full-screen-image') ? 'block' : 'none';
        });
    });
    
    closeButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            images[index].classList.remove('full-screen-image');
            this.style.display = 'none';
        });
    });
});

function openLargeImage(imageUrl) {
    document.getElementById("largeImage").src = imageUrl;
    document.getElementById("imageModal").style.display = "block";
}

function closeLargeImage() {
    document.getElementById("imageModal").style.display = "none";
}

