(function () {
    'use strict';

    var MAPBOX_TOKEN = 'pk.eyJ1IjoiamFubWFydSIsImEiOiJjbW53Mzl5eDUxOXk1MnNxcGVwNzNiaTRjIn0.jplyn5CXf7ief3JyaxbB1g';
    var MAPBOX_STYLE = 'mapbox://styles/janmaru/cjwy1o6ft3wlj1cn30b02hgg4';
    var DATA_URL = './data/mosques.json';
    var PAGE_SIZE = 10;

    var geoData = null;
    var mosqueList = [];
    var currentPage = 0;
    var sortField = 'yearCE';
    var sortAsc = true;
    var map = null;

    // ── Navigation ──
    document.querySelectorAll('[data-view]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            var view = this.getAttribute('data-view');
            document.getElementById('map-view').style.display = view === 'map' ? 'block' : 'none';
            document.getElementById('table-view').style.display = view === 'table' ? 'block' : 'none';
            document.querySelectorAll('[data-view]').forEach(function (l) { l.classList.remove('active'); });
            this.classList.add('active');
            if (view === 'map' && map) map.resize();
        });
    });

    // ── Load data ──
    fetch(DATA_URL)
        .then(function (r) { return r.json(); })
        .then(function (data) {
            geoData = data;
            mosqueList = data.features.map(function (f) { return f.properties; });
            initMap(data);
            renderTable();
        });

    // ── Map ──
    function initMap(data) {
        mapboxgl.accessToken = MAPBOX_TOKEN;
        map = new mapboxgl.Map({
            container: 'map',
            style: MAPBOX_STYLE,
            center: [39.826168, 21.422510],
            zoom: 2.2,
            minZoom: 1.5
        });

        map.addControl(new mapboxgl.NavigationControl());

        map.on('move', function () {
            var c = map.getCenter();
            document.getElementById('lng').textContent = 'Lng: ' + c.lng.toFixed(4);
            document.getElementById('lat').textContent = 'Lat: ' + c.lat.toFixed(4);
            document.getElementById('zoom').textContent = 'Zoom: ' + map.getZoom().toFixed(2);
        });

        map.on('load', function () {
            map.addSource('mosques', {
                type: 'geojson',
                data: data,
                cluster: true,
                clusterMaxZoom: 14,
                clusterRadius: 30
            });

            // Cluster circles
            map.addLayer({
                id: 'clusters',
                type: 'circle',
                source: 'mosques',
                filter: ['has', 'point_count'],
                paint: {
                    'circle-color': ['step', ['get', 'point_count'],
                        '#3F5D5F', 33,
                        '#3278AB', 75,
                        '#92AE8A'
                    ],
                    'circle-radius': ['step', ['get', 'point_count'],
                        20, 33,
                        30, 75,
                        40
                    ]
                }
            });

            // Cluster count labels
            map.addLayer({
                id: 'cluster-count',
                type: 'symbol',
                source: 'mosques',
                filter: ['has', 'point_count'],
                layout: {
                    'text-field': '{point_count_abbreviated}',
                    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                    'text-size': 12
                }
            });

            // Individual markers
            map.addLayer({
                id: 'unclustered-point',
                type: 'symbol',
                source: 'mosques',
                filter: ['!', ['has', 'point_count']],
                layout: {
                    'icon-image': 'religious-muslim-15',
                    'text-field': '{title}',
                    'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                    'text-offset': [0, 0.6],
                    'text-anchor': 'top'
                },
                paint: {
                    'text-color': '#800000',
                    'text-halo-color': '#ffffff',
                    'text-halo-width': 2
                }
            });

            // Cluster click → zoom in
            map.on('click', 'clusters', function (e) {
                var features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
                var clusterId = features[0].properties.cluster_id;
                map.getSource('mosques').getClusterExpansionZoom(clusterId, function (err, zoom) {
                    if (err) return;
                    map.easeTo({ center: features[0].geometry.coordinates, zoom: zoom });
                });
            });

            // Marker click → popup
            map.on('click', 'unclustered-point', function (e) {
                var coords = e.features[0].geometry.coordinates.slice();
                var html = e.features[0].properties.description;
                while (Math.abs(e.lngLat.lng - coords[0]) > 180) {
                    coords[0] += e.lngLat.lng > coords[0] ? 360 : -360;
                }
                new mapboxgl.Popup().setLngLat(coords).setHTML(html).addTo(map);
            });

            // Cursor feedback
            map.on('mouseenter', 'clusters', function () { map.getCanvas().style.cursor = 'pointer'; });
            map.on('mouseleave', 'clusters', function () { map.getCanvas().style.cursor = ''; });
            map.on('mouseenter', 'unclustered-point', function () { map.getCanvas().style.cursor = 'pointer'; });
            map.on('mouseleave', 'unclustered-point', function () { map.getCanvas().style.cursor = ''; });
        });
    }

    // ── Table ──
    function renderTable() {
        var sorted = mosqueList.slice().sort(function (a, b) {
            var va = (a[sortField] || '').toString().toLowerCase();
            var vb = (b[sortField] || '').toString().toLowerCase();
            if (va < vb) return sortAsc ? -1 : 1;
            if (va > vb) return sortAsc ? 1 : -1;
            return 0;
        });

        var totalPages = Math.ceil(sorted.length / PAGE_SIZE);
        if (currentPage >= totalPages) currentPage = totalPages - 1;
        if (currentPage < 0) currentPage = 0;

        var start = currentPage * PAGE_SIZE;
        var page = sorted.slice(start, start + PAGE_SIZE);

        var tbody = document.querySelector('#mosque-table tbody');
        tbody.innerHTML = '';
        page.forEach(function (m) {
            var tr = document.createElement('tr');
            var nameCell = m.moreInfo && m.moreInfo !== '#'
                ? '<a href="' + m.moreInfo + '" target="_blank" rel="noopener noreferrer">' + m.title + '</a>'
                : (m.title || m.title);
            tr.innerHTML =
                '<td>' + (m.ageGroup || '') + '</td>' +
                '<td>' + (m.yearCE || '') + '</td>' +
                '<td>' + (m.country || '') + '</td>' +
                '<td>' + (m.city || '') + '</td>' +
                '<td>' + nameCell + '</td>';
            tbody.appendChild(tr);
        });

        // Update sort arrows
        document.querySelectorAll('#mosque-table th').forEach(function (th) {
            var field = th.getAttribute('data-sort');
            var arrow = th.querySelector('.sort-arrow');
            if (!arrow) {
                arrow = document.createElement('span');
                arrow.className = 'sort-arrow';
                th.appendChild(arrow);
            }
            arrow.textContent = field === sortField ? (sortAsc ? '\u25B2' : '\u25BC') : '';
        });

        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        var container = document.getElementById('pagination');
        container.innerHTML = '';

        var prev = document.createElement('button');
        prev.textContent = 'Previous';
        prev.disabled = currentPage === 0;
        prev.addEventListener('click', function () { currentPage--; renderTable(); });
        container.appendChild(prev);

        for (var i = 0; i < totalPages; i++) {
            var btn = document.createElement('button');
            btn.textContent = i + 1;
            btn.className = i === currentPage ? 'active' : '';
            btn.addEventListener('click', (function (idx) {
                return function () { currentPage = idx; renderTable(); };
            })(i));
            container.appendChild(btn);
        }

        var next = document.createElement('button');
        next.textContent = 'Next';
        next.disabled = currentPage >= totalPages - 1;
        next.addEventListener('click', function () { currentPage++; renderTable(); });
        container.appendChild(next);
    }

    // Sort on header click
    document.querySelectorAll('#mosque-table th').forEach(function (th) {
        th.addEventListener('click', function () {
            var field = this.getAttribute('data-sort');
            if (field === sortField) {
                sortAsc = !sortAsc;
            } else {
                sortField = field;
                sortAsc = true;
            }
            currentPage = 0;
            renderTable();
        });
    });

})();
