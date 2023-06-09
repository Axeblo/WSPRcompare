import './styles/App.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';
import 'leaflet/dist/leaflet.css';


import React, { useState, useEffect, useRef }  from 'react';

//Helper functions
import compare                                 from './compare';
import getJSONWithParameters                   from './apiFunctions';
        
//My components         
import DataPanel                               from './Components/DataPanel';
import WSPRMap                                 from './Components/WSPRMap';
import MapOpenLayers                           from './Components/MapOpenLayers';
import Histogram                               from './Components/Histogram';
import NewHistogram                            from './Components/NewHistogram';
import AntennaGain                             from './Components/AntennaGain';
import NewAntennaGain                          from './Components/NewAntennaGain';
import SpotsBarGraph                           from './Components/SpotsBarGraph';
import SpotsOverTime                           from './Components/SpotsOverTime';
import Mean                                    from './Components/Mean';
import EntriesCounter                          from './Components/EntriesCounter';
import Variance                                from './Components/Variance';
import StandardDeviation                       from './Components/StandardDeviation';
import CircularHeatmap                         from './Components/CircularHeatmap';

//MUI         
import Button                                  from '@mui/material/Button';
import MenuItem                                from '@mui/material/MenuItem';
import TextField                               from '@mui/material/TextField';
import { ThemeProvider, createTheme }          from '@mui/material/styles'
import Checkbox                                from '@mui/material/Checkbox';
import FormControlLabel                        from '@mui/material/FormControlLabel';
import { DateTimePicker }                      from '@mui/x-date-pickers';
import { LocalizationProvider }                from '@mui/x-date-pickers';
import { AdapterDayjs }                        from '@mui/x-date-pickers/AdapterDayjs'

//MUI Icons
import SearchIcon                              from '@mui/icons-material/Search';
import CloseIcon                               from '@mui/icons-material/Close';

//Misc
import GridLayout, {Responsive, WidthProvider} from "react-grid-layout";
import dayjs                                   from 'dayjs';

const ResponsiveGridLayout = WidthProvider(Responsive);

