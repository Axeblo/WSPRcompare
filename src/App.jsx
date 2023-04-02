import './App.css';

// import {Histogram} from "@d3/histogram"

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';

import 'leaflet/dist/leaflet.css';

import React, {useState, useEffect} from 'react';
import { useDispatch } from 'react-redux';

import GridLayout from "react-grid-layout";

import MyTable from './MyTable';
import BottomBar from './BottomBar';
import WSPRMap from './WSPRMap';
import Histogram from './Histogram';
import AntennaGain from './AntennaGain';

import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { DateTimePicker, StaticDateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import dayjs from 'dayjs';
import Chart from 'chart.js/auto';
import { set } from 'ol/transform';

const UPDATE_DATA = 'UPDATE_DATA';

function updateData(payload) {
  return {
    type: UPDATE_DATA,
    payload
  };
}

function App() {
  const dispatch = useDispatch();
  
  async function getJSONWithParameters(TXSign) {
    let startTimeAndDate = dayjs(start).format('YYYY-MM-DD HH:mm:ss');
    let stopTimeAndDate = dayjs(stop).format('YYYY-MM-DD HH:mm:ss');
    
    const url = "https://db1.wspr.live/?query=SELECT * FROM wspr.rx WHERE tx_sign = '"+TXSign+ "' AND band = '"+band+"' AND time >= '"+startTimeAndDate+"' AND time < '"+stopTimeAndDate+"' LIMIT "+numberOfEntries+" FORMAT JSONCompact";

    return fetch(url)
    .then(response => response.json())
    .then(data => {
      return data;
    });
  }
  
  const [WSPRAPromise,    setWSPRAPromise]      = useState(null);
  const [WSPRAData,       setWSPRAData]         = useState(null);
  const [WSPRAError,      setWSPRAError]        = useState(null);
  const [TXSignA,         setTXSignA]           = useState("SK0WE");

  const [WSPRBPromise,    setWSPRBPromise]      = useState(null);
  const [WSPRBData,       setWSPRBData]         = useState(null);
  const [WSPRBError,      setWSPRBError]        = useState(null);
  const [TXSignB,         setTXSignB]           = useState("SK0WE/P");

  const [WSPRCPromise,    setWSPRCPromise]      = useState(null);
  const [WSPRCData,       setWSPRCData]         = useState(null);
  const [WSPRCError,      setWSPRCError]        = useState(null);
  const [TXSignC,         setTXSignC]           = useState("Compare");

  const [band,            setBand]              = useState(10);
  const [start,           setStart]             = useState(dayjs('2022-06-03 12:24'));
  const [stop,            setStop]              = useState(dayjs('2022-06-03 15:28'));
  const [numberOfEntries, setNumberOfEntries]   = useState(1000);

  const [chart,           setChart]             = useState(null);
  
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

    if(chart) chart.destroy();
    setChart(null);

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
        <div className="MainPanel">
          <header style={{height:70, width:"100%",textAlign:"right",paddingTop:10}}>
              <div className="Wrapper" style={{maxWidth:1000, margin:"0 auto"}}>
                <DateTimePicker onChange={(newValue)=>setStart(newValue)} label="Start" value={start} format="YYYY-MM-DD HH:mm"/>
                <DateTimePicker onChange={(newValue)=>setStop(newValue)} label="Stop" value={stop} format="YYYY-MM-DD HH:mm" />
              </div>
          </header>
          <div className="App">
            <div style={{height: 5}}> </div>
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
            <Button variant="contained" size="large" style={{height:56}} onClick={submitButton}>🔍</Button>

            

            <GridLayout
              className="layout"
              layout={[
                { i: "a", x: 0, y: 1, w: 2, h: 2, static: false },
                { i: "b", x: 2, y: 1, w: 2, h: 2, static: false },
                { i: "c", x: 4, y: 1, w: 2, h: 2, static: false },
                { i: "d", x: 4, y: 3, w: 2, h: 2, static: false },
                { i: "e", x: 0, y: 3, w: 4, h: 2, static: false },
                { i: "f", x: 0, y: 0, w: 2, h: 1, static: false },
                { i: "g", x: 2, y: 0, w: 2, h: 1, static: false },
                { i: "h", x: 4, y: 0, w: 2, h: 1, static: false },
                { i: "i", x: 0, y: 5, w: 6, h: 3, static: false },
              ]}
              cols={6}
              rowHeight={160}
              width={1000}
            >
              <div className="PanelContainer" key="a">
                <div className="PanelHeader">{TXSignA}</div>
                <div className="PanelContent" onMouseDown={ e => e.stopPropagation() }>
                  {prmiseNoDataMap(WSPRAPromise,WSPRAData,WSPRAError)||(<WSPRMap data={WSPRAData.data} meta={WSPRAData.meta} title={TXSignA}/>)}
                </div>
              </div>
              <div className="PanelContainer" key="b">
                <div className="PanelHeader">{TXSignB}</div>
                <div className="PanelContent" onMouseDown={ e => e.stopPropagation() }>
                  {prmiseNoDataMap(WSPRBPromise,WSPRBData,WSPRBError)||(<WSPRMap data={WSPRBData.data} meta={WSPRBData.meta} title={TXSignB}/>)}
                </div>
              </div>
              <div className="PanelContainer" key="c">
                <div className="PanelHeader">Compare</div>
                <div className="PanelContent" onMouseDown={ e => e.stopPropagation() }>
                  {prmiseNoDataMap(WSPRCPromise,WSPRCData,WSPRCError)||(<WSPRMap data={WSPRCData.data} meta={WSPRCData.meta} title={TXSignC}/>)}
                </div>
              </div>
              <div className="PanelContainer" key="d">
                  <div className="PanelHeader">Antenna gain pattern</div>
                  <div className="PanelContent">
                    <AntennaGain data={WSPRCData}/>
                  </div>
              </div>
              <div className="PanelContainer" key="e">
                  <div className="PanelHeader">Receptions difference</div>
                  <div className="PanelContent">
                    <div style={{width:"100%", height:"100%"}}><canvas style={{width:"100%", height:"100%"}} id="receptions"></canvas></div>
                  </div>
              </div>
              <div className="PanelContainer" key="f">
                  <div className="PanelHeader">Data points {TXSignA}</div>
                  <div className="PanelContent">
                  <div style={{lineHeight: "120px", color: "green", fontSize:"3em"}}>{WSPRAData&&WSPRAData.data&&WSPRAData.data.length||"No data"}</div>
                  </div>
              </div>
              <div className="PanelContainer" key="g">
                  <div className="PanelHeader">Data points {TXSignB}</div>
                  <div className="PanelContent">
                  <div style={{lineHeight: "120px", color: "green", fontSize:"3em"}}>{WSPRBData&&WSPRBData.data&&WSPRBData.data.length||"No data"}</div>
                  </div>
              </div>
              <div className="PanelContainer" key="h">
                  <div className="PanelHeader">Data points compare</div>
                  <div className="PanelContent">
                    <div style={{lineHeight: "120px", color: "green", fontSize:"3em"}}>{WSPRCData&&WSPRCData.data&&WSPRCData.data.length||"No data"}</div>
                  </div>
              </div>
              <div className="PanelContainer" key="i">
                  <div className="PanelHeader">Histogram</div>
                  <div className="PanelContent">
                    <Histogram data={WSPRCData}/>
                  </div>
              </div>
            </GridLayout>
          </div>
        </div>
        <BottomBar data={[WSPRAData,WSPRBData,WSPRCData]} TXSignA={TXSignA} TXSignB={TXSignB}/>
      </ThemeProvider>
    </LocalizationProvider>
  );
}

export default App;

