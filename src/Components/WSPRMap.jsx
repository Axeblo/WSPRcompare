import { MapContainer, TileLayer, Marker, CircleMarker, Popup } from "react-leaflet";
import '../styles/WSPRMap.css';
import { LeafletMap } from "leaflet";

function WSPRMap({ dataTable }) {
	if (!dataTable)
		return <>No dataTable in dataset</>;

	if( !dataTable.data )
		return <>No data in dataTable</>;
	if(	!dataTable.meta )
		return <>No metadata in dataTable</>;
	
	var center = [0,0];
	if( dataTable.data[0] )
		center = [dataTable.data[0][8], dataTable.data[0][9]];

	return (
		<MapContainer
			className="WSPRMapContainer"
			center={center}
			zoom={3}
			style={{width: "100%", height: "100%",minHeight:"100%"}}
			scrollWheelZoom={true}
			key={1}
			>
			<TileLayer
				style={{width: "100%", height: "100%",}}
				attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
				url='http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
			/>
			{dataTable.data[0]&&(<CircleMarker
				center={center}
				radius="3"
				border="2"
				weight="1"
				fillColor="#ff000088"
				color="#ff0000bb">
				<Popup>
					{dataTable.data[0][7]}
				</Popup>
			</CircleMarker>)}
			{dataTable.data.map((row) => (
				<CircleMarker
					center={[row[4], row[5]]}
					key={row[0]}
					radius="3"
					border="2"
					weight="1" 
					fillColor="#33ff3333"
					color="#33ff3355">
					<Popup>
						{row[3]}<br />
						{row[1]}<br />
						{row[16]}dB SNR
					</Popup>
				</CircleMarker>)
			)}
		</MapContainer>);
}

export default WSPRMap;