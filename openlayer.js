document.addEventListener('DOMContentLoaded', function() {
    // Create the map
    var map = new ol.Map({
      target: 'map',  // The ID of your map div
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()  // OpenStreetMap layer
        })
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([77.2090, 28.6139]),  // Center on New Delhi
        zoom: 10  // Zoom level
      })
    });
  });