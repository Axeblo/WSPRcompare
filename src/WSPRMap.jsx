import { MapContainer, TileLayer, Marker, CircleMarker, Popup } from "react-leaflet";
//import Map from 'ol/Map.js';
//import TileLayer from 'ol/layer/Tile.js';
//import View from 'ol/View.js';
//import XYZ from 'ol/source/XYZ.js';
import './WSPRMap.css';

function WSPRMap({ data, meta, title }) {

  if (data === undefined || data[0] === undefined || meta === undefined)
    return <div className="WSPRMap" style={{height: 400, width: 350, lineHeight: "400px"}}><h3>Zero entries😓</h3></div>;


    // const map = new Map({
    //   target: 'map',
    //   layers: [
    //     new TileLayer({
    //       source: new XYZ({
    //         url:
    //           'https://{a-c}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png' +
    //           '?apikey=Your API key from https://www.thunderforest.com/docs/apikeys/ here',
    //       }),
    //     }),
    //   ],
    //   view: new View({
    //     center: [-472202, 7530279],
    //     zoom: 12,
    //   }),
    // });
  //return <div id="map" class="map"></div>
  return <MapContainer className="WSPRMapContainer" center={[data[0][8], data[0][9]]} zoom={3} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
        url='http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
      />
      <CircleMarker center={[data[0][8], data[0][9]]} radius="3" border="2" weight="1" fillColor="#ff000088" color="#ff0000bb">
        <Popup>
          {data[0][7]}
        </Popup>
      </CircleMarker>
      {data.map((row) => (
        <CircleMarker center={[row[4], row[5]]} id={row[0]} radius="3" border="2" weight="1" fillColor="#33ff3333" color="#33ff3355">
          <Popup>
            {row[3]}<br />
            {row[1]}<br />
            {row[16]}dB SNR
          </Popup>
        </CircleMarker>)
      )}
    </MapContainer>;
}

export default WSPRMap;