function App() {
	const TXSignARef            = useRef("");
	const TXSignBRef            = useRef("");
	const TXSignCRef            = useRef("Compare");
	const bandRef               = useRef(7);
	const startRef              = useRef(dayjs());
	const stopRef               = useRef(dayjs());
	const stopIsNowRef          = useRef(false);
	const numberOfEntriesRef    = useRef(200000);
	   
	const TXSignAInputRef       = useRef();
	const TXSignBInputRef       = useRef();
	const startInputRef         = useRef();
	const stopInputRef          = useRef();
	const bandInputRef          = useRef();
	const stopTimeNowInputRef   = useRef();
	const autoUpdateIntervalRef = useRef(null);
	const [autoUpdate,         setAutoUpdate]         = useState(-1);
	const [stopTimeNowChecked, setStopTimeNowChecked] = useState(false);
	const [showBottomBar,      setShowBottomBar]      = useState(false);
	const [datasets,           setDatasets]           = useState([
		{dataTable:null, name:TXSignARef.current, status:"no_action"},
		{dataTable:null, name:TXSignBRef.current, status:"no_action"},
		{dataTable:null, name:"Compare",          status:"no_action"},
	]);
	
	function submitButton(e) {
		clearInterval(autoUpdateIntervalRef.current);
		if( autoUpdate > -1 ) autoUpdateIntervalRef.current = setInterval(fetchData, autoUpdate * 60 * 1000);
		fetchData();
	}
	function fetchData() {
		startRef.current    = dayjs(startInputRef.current.value.trim().replace(/[^\x00-\x7F]/g, ""));
		if( stopTimeNowChecked ) {
			stopRef.current = dayjs()
		}
		else
			stopRef.current = dayjs(stopInputRef.current.value.trim().replace(/[^\x00-\x7F]/g, ""));
		bandRef.current    = bandInputRef.current.value;
		TXSignARef.current = TXSignAInputRef.current.value.trim();
		TXSignBRef.current = TXSignBInputRef.current.value.trim();
		
		var tempDatasets = [
			{dataTable:null, name:TXSignARef.current, status:"loading"},
			{dataTable:null, name:TXSignBRef.current, status:"loading"},
			{dataTable:null, name:TXSignCRef.current, status:"loading"},
		]
		setDatasets(tempDatasets);

		getJSONWithParameters(
			TXSignARef.current,
			startRef.current,
			stopRef.current,
			bandRef.current,
			numberOfEntriesRef.current).then((responseData)=>{
			tempDatasets = tempDatasets.map((dset, index)=>{
				if(index === 0)
					return {...dset, dataTable:responseData, status:"done"}
				else
					return dset
			})
			setDatasets(tempDatasets)
			getJSONWithParameters(
				TXSignBRef.current,
				startRef.current,
				stopRef.current,
				bandRef.current,
				numberOfEntriesRef.current).then((responseData)=>{
					tempDatasets = tempDatasets.map((dset, index)=>{
						if(index === 1)
							return {...dset, dataTable:responseData, status:"done"}
						else
						return dset
					});
					setDatasets(tempDatasets)
					
					//Compare data
					compare(tempDatasets[0].dataTable, tempDatasets[1].dataTable).then(value=>{
						setDatasets(tempDatasets.map((dset,index)=>{
							if(index === 2)
								return {...dset, dataTable:value, status: "done" };
							else
								return dset;
						}))
					});

				}).catch((responseError)=>{
					setDatasets(tempDatasets.map((dset, index)=>{
						if(index === 1)
							return {...dset, dataTable:null, status:"error", error:responseError}
						else
							return dset
					}))
				});	
		}).catch((responseError)=>{
			setDatasets(tempDatasets.map((dset, index)=>{
				if(index === 0)
					return {...dset, dataTable:null, status:"error", error:responseError}
				else
					return dset
			}))
		});
		return;
	};

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
				<div style={{margin: "0 auto", maxWidth:"2000px"}}>
					<div className={"MainPanel "+((!showBottomBar)&&"fullHeight")}>
						{/* <div className="title">WSPR Compare</div> */}
						<div className="App ">
							<div className="Wrapper">
								<DateTimePicker
									inputRef={startInputRef}
									defaultValue={dayjs('2023-04-14 9:00')}
									label="Start"
									className="DateTimePicker"
									format="YYYY-MM-DD HH:mm"/>
								<div style={{display:"inline-block", width: 10}}></div>
								<DateTimePicker
									inputRef={stopInputRef}
									defaultValue={dayjs('2023-04-18 12:00')}
									label="Stop"
									className="DateTimePicker"
									disabled={stopTimeNowChecked}
									format="YYYY-MM-DD HH:mm" />
									<div style={{display:"inline-block", width: 10}}></div>
									<FormControlLabel
										control={
											<Checkbox
											checked={stopTimeNowChecked}
											onChange={(e)=>{
												setStopTimeNowChecked(e.target.checked)
											}}
											inputRef={stopTimeNowInputRef} />
										}
										className="Checkbox"
										label="Now" />
									<TextField
										value={autoUpdate}
										onChange={
											(e)=>{
												setAutoUpdate(e.target.value)
												clearInterval(autoUpdateIntervalRef.current);
												if(e.target.value > -1)
													autoUpdateIntervalRef.current = setInterval(fetchData, e.target.value * 60 * 1000)
											}
										}
										defaultValue={-1}
										label="Auto update"
										select
										className="AutoUpdate"
										size="small"
									>
										<MenuItem key={1} value="-1">None</MenuItem>
										<MenuItem key={2} value="1">1 min</MenuItem>
										<MenuItem key={3} value="2">2 min</MenuItem>
										<MenuItem key={4} value="4">4 min</MenuItem>
										<MenuItem key={5} value="10">10 min</MenuItem>
										<MenuItem key={6} value="20">20 min</MenuItem>
										<MenuItem key={7} value="30">30 min</MenuItem>
										<MenuItem key={8} value="60">1 hour</MenuItem>
										<MenuItem key={9} value="120">2 hour</MenuItem>
									</TextField>
							</div>
							<div className="Wrapper" style={{textAlign:"left"}}>
									<TextField
									inputRef={TXSignAInputRef}
									defaultValue={"SK0WE"}
									label="tx_sign A"
									id="outlined-basic"
									className="TXInput"
									variant="outlined"
									size="small" />
								<div style={{display:"inline-block", width: 10}}></div>
								<TextField
									inputRef={TXSignBInputRef}
									defaultValue={"SK0WE/0"}
									label="tx_sign B"
									id="outlined-basic"
									className="TXInput"
									variant="outlined"
									size="small" />
									<div style={{display:"inline-block", width: 10}}></div>
								<TextField
									inputRef={bandInputRef}
									defaultValue={7}
									label="Band"
									select
									className="Band"
									size="small"
								>
									<MenuItem key={1} value="7">7 MHz</MenuItem>
									<MenuItem key={2} value="10">10 MHz</MenuItem>
									<MenuItem key={3} value="14">14 MHz</MenuItem>
									<MenuItem key={4} value="18">18 MHz</MenuItem>
									<MenuItem key={5} value="21">21 MHz</MenuItem>
									<MenuItem key={6} value="24">24 MHz</MenuItem>
									<MenuItem key={7} value="28">28 MHz</MenuItem>
								</TextField>
								<div style={{display:"inline-block", width: 10}}></div>
								<Button variant="contained" size="medium" style={{ height: 40 }} onClick={submitButton}><SearchIcon/></Button>
							</div>
							<ResponsiveGridLayout
								className="layout"
								layouts={
									{
										sm:[
											{ i: "DatapointsA",        x: 0, y: 0,  w: 1, h: 1, static: false },
											{ i: "DatapointsB",        x: 1, y: 1,  w: 1, h: 1, static: false },
											{ i: "DatapointsC",        x: 0, y: 1,  w: 2, h: 1, static: false },
											{ i: "MapA",               x: 0, y: 4,  w: 2, h: 2, static: false },
											{ i: "MapB",               x: 0, y: 6,  w: 2, h: 2, static: false },
											{ i: "MapC",               x: 0, y: 7,  w: 2, h: 2, static: false },
											{ i: "GainPattern",        x: 0, y: 9,  w: 2, h: 3, static: false },
											{ i: "Histogram",          x: 0, y: 12, w: 2, h: 2, static: false },
											{ i: "Mean",               x: 0, y: 14, w: 1, h: 1, static: false },
											{ i: "Variance",           x: 1, y: 14, w: 1, h: 1, static: false },
											{ i: "SD",                 x: 0, y: 15, w: 2, h: 1, static: false },
											{ i: "SpotsOverTime",      x: 0, y: 17, w: 2, h: 2, static: false },
											{ i: "BarGraph",           x: 0, y: 19, w: 2, h: 2, static: false },
											{ i: "HM",                 x: 0, y: 21, w: 2, h: 3, static: false }
										],
										md:[
											{ i: "DatapointsA",        x: 2, y: 0, w: 2, h: 1, static: false },
											{ i: "DatapointsB",        x: 2, y: 1, w: 2, h: 1, static: false },
											{ i: "DatapointsC",        x: 2, y: 2, w: 2, h: 1, static: false },
											{ i: "MapA",               x: 0, y: 0, w: 2, h: 2, static: false },
											{ i: "MapB",               x: 0, y: 2, w: 2, h: 2, static: false },
											{ i: "MapC",               x: 0, y: 4, w: 2, h: 2, static: false },
											{ i: "GainPattern",        x: 2, y: 3, w: 2, h: 3, static: false },
											{ i: "BarGraph",           x: 0, y: 13,w: 4, h: 2, static: false },
											{ i: "Histogram",          x: 0, y: 6, w: 4, h: 2, static: false },
											{ i: "SpotsOverTime",      x: 0, y: 11,w: 4, h: 2, static: false },
											{ i: "Mean",               x: 3, y: 8, w: 1, h: 1, static: false },
											{ i: "Variance",           x: 3, y: 9, w: 1, h: 1, static: false },
											{ i: "SD",                 x: 3, y: 10, w: 1, h: 1, static: false },
											{ i: "HM",                 x: 0, y: 8, w: 3, h: 3, static: false }

										],
										lg:[
											{ i: "DatapointsA",        x: 0, y: 0, w: 2, h: 1, static: false },
											{ i: "DatapointsB",        x: 2, y: 0, w: 2, h: 1, static: false },
											{ i: "DatapointsC",        x: 4, y: 0, w: 2, h: 1, static: false },
											{ i: "MapA",               x: 0, y: 1, w: 2, h: 2, static: false },
											{ i: "MapB",               x: 2, y: 1, w: 2, h: 2, static: false },
											{ i: "MapC",               x: 4, y: 1, w: 2, h: 2, static: false },
											{ i: "GainPattern",        x: 4, y: 3, w: 2, h: 3, static: false },
											{ i: "BarGraph",           x: 0, y: 8, w: 3, h: 2, static: false },
											{ i: "Histogram",          x: 0, y: 3, w: 3, h: 3, static: false },
											{ i: "SpotsOverTime",      x: 0, y: 6, w: 3, h: 2, static: false },
											{ i: "Mean",               x: 3, y: 3, w: 1, h: 1, static: false },
											{ i: "Variance",           x: 3, y: 4, w: 1, h: 1, static: false },
											{ i: "SD",                 x: 3, y: 5, w: 1, h: 1, static: false },
											{ i: "HM",                 x: 3, y: 6, w: 3, h: 3, static: false }
										],
										xl:[
											{ i: "DatapointsA",        x: 0, y: 0, w: 2, h: 1, static: false },
											{ i: "DatapointsB",        x: 2, y: 0, w: 2, h: 1, static: false },
											{ i: "DatapointsC",        x: 4, y: 0, w: 2, h: 1, static: false },
											{ i: "MapA",               x: 0, y: 1, w: 2, h: 2, static: false },
											{ i: "MapB",               x: 2, y: 1, w: 2, h: 2, static: false },
											{ i: "MapC",               x: 4, y: 1, w: 2, h: 2, static: false },
											{ i: "GainPattern",        x: 6, y: 0, w: 2, h: 3, static: false },
											{ i: "BarGraph",           x: 0, y: 6, w: 3, h: 2, static: false },
											{ i: "Histogram",          x: 0, y: 3, w: 4, h: 3, static: false },
											{ i: "SpotsOverTime",      x: 3, y: 6, w: 5, h: 2, static: false },
											{ i: "Mean",               x: 4, y: 3, w: 1, h: 1, static: false },
											{ i: "Variance",           x: 4, y: 4, w: 1, h: 1, static: false },
											{ i: "SD",                 x: 4, y: 5, w: 1, h: 1, static: false },
											{ i: "HM",                 x: 5, y: 3, w: 3, h: 3, static: false }
										]
									}
								}
								cols={{sm: 2, md:4, lg:6, xl:8}}
								rowHeight={140}
								breakpoints={{ sm: 400, md: 700, lg: 1000, xl: 1350 }}
								margin={[10, 10]}
								isResizable={true}
								isDraggable={window.innerWidth>400}
								containerPadding={[10, 10]}
								
								onResize={()=>window.dispatchEvent(new Event('resize'))}
							>
								<div className="PanelContainer" key="DatapointsA">
									<div className="PanelHeader">Spots {TXSignARef.current}</div>
									<div className="PanelContent" onMouseDown={e => e.stopPropagation()}>
										<EntriesCounter datasets={datasets} defaultDatasetIndex={0} />
									</div>
								</div>
								<div className="PanelContainer" key="DatapointsB">
									<div className="PanelHeader">Spots {TXSignBRef.current}</div>
									<div className="PanelContent" onMouseDown={e => e.stopPropagation()}>
									<EntriesCounter datasets={datasets} defaultDatasetIndex={1} />
									</div>
								</div>
								<div className="PanelContainer" key="DatapointsC">
									<div className="PanelHeader">Spots {TXSignCRef.current}</div>
									<div className="PanelContent" onMouseDown={e => e.stopPropagation()}>
									<EntriesCounter datasets={datasets} defaultDatasetIndex={2} />
									</div>
								</div>
								<div className="PanelContainer" key="MapA">
									<div className="PanelHeader">{TXSignARef.current}</div>
									<div className="PanelContent" onMouseDown={e => e.stopPropagation()}>
										<MapOpenLayers datasets={datasets} defaultDatasetIndex={0} />
									</div>
								</div>
								<div className="PanelContainer" key="MapB">
									<div className="PanelHeader">{TXSignBRef.current}</div>
									<div className="PanelContent" onMouseDown={e => e.stopPropagation()}>
										<MapOpenLayers datasets={datasets} defaultDatasetIndex={1} />
									</div>
								</div>
								<div className="PanelContainer" key="MapC">
									<div className="PanelHeader">{TXSignCRef.current}</div>
									<div className="PanelContent" onMouseDown={e => e.stopPropagation()}>
										<MapOpenLayers datasets={datasets} defaultDatasetIndex={2} />
									</div>
								</div>
								<div className="PanelContainer" key="GainPattern">
									<div className="PanelHeader">Antenna gain pattern</div>
									<div className="PanelContent" onMouseDown={e => e.stopPropagation()}>
										<AntennaGain datasets={datasets} defaultDatasetIndex={2} />
									</div>
								</div>
								<div className="PanelContainer" key="BarGraph">
									<div className="PanelHeader">List of spots</div>
									<div className="PanelContent" onMouseDown={e => e.stopPropagation()}>
										<SpotsBarGraph datasets={datasets} defaultDatasetIndex={2}/>
									</div>
								</div>
								<div className="PanelContainer" key="Histogram">
									<div className="PanelHeader">Histogram</div>
									<div className="PanelContent" onMouseDown={e => e.stopPropagation()}>
										<Histogram datasets={datasets} defaultDatasetIndex={2}/>
									</div>
								</div>
								<div className="PanelContainer" key="SpotsOverTime">
									<div className="PanelHeader">Number of spots over time</div>
									<div className="PanelContent" onMouseDown={e => e.stopPropagation()}>
										<SpotsOverTime datasets={datasets} start={startRef.current} stop={stopRef.current} />
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
								<div className="PanelContainer" key="HM">
									<div className="PanelHeader">Circular histogram heatmap</div>
									<div className="PanelContent" onMouseDown={e => e.stopPropagation()}>
										{/* <AntennaGain datasets={datasets} defaultDatasetIndex={2} /> */}
										<CircularHeatmap datasets={datasets} defaultDatasetIndex={2}/>
									</div>
								</div>
							</ResponsiveGridLayout>
						</div>
					</div>
					{showBottomBar&&
						<div className="BottomBar">
							<DataPanel datasets={datasets} />
							<Button
								className="BottomBarClose"
								variant="contained"
								onClick={(e)=>setShowBottomBar(false)}>
									<CloseIcon />
							</Button>
						</div>
					}
					{(!showBottomBar)&&
						<Button className="ShowDataPanelButton" onClick={()=>setShowBottomBar(true)}>
							Show data panel
						</Button>
					}
				</div>
			</ThemeProvider>
		</LocalizationProvider>
	);
}

export default App;

