// Initialize the map centered on France
const map = L.map('map').setView([46.227638, 2.213749], 6);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Function to get color based on incident count (adjusted scale for 0-5 range)
function getColor(d) {
    return d >= 5 ? '#084594' :   // 5 incidents (highest)
           d >= 4 ? '#2171b5' :   // 4 incidents
           d >= 3 ? '#4292c6' :   // 3 incidents
           d >= 2 ? '#6baed6' :   // 2 incidents
           d >= 1 ? '#9ecae1' :   // 1 incident
                   '#deebf7';     // 0 incidents
}

// Style function for the GeoJSON layer
function style(feature) {
    return {
        fillColor: getColor(feature.properties.incidents || 0),
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

// Mouse event handlers
function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 2,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
    layer.bringToFront();
    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    geojsonLayer.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

// Custom control for information display
var info = L.control();
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};
info.update = function (props) {
    this._div.innerHTML = '<h4>Bicycle Accidents by Commune</h4>' + 
        (props ? 
            `<b>${props.commune_name || props.nom}</b><br/>
             Postal code: ${props.code_postal || 'N/A'}<br/>
             Total casualties: ${props.incidents || 0}<br/>
             <small>Click to zoom to commune</small>`
            : 'Hover over a commune');
};
info.addTo(map);

// Add legend with adjusted scale
var legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'legend');
    var grades = [0, 1, 2, 3, 4, 5, 6, 7];
    
    div.innerHTML = '<h4>Casualties</h4>';
    
    // Special handling for zero
    div.innerHTML +=
        '<i style="background:' + getColor(0) + '"></i> ' +
        '0<br>';
    
    // Handle 1-5 incidents
    for (var i = 1; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i]) + '"></i> ' +
            grades[i] + '<br>';
    }
    return div;
};
legend.addTo(map);

// Load both GeoJSON and CSV data
Promise.all([
    fetch('https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/communes-version-simplifiee.geojson')
        .then(response => response.json()),
    d3.csv('../data/incidentswithcoords.csv')
]).then(([geojson, csvData]) => {
    // Create a mapping of commune postal codes to incident counts
    const incidentsByCommune = {};
    
    csvData.forEach(row => {
        incidentsByCommune[row.postcode] = {
            incidents: parseInt(row.incidents),
            name: row.name,
            postcode: row.postcode
        };
    });

    // Add incident counts to GeoJSON properties
    geojson.features.forEach(feature => {
        // Try to match using the GeoJSON postal code (code_postal) with the CSV postcode
        const communeData = incidentsByCommune[feature.properties.code_postal] || 
                          incidentsByCommune[feature.properties.code] || 
                          { incidents: 0, name: feature.properties.nom };
        
        feature.properties.incidents = communeData.incidents;
        feature.properties.commune_name = communeData.name || feature.properties.nom;
        feature.properties.code_postal = communeData.postcode || feature.properties.code_postal;
    });

    // Create and add the GeoJSON layer
    geojsonLayer = L.geoJson(geojson, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);

    // Optional point markers for precise locations
    csvData.forEach(row => {
        if (row.x && row.y) {
            const x = parseFloat(row.x.replace(',', '.'));
            const y = parseFloat(row.y.replace(',', '.'));
            
            L.circleMarker([y, x], {
                radius: Math.min(row.incidents * 3, 15), // Adjusted radius calculation
                fillColor: getColor(row.incidents), // Using the same color scheme as regions
                color: '#000',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            })
            .bindPopup(`<b>${row.name}</b><br>Casualties: ${row.incidents}`)
            .addTo(map);
        }
    });

}).catch(error => {
    console.error('Error loading data:', error);
    alert('Error loading map data. Please check the console for details.');
});