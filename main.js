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

    indiaLayer.setVisible(true);
    stateLayer.setVisible(true);

    map.addLayer(indiaLayer);
    map.addLayer(stateLayer);

    // Checkbox logic
    document.getElementById('toggle-india').addEventListener('change', function () {
        indiaLayer.setVisible(this.checked);
    });

    document.getElementById('toggle-state').addEventListener('change', function () {
        stateLayer.setVisible(this.checked);
    });

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
}
