import React, { useEffect, useState } from "react";

import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import { defaults as defaultControls, Zoom } from 'ol/control';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

function MapOpenLayers({ dataset, datasetIndex }) {

	const mapRef = React.useRef();
	const circleLayerRef = React.useRef();


	useEffect(() => {
		const circleLayer = new VectorLayer({
			source: new VectorSource()
		});

		circleLayerRef.current = circleLayer;

		if (Array.isArray(dataset) &&
			dataset[datasetIndex] &&
			dataset[datasetIndex].dataTable &&
			Array.isArray(dataset[datasetIndex].dataTable.data)) {
			dataset[datasetIndex].dataTable.data.forEach((row) => {
				const feature = new Feature({
					geometry: new Point(fromLonLat([row[5],row[4]]))
				});

				const circleStyle = new Style({
					image: new CircleStyle({
						fill: new Fill({
							color: 'rgba(0, 255, 0, 0.08)'
						}),
						stroke: new Stroke({
							color: 'rgba(0, 255, 0, .16)',
							width: 1
						}),
						radius: 3
					})
				});
				feature.setStyle(circleStyle);
				circleLayer.getSource().addFeature(feature);
			});
		}

		const map = new Map({
			target: mapRef.current,
			layers: [
				new TileLayer({
					source: new XYZ({
						url: 'https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
						attributions: '© <a href="https://carto.com/attributions">CARTO</a>',
						crossOrigin: 'anonymous'
					})
				}),
				circleLayer
			],
			view: new View({
				center: fromLonLat([0, 0]),
				zoom: 2
			}),
			controls: defaultControls().extend([
				new Zoom()
			])
		});
}, []);
useEffect(() => {
	// Update the circle layer features when the coordinates prop changes
	const circleLayer = circleLayerRef.current;
	if( !circleLayer ) return;
	const source = circleLayer.getSource();
	source.clear();
	if (Array.isArray(dataset) &&
		dataset[datasetIndex] &&
		dataset[datasetIndex].dataTable &&
		Array.isArray(dataset[datasetIndex].dataTable.data)) {
		dataset[datasetIndex].dataTable.data.forEach((row) => {
			const feature = new Feature({
				geometry: new Point(fromLonLat([row[5],row[4]]))
			});

			const circleStyle = new Style({
				image: new CircleStyle({
					fill: new Fill({
						color: 'rgba(0, 255, 0, 0.08)'
					}),
					stroke: new Stroke({
						color: 'rgba(0, 255, 0, .16)',
						width: 1
					}),
					radius: 3
				})
			});
			feature.setStyle(circleStyle);
			source.addFeature(feature);
		});
	}

	// Update the map center when the coordinates prop changes
	const currentMap = mapRef.current;
	if( !currentMap ) return;
	const map = mapRef.current.olMap;
	if( !map ) return;
	const view = map.getView();
	view.setCenter(fromLonLat([0,0]));
}, [dataset] );
return <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>;

return <>I live!🐉🔥</>;
}

export default MapOpenLayers;