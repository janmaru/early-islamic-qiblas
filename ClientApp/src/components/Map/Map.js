import React, { Component } from 'react';

import MapboxGl from 'mapbox-gl/dist/mapbox-gl.js'
import './Map.css'

export class Map extends Component {
    static displayName = Map.name;

    constructor(props) {
        super(props);

        MapboxGl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

        this.state = {
            stadiums: [],
            loading: false,
            lng: 39.826168,
            lat: 21.422510,
            zoom: 2.2,
            minZoom: 1.5
        };

    }

    componentDidMount() {
        const { lng, lat, zoom, minZoom } = this.state;

        const map = new MapboxGl.Map({
            container: this.container,
            style: 'mapbox://styles/' + process.env.REACT_APP_MAPBOX_STYLE,
            center: [lng, lat],
            zoom,
            minZoom
        });

        map.on('move', () => {
            const { lng, lat } = map.getCenter();

            this.setState({
                lng: lng.toFixed(4),
                lat: lat.toFixed(4),
                zoom: map.getZoom().toFixed(2)
            });
        });

        // inspect a cluster on click
        map.on('click', 'clusters', function (e) {
            var features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
            var clusterId = features[0].properties.cluster_id;
            map.getSource('mosques').getClusterExpansionZoom(clusterId, function (err, zoom) {
                if (err)
                    return;

                map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom
                });
            });
        });

        map.on('mouseenter', 'clusters', function () {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'clusters', function () {
            map.getCanvas().style.cursor = '';
        });

        // When a click event occurs on a feature in the markers layer, open a popup at the
        // location of the feature, with description HTML from its properties.
        map.on('click', 'unclustered-point', function (e) {
            var coordinates = e.features[0].geometry.coordinates.slice();
            var html = e.features[0].properties.description;  
 
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new MapboxGl.Popup()
                .setLngLat(coordinates)
                .setHTML(html)
                .addTo(map);
        });

 
        map.on('mouseenter', 'markers', function () {
            map.getCanvas().style.cursor = 'pointer';
        });

 
        map.on('mouseleave', 'markers', function () {
            map.getCanvas().style.cursor = '';
        });

        window.addEventListener("resize", function (event) {
            map.resize();
        })

        fetch('api/v1/marker/list')
            .then(response => response.json())
            .then(data => this.setState({ stadiums: data }, () => {
                map.on('load', function () {
                      map.addSource("mosques", {
                        type: "geojson", 
                        data: data,
                        cluster: true,
                        clusterMaxZoom: 14, 
                        clusterRadius: 30  
                    });

                    map.addLayer({
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

                    map.addLayer({
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
 
                    map.addLayer({
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
 
                });
            }));
    }

    render() {
        const { lng, lat, zoom } = this.state;
        return (
            <div>
                <div className="inline-block absolute top left mt12 ml12 bg-darken75 color-white z1 py6 px12 round-full txt-s txt-bold">
                    <div>{`Longitude: ${lng} Latitude: ${lat} Zoom: ${zoom}`}</div>
                </div>
                <div className='Map' id='map' ref={(x) => { this.container = x }}>
                </div>
            </div>
        )
    }
}
