import React, { useState, useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './Map.css';

export function Map() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    
    const [mosques, setMosques] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lng, setLng] = useState(39.826168);
    const [lat, setLat] = useState(21.422510);
    const [zoom, setZoom] = useState(2.2);
    
    const minZoom = 1.5;

    // Set Mapbox access token
    mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

    // Fetch mosque data
    const fetchMosqueData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('api/v1/marker/list', {
                method: "GET",
                mode: "cors",
                cache: "no-cache",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setMosques(data);
            return data;
        } catch (error) {
            console.error('Error fetching mosque data:', error);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Add mosque layers to map
    const addMosqueLayers = useCallback((mapInstance, data) => {
        // Add source
        mapInstance.addSource("mosques", {
            type: "geojson",
            data: data,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 30
        });

        // Add cluster layer
        mapInstance.addLayer({
            id: "clusters",
            type: "circle",
            source: "mosques",
            filter: ["has", "point_count"],
            paint: {
                "circle-color": [
                    "step",
                    ["get", "point_count"],
                    "#3F5D5F",
                    33,
                    "#3278AB",
                    75,
                    "#92AE8A"
                ],
                "circle-radius": [
                    "step",
                    ["get", "point_count"],
                    20,
                    33,
                    30,
                    75,
                    40
                ]
            }
        });

        // Add cluster count layer
        mapInstance.addLayer({
            id: "cluster-count",
            type: "symbol",
            source: "mosques",
            filter: ["has", "point_count"],
            layout: {
                "text-field": "{point_count_abbreviated}",
                "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                "text-size": 12
            }
        });

        // Add unclustered points layer
        mapInstance.addLayer({
            'id': "unclustered-point",
            'type': "symbol",
            'source': "mosques",
            'filter': ["!", ["has", "point_count"]],
            'layout': {
                "icon-image": "religious-muslim-15",
                "text-field": "{title}",
                "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                "text-offset": [0, 0.6],
                "text-anchor": "top",
                "icon-allow-overlap": false,
                "icon-size": 1
            },
            "paint": {
                "text-color": "#800000",
                "text-halo-color": "#fff",
                "text-halo-width": 2
            }
        });
    }, []);

    // Add map event listeners
    const addMapEventListeners = useCallback((mapInstance) => {
        // Update coordinates on move
        mapInstance.on('move', () => {
            const center = mapInstance.getCenter();
            setLng(parseFloat(center.lng.toFixed(4)));
            setLat(parseFloat(center.lat.toFixed(4)));
            setZoom(parseFloat(mapInstance.getZoom().toFixed(2)));
        });

        // Cluster click handler
        mapInstance.on('click', 'clusters', (e) => {
            const features = mapInstance.queryRenderedFeatures(e.point, { 
                layers: ['clusters'] 
            });
            const clusterId = features[0].properties.cluster_id;
            
            mapInstance.getSource('mosques').getClusterExpansionZoom(
                clusterId, 
                (err, zoom) => {
                    if (err) return;
                    
                    mapInstance.easeTo({
                        center: features[0].geometry.coordinates,
                        zoom: zoom
                    });
                }
            );
        });

        // Cluster hover handlers
        mapInstance.on('mouseenter', 'clusters', () => {
            mapInstance.getCanvas().style.cursor = 'pointer';
        });
        
        mapInstance.on('mouseleave', 'clusters', () => {
            mapInstance.getCanvas().style.cursor = '';
        });

        // Unclustered point click handler
        mapInstance.on('click', 'unclustered-point', (e) => {
            const coordinates = e.features[0].geometry.coordinates.slice();
            const html = e.features[0].properties.description;

            // Ensure popup appears on the copy of the coordinate closest to the click point
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(html)
                .addTo(mapInstance);
        });

        // Marker hover handlers
        mapInstance.on('mouseenter', 'unclustered-point', () => {
            mapInstance.getCanvas().style.cursor = 'pointer';
        });

        mapInstance.on('mouseleave', 'unclustered-point', () => {
            mapInstance.getCanvas().style.cursor = '';
        });
    }, []);

    // Initialize map
    useEffect(() => {
        if (map.current) return; // Initialize map only once

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: `mapbox://styles/${process.env.REACT_APP_MAPBOX_STYLE}`,
            center: [lng, lat],
            zoom: zoom,
            minZoom: minZoom,
            // New Mapbox GL JS v3 features
            projection: 'globe'
        });

        // Add event listeners
        addMapEventListeners(map.current);

        // Load mosque data and add layers
        map.current.on('load', async () => {
            const mosqueData = await fetchMosqueData();
            if (mosqueData) {
                addMosqueLayers(map.current, mosqueData);
            }
        });

        // Handle window resize
        const handleResize = () => {
            if (map.current) {
                map.current.resize();
            }
        };

        window.addEventListener('resize', handleResize);

        // Cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []); // Empty dependency array - run only once

    // Update map data when mosques change
    useEffect(() => {
        if (map.current && map.current.getSource('mosques') && mosques.length > 0) {
            map.current.getSource('mosques').setData(mosques);
        }
    }, [mosques]);

    return (
        <div className="map-wrapper">
            {/* Coordinates display */}
            <div className="coordinates-display">
                <div>
                    Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
                </div>
            </div>
            
            {/* Loading indicator */}
            {loading && (
                <div className="map-loading">
                    <div className="loading-spinner">Loading mosques...</div>
                </div>
            )}
            
            {/* Map container */}
            <div 
                className="map-container" 
                id="map" 
                ref={mapContainer}
            />
        </div>
    );
}