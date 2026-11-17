
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
        '&LAYER=eumat:buildings_demo' +
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

    // 3. Add the building point layer
    const BUILDING_LAYER = 'buildings-mvt-points';

    map.addLayer({
        id: BUILDING_LAYER,
        type: 'circle',
        source: 'buildings-mvt',
        'source-layer': 'buildings_demo',
        paint: {
            'circle-radius': [
                'interpolate',
                ['linear'],
                ['coalesce', ['to-number', ['get', 'tilavuus']], 0],
                0, 3,
                1000, 5,
                5000, 10,
                10000, 15
            ],
            'circle-color': [
                'match',
                ['get', 'kantavien_rakenteiden_rakennusaine'],
                'Puu', '#2E8B57',
                'Betoni', '#4A90E2',
                'Tiili', '#E58D30',
                '#929292'
            ],
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 1
        }
    });

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
