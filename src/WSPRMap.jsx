import { MapContainer, TileLayer, Marker, CircleMarker, Popup } from "react-leaflet";

import './WSPRMap.css';

function WSPRMap({ data, meta, title }) {

  if (data === undefined || data[0] === undefined || meta === undefined)
    return <div className="WSPRMap" style={{height: 400, width: 350, lineHeight: "400px"}}><h3>Zero entries😓</h3></div>;

  return <div className="WSPRMap">
    <h1>{title}</h1>
    <MapContainer className="WSPRMapContainer" center={[data[0][8], data[0][9]]} zoom={3} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
        url='http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
      />
      <CircleMarker center={[data[0][8], data[0][9]]} color="red" id="-1">
        <Popup>
          {data[0][7]}
        </Popup>
      </CircleMarker>
      {data.map((row) => (
        <CircleMarker center={[row[4], row[5]]} id={row[0]} color="green">
          <Popup>
            {row[3]}<br />
            {row[1]}<br />
            {row[16]}dB SNR
          </Popup>
        </CircleMarker>)
      )}
    </MapContainer>
  </div>;
}

export default WSPRMap;