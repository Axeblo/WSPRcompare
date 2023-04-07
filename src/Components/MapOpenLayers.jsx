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
import VectorImageLayer from 'ol/layer/VectorImage';
import VectorSource from 'ol/source/Vector';


function MapOpenLayers({ datasets, defaultDatasetIndex }) {
	const mapRef = React.useRef(null);
	const tooltipRef = React.useRef();
	const circleLayerRef = React.useRef();
	const [errorMessage, setErrorMessage] = React.useState(null);
	const [mapStore, setMapStore] = React.useState(null);

	function createEmptyMap() {
		var center = [0,0];

		const circleLayer = new VectorImageLayer({
			source: new VectorSource()
		});
		circleLayerRef.current = circleLayer;

		//Define circle styles
		const greenCircleStyle = new Style({
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

		const redCircleStyle = new Style({
			image: new CircleStyle({
				fill: new Fill({
					color: 'rgba(255, 0, 0, 0.3)'
				}),
				stroke: new Stroke({
					color: 'rgba(255, 0, 0, .6)',
					width: 1
				}),
				radius: 3
			})
		});
		
		const map = new Map({
			target: mapRef.current,
			layers: [
				new TileLayer({
					source: new XYZ({
						url: 'https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
						// attributions: '© <a href="https://carto.com/attributions">CARTO</a>',
						crossOrigin: 'anonymous'
					})
				}),
				circleLayer
			],
			view: new View({
				center: fromLonLat(center),
				zoom: 2
			}),
			controls: defaultControls().extend([
				new Zoom()
			])
		});
		setMapStore(map);
	}

	useEffect(() => {
		if (mapStore) {
			const map = mapStore;
			// return;
			// Add pointermove event listener to the map
			// map.on("pointermove", (event) => {
			// 	if (event.dragging) return;
			// 	const pixel = map.getEventPixel(event.originalEvent);
			// 	const hit = map.hasFeatureAtPixel(pixel);

			// 	const containerRect = mapRef.current.getBoundingClientRect();

			// 	// If the pointer is over a circle, show the tooltip
			// 	if (hit) {
			// 		const feature = map.forEachFeatureAtPixel(pixel, (f) => f);
        	// 		const info = feature.get('info');

			// 		tooltipRef.current.innerHTML = info;
			// 		tooltipRef.current.style.display = "block";
			// 		tooltipRef.current.style.left = `${event.originalEvent.clientX - containerRect.left + 10}px`;
			// 		tooltipRef.current.style.top = `${event.originalEvent.clientY - containerRect.top + 10}px`;
			// 	} else {
			// 		tooltipRef.current.style.display = "none";
			// 	}
			// });
		}
	}, [mapStore]);

	useEffect(() => {
		if( !mapStore ) {
			setErrorMessage(null);

		if( !Array.isArray(datasets) ){
			setErrorMessage("Invalid datasets")
			createEmptyMap();
			return;
		}

		var dataset = datasets[defaultDatasetIndex]

		if( dataset === undefined ){
			setErrorMessage("Invalid dataset index")
			createEmptyMap();
			return;
		}

		var status = dataset.status;

		if( status === undefined ){
			setErrorMessage("Incorrect dataset format, no status.")
			createEmptyMap();
			return;
		}

		if( status === "no_action" ) {
			setErrorMessage("No query");
			createEmptyMap();
			return;
		}

		if( status === "loading" ) {
			setErrorMessage("loading...");
			createEmptyMap();
			return;
		}

		if( status !== "done" ) {
			setErrorMessage("Unknown error...");
			createEmptyMap();
			return;
		}

		var dataTable = dataset.dataTable;

		if( dataTable === undefined) {
			setErrorMessage("No dataTable");
			createEmptyMap();
			return;
		}

		if( dataTable === null ) {
			setErrorMessage("No dataTable(null)");
			createEmptyMap();
			return;
		}

		if( !Array.isArray(dataTable.data) ) {
			setErrorMessage("No data in tableData");
			createEmptyMap();
			return;
		}

		const circleLayer = new VectorImageLayer({
			source: new VectorSource(),
		});

		//Define circle styles
		const greenCircleStyle = new Style({
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

		const redCircleStyle = new Style({
			image: new CircleStyle({
				fill: new Fill({
					color: 'rgba(255, 0, 0, 0.3)'
				}),
				stroke: new Stroke({
					color: 'rgba(255, 0, 0, .6)',
					width: 1
				}),
				radius: 3
			})
		});


		//Center coordinates for map
		var center = [0,0];
		circleLayerRef.current = circleLayer;

		if( dataTable.data.length > 0 ) {
			center = [dataTable.data[0][9], dataTable.data[0][8]];
			
			const feature = new Feature({
				geometry: new Point(fromLonLat(center))
			})

			feature.setStyle(redCircleStyle);
			feature.set('info', dataTable.data[0][7]);

			circleLayer.getSource().addFeature(feature);
		}
		dataTable.data.forEach((row) => {
			const feature = new Feature({
				geometry: new Point(fromLonLat([row[5],row[4]]))
			});

			
			feature.setStyle(greenCircleStyle);
			feature.set('info', row[3]);
			circleLayer.getSource().addFeature(feature);
		});
		
		
		const map = new Map({
			// renderer: (['webgl', 'canvas']),
			target: mapRef.current,
			layers: [
				new TileLayer({
					source: new XYZ({
						url: 'https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
						// attributions: '© <a href="https://carto.com/attributions">CARTO</a>',
						crossOrigin: 'anonymous'
					})
				}),
				circleLayer
			],
			view: new View({
				center: fromLonLat(center),
				zoom: 2
			}),
			controls: defaultControls().extend([
				new Zoom()
			])
		});

		setMapStore(map);
			return;
		}
		//Get the circle layer
		const circleLayer = circleLayerRef.current;
		if( !circleLayer ){
			console.log("No circleLayer found"); 
			return;
		} 
		const source = circleLayer.getSource();

		//And clear it
		source.clear();

		setErrorMessage(null);

		if( !Array.isArray(datasets) ){
			setErrorMessage("Invalid datasets")
			return;
		}

		var dataset = datasets[defaultDatasetIndex]

		if( dataset === undefined ){
			setErrorMessage("Invalid dataset index")
			return;
		}

		var status = dataset.status

		if( status === undefined ){
			setErrorMessage("Incorrect dataset format, no status.")
			return;
		}

		if( status === "no_action") {
			setErrorMessage("No query");
			return;
		}

		if( status === "loading") {
			setErrorMessage("loading...");
			return;
		}

		if( status !== "done") {
			setErrorMessage("Unknown error...");
			return;
		}

		var dataTable = dataset.dataTable;

		if( dataTable === undefined ) {
			setErrorMessage("No dataTable");
			return;
		}

		if( dataTable === null ) {
			setErrorMessage("No dataTable(null)");
			return;
		}

		if( !Array.isArray(dataTable.data) ) {
			setErrorMessage("No data in tableData");
			return;
		}


		//Define circle styles
		const greenCircleStyle = new Style({
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

		const redCircleStyle = new Style({
			image: new CircleStyle({
				fill: new Fill({
					color: 'rgba(255, 0, 0, 0.5)'
				}),
				stroke: new Stroke({
					color: 'rgba(255, 0, 0, .6)',
					width: 1
				}),
				radius: 4
			})
		});

		//Center coordinates for map
		var center = [0,0];

		dataTable.data.forEach((row) => {
			const feature = new Feature({
				geometry: new Point(fromLonLat([row[5],row[4]]))
			});
			
			feature.setStyle(greenCircleStyle);
			feature.set('info', row[3]);
			source.addFeature(feature);
		});

		if( dataTable.data.length > 0 ) {
			center = [dataTable.data[0][9], dataTable.data[0][8]];
			
			const feature = new Feature({
				geometry: new Point(fromLonLat(center))
			})

			feature.setStyle(redCircleStyle);
			feature.set('info', dataTable.data[0][7]);
			circleLayer.getSource().addFeature(feature);

		}
		
		// Update the map center when the coordinates prop changes
		const map = mapStore;
		const view = map.getView();
		view.setCenter(fromLonLat(center));

	}, [datasets] );

	return (
		<div
		  style={{
			position: "relative",
			width: "100%",
			height: "100%",
		  }}
		>
		  <div ref={mapRef} style={{ width: "100%", height: "100%" }}>
			{errorMessage && <span>{errorMessage}</span>}
		  </div>
		  <div
			ref={tooltipRef}
			style={{
			  position: "fixed",
			  backgroundColor: "#181b1f",
			  border: "1px solid #ccccdc12",
			  padding: "5px",
			  borderRadius: "5px",
			  display: "none",
			  fontSize: "14px",
			  zIndex: 1000,
			  pointerEvents: "none",
			  color: "rgb(204,204,204)"
			}}
		  ></div>
		</div>
	  );

	return <div ref={mapRef} style={{ width: '100%', height: '100%' }}>{errorMessage&&(<span>{errorMessage}</span>)}</div>;
}

export default MapOpenLayers;