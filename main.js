window.onload = init;

function init() {
    const map = new ol.Map({
        view: new ol.View({
            center: [0, 0],
            zoom: 2
        }),
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        target: 'js-map'
    });

    // WMS Layer from GeoServer
    const wmsLayer = new ol.layer.Tile({
        source: new ol.source.TileWMS({
            url: 'http://localhost:8080/geoserver/state_boundary/wms',
            params: {
                'LAYERS': 'state_boundary:IND_adm1',
                'TILED': true,
                'FORMAT': 'image/png',
                'TRANSPARENT': true
            },
            serverType: 'geoserver'
        }),
        opacity: 0.8
    });

    // India boundary layer
    const indiaLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: 'india.geojson',
            format: new ol.format.GeoJSON()
        }),
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#000000',
                width: 4
            }),
            fill: new ol.style.Fill({
                color: 'rgba(0, 0, 0, 0)'
            })
        })
    });

    // State boundaries layer
    const stateSource = new ol.source.Vector({
        url: 'state.geojson',
        format: new ol.format.GeoJSON()
    });

    const stateLayer = new ol.layer.Vector({
        source: stateSource,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#FF0000',
                width: 1
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 0, 0.2)'
            })
        })
    });

    // Set initial visibility
    wmsLayer.setVisible(true);
    indiaLayer.setVisible(true);
    stateLayer.setVisible(true);

    // Add layers to map
    map.addLayer(wmsLayer);
    map.addLayer(indiaLayer);
    map.addLayer(stateLayer);

    // Checkbox logic for existing layers
    document.getElementById('toggle-india').addEventListener('change', function () {
        indiaLayer.setVisible(this.checked);
    });

    document.getElementById('toggle-state').addEventListener('change', function () {
        stateLayer.setVisible(this.checked);
    });

    // Add checkbox for WMS layer (you'll need to add this to your HTML)
    const wmsCheckbox = document.getElementById('toggle-wms');
    if (wmsCheckbox) {
        wmsCheckbox.addEventListener('change', function () {
            wmsLayer.setVisible(this.checked);
        });
    }

    // Popup element setup
    const popup = document.getElementById('popup');
    const overlay = new ol.Overlay({
        element: popup,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -10]
    });
    map.addOverlay(overlay);

    // State click popup
    map.on('singleclick', function (evt) {
        const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
            if (layer === stateLayer && stateLayer.getVisible()) {
                return feature;
            }
        });

        if (feature) {
            const coordinates = evt.coordinate;
            const name = feature.get('NAME_1') || feature.get('state_name') || 'Unnamed State';
            popup.innerHTML = name;
            overlay.setPosition(coordinates);
        } else {
            overlay.setPosition(undefined);
        }
    });

    // Toggle sidebar
    const toggleButton = document.getElementById("toggle-sidebar");
    const sidebar = document.querySelector(".sidebar");

    toggleButton?.addEventListener("click", () => {
        sidebar.classList.toggle("hidden");
    });

    // Center map on India bounds
    const indiaBounds = [68.18624877929699, 6.754255771636906, 97.41516113281256, 35.5013313293457];
    const indiaExtent = ol.proj.transformExtent(indiaBounds, 'EPSG:4326', 'EPSG:3857');
    map.getView().fit(indiaExtent, {padding: [20, 20, 20, 20]});

    // List of all Indian states and UTs
    const statesAndUTs = [
        'All States', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
        'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
        'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
        'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 
        'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
    ];

    // Populate dropdown
    const stateDropdown = document.getElementById('state-dropdown');
    statesAndUTs.forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateDropdown.appendChild(option);
    });

    // State filtering functionality
    let currentFilter = null;
    
    // Create filtered style for hidden features
    const hiddenStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(255, 0, 0, 0)',
            width: 0
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 0, 0)'
        })
    });

    // Original style for visible features
    const visibleStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#FF0000',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 0, 0.2)'
        })
    });

    // Highlighted style for selected state
    const highlightedStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#0066CC',
            width: 3
        }),
        fill: new ol.style.Fill({
            color: 'rgba(0, 102, 204, 0.3)'
        })
    });

    // Function to filter states
    function filterStates(selectedState) {
        if (selectedState === 'All States') {
            // Show all states with original style
            stateSource.getFeatures().forEach(feature => {
                feature.setStyle(visibleStyle);
            });
            // Reset map view to India bounds
            map.getView().fit(indiaExtent, {padding: [20, 20, 20, 20]});
            currentFilter = null;
        } else {
            let selectedFeature = null;
            
            stateSource.getFeatures().forEach(feature => {
                const stateName = feature.get('NAME_1') || feature.get('state_name') || feature.get('name');
                
                if (stateName && (stateName.toLowerCase() === selectedState.toLowerCase() || 
                    stateName.toLowerCase().includes(selectedState.toLowerCase()) ||
                    selectedState.toLowerCase().includes(stateName.toLowerCase()))) {
                    // Highlight selected state
                    feature.setStyle(highlightedStyle);
                    selectedFeature = feature;
                } else {
                    // Hide other states
                    feature.setStyle(hiddenStyle);
                }
            });

            // Zoom to selected state if found
            if (selectedFeature) {
                const extent = selectedFeature.getGeometry().getExtent();
                map.getView().fit(extent, {padding: [50, 50, 50, 50], duration: 1000});
            }
            currentFilter = selectedState;
        }
    }

    // Add WMS layer filtering (if supported by your GeoServer)
    function filterWMSLayer(selectedState) {
        if (selectedState === 'All States') {
            // Remove any CQL filter
            wmsLayer.getSource().updateParams({
                'CQL_FILTER': null
            });
        } else {
            // Add CQL filter for WMS layer (adjust field name as needed)
            wmsLayer.getSource().updateParams({
                'CQL_FILTER': `NAME_1 ILIKE '%${selectedState}%' OR state_name ILIKE '%${selectedState}%'`
            });
        }
    }

    // Dropdown change event
    stateDropdown.addEventListener('change', function() {
        const selectedState = this.value;
        filterStates(selectedState);
        filterWMSLayer(selectedState);
    });

    // Toggle dropdown visibility
    document.getElementById('dropdown-toggle').addEventListener('click', function() {
        const dropdownContent = document.querySelector('.dropdown-content');
        dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const dropdown = document.querySelector('.dropdown');
        const dropdownContent = document.querySelector('.dropdown-content');
        
        if (!dropdown.contains(event.target)) {
            dropdownContent.style.display = 'none';
        }
    });
}
