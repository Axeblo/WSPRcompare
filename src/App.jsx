import './App.css';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { MapContainer, TileLayer, Marker, CircleMarker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";

import "./style.css";
import 'leaflet/dist/leaflet.css';




import React, {useState, useEffect} from 'react';
import MyTable from './MyTable';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import {DateTimePicker, StaticDateTimePicker } from '@mui/x-date-pickers';
import { ThemeProvider, createTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import dayjs from 'dayjs';



function App() {
  
  function getJSONWithParameters(rx_sign) {
    let startTimeAndDate = dayjs(start).format('YYYY-MM-DD HH:mm:ss');
    let stopTimeAndDate = dayjs(stop).format('YYYY-MM-DD HH:mm:ss');
    // const url = "https://db1.wspr.live/?query=SELECT * FROM wspr.rx WHERE rx_sign = '"+rx_sign+ "' AND time >= '2023-01-01 00:00:00' AND time < '2023-01-02 00:00:00' LIMIT 10 FORMAT JSONCompact";
    const url = "https://db1.wspr.live/?query=SELECT * FROM wspr.rx WHERE tx_sign = '"+tx_sign+ "' AND time >= '"+startTimeAndDate+"' AND time < '"+stopTimeAndDate+"' LIMIT "+numberOfEntries+" FORMAT JSONCompact";
    fetch(url)
    .then(response => response.json())
    .then(theData => {
      console.log(theData);
      setWsprData(theData);
    });
  }
  
  
  
  const [wsprData, setWsprData]   = useState({data:[], meta:[]});
  const [tx_sign, set_tx_sign]    = useState("SK0WE/1");
  const [start, setStart]         = useState(dayjs('2022-05-21 05:00'));
  const [stop, setStop]           = useState(dayjs('2022-05-21 12:00'));
  const [numberOfEntries, setNumberOfEntries] = useState(500);
  
  useEffect(() => {
    getJSONWithParameters("GM1OXB");

    
  }, [start, stop, tx_sign, numberOfEntries]);

  useEffect(() => {
    if(wsprData.data === undefined)
      return ;
    let rx = [];
    rx[0] = {lat: 55.8642, lon: -4.2518};
    rx[1] = {lat: 55.8642, lon: -4.2518};

    
  }, [wsprData]);

  useEffect(()=>{
    console.log("start: "+dayjs(start).format('YYYY-MM-DD HH:mm:ss'));
    console.log("stop: "+dayjs(stop).format('YYYY-MM-DD HH:mm:ss'));
  }, [start, stop] );
  

  const theme = createTheme({
    palette: {
      mode: 'dark',
    },
  });
  
  
  return (<>
     <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={theme}>
        <div className="App">
          <header className="App-header">
            <img src="Octocat.png" className="App-logo" alt="logo" />
            <br></br>
            <TextField id="outlined-basic" label="tx_sign" onChange={(e)=>set_tx_sign(e.target.value)} variant="outlined" value="SK0WE/1" />
            <TextField id="outlined-basic" label="number of entries" onChange={(e)=>setNumberOfEntries(e.target.value)} variant="outlined" type="number" value="500"/>
            <DateTimePicker onChange={(newValue)=>setStart(newValue)} label="Start" defaultValue={dayjs('2022-05-21 05:00')} format="YYYY-MM-DD mm:hh"/>
            <DateTimePicker onChange={(newValue)=>setStop(newValue)} label="Stop" defaultValue={dayjs('2022-05-21 12:00')} format="YYYY-MM-DD mm:hh" />
  
            {wsprData&&<MyTable data={wsprData.data} meta={wsprData.meta} />}
  
            <Button variant="contained">Hello World</Button>
  
            
  
          </header>
        </div>
      </ThemeProvider>
    </LocalizationProvider>
    {wsprData.data[0]&&<MapContainer center={[wsprData.data[0][8],wsprData.data[0][9]]} zoom={3} scrollWheelZoom={true}>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <CircleMarker center={[wsprData.data[0][8],wsprData.data[0][9]]} color="red">
      <Popup>
        wsprData.data[0][7];
      </Popup>
    </CircleMarker>
    {wsprData.data.map((row)=>(
      <CircleMarker center={[row[4], row[5]]} id={row[0]}>
        <Popup>
          Rx sign {row[3]}
        </Popup>
        </CircleMarker>)
    )}
  </MapContainer>}</>
  );
}

export default App;
