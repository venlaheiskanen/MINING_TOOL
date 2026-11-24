
const map = new maplibregl.Map({
    container: 'map',
    style: `https://api.maptiler.com/maps/base-v4/style.json?key=${MAPTILER_API_KEY}`,
    center: [29.76, 62.6],
    zoom: 14
});

// Display map errors in the browser console
map.on('error', (e) => {
    console.error('MapLibre error:', e.error);
});

// Wait until the map style has loaded
map.on('load', () => {

    console.log('MapLibre map loaded successfully');

    // 1. Define the GeoServer WMTS vector tile URL
    const mvtUrl =
        'http://localhost:8080/geoserver/gwc/service/wmts' +
        '?SERVICE=WMTS' +
        '&VERSION=1.0.0' +
        '&REQUEST=GetTile' +
        '&LAYER=eumat:material_stock_import' +
        '&STYLE=' +
        '&TILEMATRIXSET=EPSG:900913' +
        '&TILEMATRIX=EPSG:900913:{z}' +
        '&TILECOL={x}' +
        '&TILEROW={y}' +
        '&FORMAT=application/vnd.mapbox-vector-tile';

    // 2. Add the vector tile source
    map.addSource('buildings-mvt', {
        type: 'vector',
        tiles: [mvtUrl],
        minzoom: 0,
        maxzoom: 14
    });

    // 3. Visualise building points
    const BUILDING_LAYER = 'buildings-mvt-points';

    const MIN_CIRCLE_RADIUS = 1.5;
    const MAX_CIRCLE_RADIUS = 10;
    const CIRCLE_RADIUS_SCALE = 0.25;

    function createCircleRadiusExpression(field) {
        return [
            'max', MIN_CIRCLE_RADIUS,
            [
                'min', MAX_CIRCLE_RADIUS,
                [
                    '*', CIRCLE_RADIUS_SCALE,
                    [
                        'sqrt',
                        [
                            'max', 0,
                            ['to-number', ['get', field], 0]
                        ]
                    ]
                ]
            ]
        ];
    }

    function calculateCircleRadius(tonnes) {
        return Math.max(
            MIN_CIRCLE_RADIUS,
            Math.min(MAX_CIRCLE_RADIUS, CIRCLE_RADIUS_SCALE * Math.sqrt(tonnes))
        );
    }

    map.addLayer({
        id: BUILDING_LAYER,
        type: 'circle',
        source: 'buildings-mvt',
        'source-layer': 'material_stock_import',
        paint: {
        'circle-radius': createCircleRadiusExpression('material_concrete_t'),
            'circle-color': '#4A90E2',
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 1
        }
    });

    const materialFilter = document.getElementById('material-filter');

    const materialSettings = {
        Betoni: {
            field: 'material_concrete_t',
            threshold: 200,
            color: '#4A90E2',
            legendValues: [200, 500, 1600]
        },
        Puu: {
            field: 'material_wood_t',
            threshold: 50,
            color: '#2E8B57',
            legendValues: [50, 200, 1000]
        }
    };

    function updateMaterialView() {

        const selectedMaterial = materialFilter.value;
        console.log('Valittu materiaali:', selectedMaterial);

        const settings = materialSettings[selectedMaterial];
        console.log('Materiaalin asetukset:', settings);

        // Read the estimated material quantity
        const quantity = [
            'max',
            0,
            ['to-number', ['get', settings.field], 0]
        ];

        // Filter out buildings below the threshold
        map.setFilter(
            BUILDING_LAYER,
            ['>=', quantity, settings.threshold]
        );

        // Update circle sizes
        map.setPaintProperty(
            BUILDING_LAYER,
            'circle-radius',
            createCircleRadiusExpression(settings.field)
        );

        // Update circle colors
        map.setPaintProperty(
            BUILDING_LAYER,
            'circle-color',
            settings.color
        );

        // Update legend title
        const legendTitle = document.getElementById('legend-title');

        legendTitle.textContent = selectedMaterial === 'Betoni'
            ? 'Estimated concrete quantity'
            : 'Estimated wood quantity';

        // Update minimum quantity
        const legendLimit = document.getElementById('legend-limit');

        legendLimit.textContent =
            `Buildings shown: at least ${settings.threshold} t`;

        // Clear old legend symbols
        const legendValues = document.getElementById('legend-values');
        legendValues.replaceChildren();

        // Create new legend symbols
        settings.legendValues.forEach((tonnes) => {

        const radius = calculateCircleRadius(tonnes);

        const row = document.createElement('div');
        row.className = 'legend-row';

        const symbol = document.createElement('div');
        symbol.className = 'legend-symbol';

        const circle = document.createElement('span');
        circle.className = 'legend-circle';

        circle.style.width = `${radius * 2}px`;
        circle.style.height = `${radius * 2}px`;
        circle.style.backgroundColor = settings.color;

        const label = document.createElement('span');
        label.textContent = tonnes === 1600
            ? '≥ 1,600 t'
            : `${tonnes.toLocaleString('en-US')} t`;

        symbol.appendChild(circle);
        row.appendChild(symbol);
        row.appendChild(label);

        legendValues.appendChild(row);
    });
    }

    materialFilter.addEventListener('change', updateMaterialView);

    updateMaterialView(); // Initial update

    console.log('Building MVT layer added');

    // 4. Change cursor when hovering over buildings
    map.on('mouseenter', BUILDING_LAYER, () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', BUILDING_LAYER, () => {
        map.getCanvas().style.cursor = '';
    });

    // 5. Show building properties when clicked
    map.on('click', BUILDING_LAYER, (e) => {
        const feature = e.features?.[0];
        if (!feature) return;

        const props = feature.properties || {};

        console.log('Clicked building:', props);

        const purpose = props.paaasiallinen_kayttotarkoitus
            ?? 'Ei tiedossa';

        const volume = props.tilavuus != null
            ? `${props.tilavuus} m³`
            : 'Ei tiedossa';

        new maplibregl.Popup()
            .setLngLat(e.lngLat)
            .setText(`Käyttötarkoitus: ${purpose} | Tilavuus: ${volume}`)
            .addTo(map);
    });

}); // End of map.on('load')
