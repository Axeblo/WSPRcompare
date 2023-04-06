import './styles/App.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';
import 'leaflet/dist/leaflet.css';

import React, { useState, useEffect } from 'react';

import compare from './compare';
import getJSONWithParameters from './apiFunctions';

//My components
import BottomBar from './Components/BottomBar';
import WSPRMap from './Components/WSPRMap';
import MapOpenLayers from './Components/MapOpenLayers';
import Histogram from './Components/Histogram';
import NewHistogram from './Components/NewHistogram';
import AntennaGain from './Components/AntennaGain';
import NewAntennaGain from './Components/NewAntennaGain';
import ReceptionBarGraph from './Components/ReceptionBarGraph';
import ReceptionsOverTime from './Components/ReceptionsOverTime';
import Mean from './Components/Mean';
import EntriesCounter from './Components/EntriesCounter';
import Variance from './Components/Variance';
import StandardDeviation from './Components/StandardDeviation';

//MUI
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import SearchIcon from '@mui/icons-material/Search';

//Misc
import GridLayout, {Responsive, WidthProvider} from "react-grid-layout";
import dayjs from 'dayjs';
import { set } from 'ol/transform';

function App() {
	const [WSPRAPromiseState, setWSPRAPromiseState] = useState({});
	const [TXSignA, setTXSignA] = useState("HB9T");

	const [WSPRBPromiseState, setWSPRBPromiseState] = useState({});
	const [TXSignB, setTXSignB] = useState("IU2PJI");

	const [WSPRCPromiseState, setWSPRCPromiseState] = useState({});
	const [TXSignC, setTXSignC] = useState("Compare");

	const [datasets, setDatasets] = useState(
		[{dataTable:null, 	name:TXSignA, 		status:"no_action"},
		{dataTable:null, 	name:TXSignB, 		status:"no_action"},
		{dataTable:null, 	name:"Compare", 	status:"no_action"},]);

	const [band, setBand] = useState(10);
	const [start, setStart] = useState(dayjs('2023-03-20 01:00'));
	const [startTemp, setStartTemp] = useState(dayjs('2023-03-20 01:00'));
	const [stop, setStop] = useState(dayjs('2023-04-05 16:00'));
	const [stopTemp, setStopTemp] = useState(dayjs('2023-04-05 16:00'));
	const [numberOfEntries, setNumberOfEntries] = useState(100000);
	const [numberOfEntriesTemp, setNumberOfEntriesTemp] = useState(100000);

	const [showBottomBar, setShowBottomBar] = useState(true);

	function submitButton(e) {
		setDatasets([{dataTable:null, name:TXSignA, 	status:"loading"},
					{dataTable:null, name:TXSignB, 		status:"loading"},
					{dataTable:null, name:TXSignC, 	status:"loading"},]);
		setStart(startTemp);
		setStop(stopTemp);
		setNumberOfEntries(numberOfEntriesTemp);
		//Fetching data for Transmitter A
		var tempAPromiseState = {};
		getJSONWithParameters(TXSignA, startTemp, stopTemp, band, numberOfEntriesTemp).then((responseData)=>{
			setDatasets(previous=>previous.map((dataset, index)=>{
				if(index === 0)
					return {...dataset, dataTable:responseData, status:"done"}
				else
					return dataset
			}))
			getJSONWithParameters(TXSignB, startTemp, stopTemp, band, numberOfEntriesTemp).then((responseData)=>{
				setDatasets(previous=>previous.map((dataset, index)=>{
					if(index === 1)
						return {...dataset, dataTable:responseData, status:"done"}
					else
						return dataset
				}))
				}).catch((responseError)=>{
					setDatasets(previous=>previous.map((dataset, index)=>{
						if(index === 1)
							return {...dataset, dataTable:null, status:"error", error:responseError}
						else
							return dataset
					}))
				});	
		}).catch((responseError)=>{
			setDatasets(previous=>previous.map((dataset, index)=>{
				if(index === 0)
					return {...dataset, dataTable:null, status:"error", error:responseError}
				else
					return dataset
			}))
		});
		
		// 
		return;
	};

	//When data for Transmitter A and B is fetched, compare them
	useEffect(() => {
		//Safe check
		if (datasets[0].status === "done" && datasets[1].status === "done" && datasets[2].status !== "done" )
		{
			//Compare data
			var tempCPromiseState = {};
			compare(datasets[0].dataTable, datasets[1].dataTable, start, stop).then(value=>{
				setDatasets(previous=>previous.map((dataset,index)=>{
					if(index === 2)
						return {...dataset, dataTable:value, status: "done" };
					else
						return dataset;
				}))
			});
		}
	}, [datasets]);

	useEffect(()=>{
		submitButton();
	},[]);

	//MUI theme
	const theme = createTheme({
		palette: {
			mode: 'dark',
		},
	});

	return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<ThemeProvider theme={theme}>
				<div className={"MainPanel "+((!showBottomBar)&&"fullHeight")}>
					{/* <div className="title">WSPR Compare</div> */}
					<header style={{ height: 54, width: "100%", textAlign: "right", paddingTop: 10 }}>
						<div className="Wrapper" style={{ maxWidth: 1000, margin: "0 auto" }}>
							<DateTimePicker
								className="DateTimePicker"
								onChange={(newValue) => setStartTemp(newValue)}
								label="Start" value={startTemp}
								format="YYYY-MM-DD HH:mm" />
							<div style={{display:"inline-block", width: 10}}></div>
							<DateTimePicker
							className="DateTimePicker"
								onChange={(newValue) => setStopTemp(newValue)}
								label="Stop" value={stopTemp}
								format="YYYY-MM-DD HH:mm" />
						</div>
					</header>
					<div className="App ">
						<TextField
							id="outlined-basic"
							label="tx_sign A"
							style={{ width: 160 }}
							onChange={(e) => setTXSignA(e.target.value)}
							variant="outlined"
							value={TXSignA}
							size="small" />
						<div style={{display:"inline-block", width: 10}}></div>
						<TextField
							id="outlined-basic"
							label="tx_sign B"
							style={{ width: 160 }}
							onChange={(e) => setTXSignB(e.target.value)}
							variant="outlined"
							value={TXSignB}
							size="small" />
							<div style={{display:"inline-block", width: 10}}></div>
						<TextField
							value={band}
							onChange={(e) => setBand(e.target.value)}
							select
							label="Band"
							style={{ width: 120 }}
							size="small"
						>
							<MenuItem key={1} value="7">7 MHz</MenuItem>
							<MenuItem key={2} value="10">10 MHz</MenuItem>
							<MenuItem key={3} value="14">14 MHz</MenuItem>
							<MenuItem key={3} value="21">21 MHz</MenuItem>
							<MenuItem key={3} value="24">24 MHz</MenuItem>
							<MenuItem key={3} value="28">28 MHz</MenuItem>
						</TextField>
						<div style={{display:"inline-block", width: 10}}></div>
						<Button variant="contained" size="medium" style={{ height: 40 }} onClick={submitButton}><SearchIcon/></Button>
						{/* <NewHistogram dataset={dataset}/> */}
						<GridLayout
							className="layout"
							layout={[
								{ i: "DatapointsA", x: 0, y: 0, w: 2, h: 1, static: false },
								{ i: "DatapointsB", x: 2, y: 0, w: 2, h: 1, static: false },
								{ i: "DatapointsC", x: 4, y: 0, w: 2, h: 1, static: false },
								{ i: "MapA", 		x: 0, y: 1, w: 2, h: 2, static: false },
								{ i: "MapB", 		x: 2, y: 1, w: 2, h: 2, static: false },
								{ i: "MapC", 		x: 4, y: 1, w: 2, h: 2, static: false },
								{ i: "GainPattern", x: 4, y: 3, w: 2, h: 2, static: false },
								{ i: "BarGraph", 	x: 0, y: 3, w: 4, h: 2, static: false },
								{ i: "Histogram", 	x: 0, y: 5, w: 3, h: 2, static: false },
								{ i: "j", 			x: 3, y: 5, w: 3, h: 2, static: false },
								{ i: "k", 			x: 3, y: 5, w: 3, h: 2, static: false },
								{ i: "Mean", 		x: 0, y: 7, w: 1, h: 1, static: false },
								{ i: "Variance", 	x: 1, y: 7, w: 1, h: 1, static: false },
								{ i: "SD", 			x: 2, y: 7, w: 1, h: 1, static: false },

							]}
							cols={6}
							rowHeight={140}
							width={"1000"}
							onResize={()=>window.dispatchEvent(new Event('resize'))}
						>
							<div className="PanelContainer" key="DatapointsA">
								<div className="PanelHeader">Data points {TXSignA}</div>
								<div className="PanelContent" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
									<EntriesCounter datasets={datasets} defaultDatasetIndex={0} />
								</div>
							</div>
							<div className="PanelContainer" key="DatapointsB">
								<div className="PanelHeader">Data points {TXSignB}</div>
								<div className="PanelContent" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
								<EntriesCounter datasets={datasets} defaultDatasetIndex={1} />
								</div>
							</div>
							<div className="PanelContainer" key="DatapointsC">
								<div className="PanelHeader">Data points compare</div>
								<div className="PanelContent" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
								<EntriesCounter datasets={datasets} defaultDatasetIndex={2} />
								</div>
							</div>
							<div className="PanelContainer" key="MapA">
								<div className="PanelHeader">{TXSignA}</div>
								<div className="PanelContent" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
									<MapOpenLayers datasets={datasets} defaultDatasetIndex={0} />
								</div>
							</div>
							<div className="PanelContainer" key="MapB">
								<div className="PanelHeader">{TXSignB}</div>
								<div className="PanelContent" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
									<MapOpenLayers datasets={datasets} defaultDatasetIndex={1} />
								</div>
							</div>
							<div className="PanelContainer" key="MapC">
								<div className="PanelHeader">Compare</div>
								<div className="PanelContent" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
									<MapOpenLayers datasets={datasets} defaultDatasetIndex={2} />
								</div>
							</div>
							<div className="PanelContainer" key="GainPattern">
								<div className="PanelHeader">Antenna gain pattern</div>
								<div className="PanelContent" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
									<AntennaGain datasets={datasets} defaultDatasetIndex={2} />
								</div>
							</div>
							<div className="PanelContainer" key="BarGraph">
								<div className="PanelHeader">List of receptions</div>
								<div className="PanelContent" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
									<ReceptionBarGraph datasets={datasets} defaultDatasetIndex={0}/>
								</div>
							</div>
							<div className="PanelContainer" key="Histogram">
								<div className="PanelHeader">Histogram</div>
								<div className="PanelContent" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
									<Histogram datasets={datasets} defaultDatasetIndex={2}/>
								</div>
							</div>
							<div className="PanelContainer" key="j">
								<div className="PanelHeader">Number of receptions over time</div>
								<div className="PanelContent" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
									<ReceptionsOverTime datasets={datasets} start={start} stop={stop} />
								</div>
							</div>
							<div className="PanelContainer" key="Mean">
								<div className="PanelHeader">Mean</div>
								<div className="PanelContent" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
									<Mean datasets={datasets} defaultDatasetIndex={2}/>
								</div>
							</div>
							<div className="PanelContainer" key="Variance">
								<div className="PanelHeader">Variance</div>
								<div className="PanelContent" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
									<Variance datasets={datasets} defaultDatasetIndex={2}/>
								</div>
							</div>
							<div className="PanelContainer" key="SD">
								<div className="PanelHeader">Standard deviation</div>
								<div className="PanelContent" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
									<StandardDeviation datasets={datasets} defaultDatasetIndex={2}/>
								</div>
							</div>
						</GridLayout>
					</div>
				</div>
				{showBottomBar&&(
					<BottomBar
					datasets={datasets}
					close={()=>setShowBottomBar(false)} />)}
				{!showBottomBar&&<Button style={{position:"absolute",bottom:0,right:20}} onClick={()=>setShowBottomBar(true)}>Show data panel</Button>}
			</ThemeProvider>
		</LocalizationProvider>
	);
}

export default App;

