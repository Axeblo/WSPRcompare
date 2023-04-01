import './App.css';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import "./App.css";
import 'leaflet/dist/leaflet.css';
import { useDispatch } from 'react-redux';

import React, {useState, useEffect} from 'react';
import MyTable from './MyTable';
import BottomBar from './BottomBar';

import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { DateTimePicker, StaticDateTimePicker } from '@mui/x-date-pickers';
import { ThemeProvider, createTheme } from '@mui/material/styles'
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';


import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import dayjs from 'dayjs';

import WSPRMap from './WSPRMap';

import Chart from 'chart.js/auto'


const UPDATE_DATA = 'UPDATE_DATA';

function updateData(payload) {
  return {
    type: UPDATE_DATA,
    payload
  };
}

function App() {

  const dispatch = useDispatch();

  function handleClickA() {
    dispatch(updateData(WSPRAData));
  }
  function handleClickB() {
    dispatch(updateData(WSPRBData));
  }
  function handleClickC() {
    dispatch(updateData(WSPRCData));
  }
  
  async function getJSONWithParameters(TXSign) {
    let startTimeAndDate = dayjs(start).format('YYYY-MM-DD HH:mm:ss');
    let stopTimeAndDate = dayjs(stop).format('YYYY-MM-DD HH:mm:ss');
    
    const url = "https://db1.wspr.live/?query=SELECT * FROM wspr.rx WHERE tx_sign = '"+TXSign+ "' AND band = '"+band+"' AND time >= '"+startTimeAndDate+"' AND time < '"+stopTimeAndDate+"' LIMIT "+numberOfEntries+" FORMAT JSONCompact";

    return fetch(url)
    .then(response => response.json())
    .then(data => {
      // console.log("JSON Requst, TXSign:"+TXSign);
      // console.log(data);
      return data;
    });
  }
  
  const [WSPRAPromise,  setWSPRAPromise]      = useState(null);
  const [WSPRAData,     setWSPRAData]         = useState(null);
  const [WSPRAError,    setWSPRAError]        = useState(null);
  const [TXSignA,       setTXSignA]           = useState("SK0WE");
  
  const [WSPRBPromise,  setWSPRBPromise]      = useState(null);
  const [WSPRBData,     setWSPRBData]         = useState(null);
  const [WSPRBError,    setWSPRBError]        = useState(null);
  const [TXSignB,       setTXSignB]           = useState("SK0WE/P");
  
  const [WSPRCPromise,  setWSPRCPromise]      = useState(null);
  const [WSPRCData,     setWSPRCData]         = useState(null);
  const [WSPRCError,    setWSPRCError]        = useState(null);
  const [TXSignC,       setTXSignC]           = useState("Compare");

  const [band, setBand]                       = useState(10);
  const [start, setStart]                     = useState(dayjs('2022-06-03 12:24'));
  const [stop, setStop]                       = useState(dayjs('2022-06-03 15:28'));
  const [numberOfEntries, setNumberOfEntries] = useState(1000);

  const [chart, setChart]                     = useState(null);
  const [antennaGainChart,setAntennaGainChart]= useState(null);
  
  function submitButton(e) {
    setWSPRCPromise("test");
    setWSPRCData(null);
    setWSPRCError(null);

    setWSPRAPromise(getJSONWithParameters(TXSignA));
    setWSPRAData(null);
    setWSPRAError(null);
    getJSONWithParameters(TXSignA).then((data)=>{
      setWSPRAData(data);
    }).catch(error=>setWSPRAError(error));

    setWSPRBPromise(getJSONWithParameters(TXSignB));
    setWSPRBData(null);
    setWSPRBError(null);
    getJSONWithParameters(TXSignB).then((data)=>{
      setWSPRBData(data);
    }).catch(error=>setWSPRBError(error));
    
    
  };

  useEffect(() => {
    if(!WSPRAData || !WSPRBData)
      return;
    if(!WSPRAData.data || !WSPRBData.data)
      return;

    var data = {meta:[
      {
        "name": "id",
        "type": "UInt64"
      },
      {
        "name": "time",
        "type": "DateTime"
      },
      {
        "name": "band",
        "type": "Int16"
      },
      {
        "name": "rx_sign",
        "type": "LowCardinality(String)"
      },
      {
        "name": "rx_lat",
        "type": "Float32"
      },
      {
        "name": "rx_lon",
        "type": "Float32"
      },
      {
        "name": "rx_loc",
        "type": "LowCardinality(String)"
      },
      {
        "name": "tx_sign",
        "type": "LowCardinality(String)"
      },
      {
        "name": "tx_lat",
        "type": "Float32"
      },
      {
        "name": "tx_lon",
        "type": "Float32"
      },
      {
        "name": "tx_loc",
        "type": "LowCardinality(String)"
      },
      {
        "name": "distance",
        "type": "UInt16"
      },
      {
        "name": "azimuth",
        "type": "UInt16"
      },
      {
        "name": "rx_azimuth",
        "type": "UInt16"
      },
      {
        "name": "frequency",
        "type": "UInt32"
      },
      {
        "name": "power",
        "type": "Int8"
      },
      {
        "name": "∆snr",
        "type": "Int8"
      },
      {
        "name": "snrA",
        "type": "Int8"
      },
      {
        "name": "snrB",
        "type": "Int8"
      },
      {
        "name": "driftA",
        "type": "Int8"
      },
      {
        "name": "driftB",
        "type": "Int8"
      }
    ], data:[]};

    for( var i = start; i < stop; i = i.add(2, 'minutes')) {

      var timeslotDataA = WSPRAData.data.filter(row=>{
        return row[1]===dayjs(i).format("YYYY-MM-DD HH:mm:ss");
      });
      var timeslotDataB = WSPRBData.data.filter(row=>{
        return row[1]===dayjs(i).format("YYYY-MM-DD HH:mm:ss");
      });

      if(!timeslotDataA || !timeslotDataB)
        continue;

      // if(timeslotDataA.length==0 || timeslotDataB.length==0)
      //   continue;

      // if(!timeslotDataA.filter || !timeslotDataB.filter)
      //   continue;

      for( var j = 0; j < timeslotDataA.length; ++j ) {
        const found = timeslotDataB.find(recB=>timeslotDataA[j][3]===recB[3]);
        if(found)
          data.data.push([""+timeslotDataA[j][0]+"+"+found[0],
          timeslotDataA[j][1],
          timeslotDataA[j][2],
          timeslotDataA[j][3],
          timeslotDataA[j][4],
          timeslotDataA[j][5],
          timeslotDataA[j][6],
          timeslotDataA[j][7]+" + "+found[7],
          timeslotDataA[j][8],
          timeslotDataA[j][9],
          timeslotDataA[j][10],
          timeslotDataA[j][11],
          timeslotDataA[j][12],
          timeslotDataA[j][13],
          timeslotDataA[j][14],
          timeslotDataA[j][15],
          timeslotDataA[j][16]-found[16],
          timeslotDataA[j][16],
          found[16],
          timeslotDataA[j][17],
          found[17]]);
      }



    }
    setWSPRCData(data);
    setWSPRCPromise(1);
  }, [WSPRAData,WSPRBData]);

  useEffect(() => {
    if(!WSPRCData)
      return;

    if(chart)
      chart.destroy();
    setChart(null);

    if(antennaGainChart)
      antennaGainChart.destroy();
    setAntennaGainChart(null);

    //https://plotly.com/javascript/polar-chart/
  
    var chart1 = new Chart(
      document.getElementById('receptions'),
      {
        type: 'bar',
        data: {
          labels: WSPRCData.data.map(row => row[1]+" "+row[3]),
          datasets: [
            {
              label: 'SNR difference',
              data: WSPRCData.data.map(row => row[16])
            }
          ]
        }
      }
    );
    setChart(chart1);

    const bucketSize = 20;
    const bucketCount = 360/bucketSize;
    
    var buckets = [bucketCount];
    var labels = [bucketCount];
    for(var i = 0; i < bucketCount; ++i) {
      //buckets[i] = 0;
      labels[i] = i*bucketSize;
    }
    WSPRCData.data.forEach(row => {
      buckets[Math.floor(row[12]/bucketSize)] = row[16];
    });

    var chart2 = new Chart(
      document.getElementById('antennaGain'),
      {
        type: 'radar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'SNR difference',
              data: buckets
            }
          ]
        },
        options: {
        scale: {
            min: -10
        },
    },
      }
    );

    setAntennaGainChart(chart2);

  }, [WSPRCData]);

  const theme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  function prmiseNoDataMap(WSPRPromise,WSPRData,WSPRError) {
    if(!WSPRPromise)
      return <div className="loading_map">No data 😓</div>;
    if(!WSPRData) {
      if(!WSPRError)
        return <div className="loading_map"><div className="lds-dual-ring"></div></div>;
      else
        return <h1>Error...</h1>;
    }
    if(!WSPRError)
      return "";
  }
  function prmiseNoDataTable(WSPRPromise,WSPRData,WSPRError) {
    if(!WSPRPromise)
      return <div className="loading_table">No data 😓</div>;
    if(!WSPRData) {
      if(!WSPRError)
        return <div className="loading_table"><div className="lds-dual-ring"></div></div>;
      else
        return <h1>Error...</h1>;
    }
    if(!WSPRError)
      return "";
  }
  
  return(
     <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={theme}>
        <div className="TheRest">
          <div className="App">
            <div style={{height: 100}}> </div>
            <TextField id="outlined-basic" label="tx_sign A" style={{width:160}} onChange={(e)=>setTXSignA(e.target.value)} variant="outlined" value={TXSignA} />
            <TextField id="outlined-basic" label="tx_sign B" style={{width:160}} onChange={(e)=>setTXSignB(e.target.value)} variant="outlined" value={TXSignB}/>
            <TextField
              value={band}
              onChange={(e)=>setBand(e.target.value)}
              select
              label="Band"
              style={{width:120}}
            >
              <MenuItem key={1} value="7">7 MHz</MenuItem>
              <MenuItem key={2} value="10">10 MHz</MenuItem>
              <MenuItem key={3} value="14">14 MHz</MenuItem>
            </TextField>
            <TextField id="outlined-basic" label="number of entries" onChange={(e)=>setNumberOfEntries(e.target.value)} variant="outlined" type="number" value={numberOfEntries}/>
            <DateTimePicker onChange={(newValue)=>setStart(newValue)} label="Start" value={start} style={{width:100}} format="YYYY-MM-DD HH:mm"/>
            <DateTimePicker onChange={(newValue)=>setStop(newValue)} label="Stop" value={stop} format="YYYY-MM-DD HH:mm" />
            <Button variant="contained" size="large" style={{height:56}} onClick={submitButton}>🔍</Button>
            <div style={{height: 20}}> </div>
            <div style={{borderWidth: "1px", borderStyle:"solid", borderColor:"#666", borderRadius:20, padding: 10, display:"inline-block"}}>
              <h2>View WSPR Data</h2>
              <Button variant="contained" onClick={handleClickA} style={{margin:10}}>Transmitter A</Button>
              <Button variant="contained" onClick={handleClickB} style={{margin:10}}>Transmitter B</Button>
              <Button variant="contained" onClick={handleClickC} style={{margin:10}}>Comparison</Button>
            </div>
            <div style={{height: 20}}> </div>
            {/* {prmiseNoDataTable(WSPRAPromise,WSPRAData,WSPRAError)||(<MyTable data={WSPRAData.data} meta={WSPRAData.meta} title={TXSignA} />)} */}
            {/* {prmiseNoDataTable(WSPRBPromise,WSPRBData,WSPRBError)||(<MyTable data={WSPRBData.data} meta={WSPRBData.meta} title={TXSignB} />)} */}
            {/* {prmiseNoDataTable(WSPRCPromise,WSPRCData,WSPRCError)||(<MyTable data={WSPRCData.data} meta={WSPRCData.meta} title={TXSignC} />)} */}

            {prmiseNoDataMap(WSPRAPromise,WSPRAData,WSPRAError)||(<WSPRMap data={WSPRAData.data} meta={WSPRAData.meta} title={TXSignA}/>)}
            {prmiseNoDataMap(WSPRBPromise,WSPRBData,WSPRBError)||(<WSPRMap data={WSPRBData.data} meta={WSPRBData.meta} title={TXSignB}/>)}
            {prmiseNoDataMap(WSPRCPromise,WSPRCData,WSPRCError)||(<WSPRMap data={WSPRCData.data} meta={WSPRCData.meta} title={TXSignC}/>)}
            <div style={{width:800, display:"inline-block", margin_right:50}}><canvas id="receptions"></canvas></div>
            <div style={{width:300, display:"inline-block"}}><canvas id="antennaGain"></canvas></div>

          </div>
        </div>
        <BottomBar />
      </ThemeProvider>
    </LocalizationProvider>
  );
}

export default App;

