import './styles/App.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';
import 'leaflet/dist/leaflet.css';

import React, { useState, useEffect } from 'react';

//Helper functions
import resolvePromise from './resolvePromise';
import promiseNoData from './promiseNoData';
import compare from './compare';
import getJSONWithParameters from './apiFunctions';

//My components
import BottomBar from './Components/BottomBar';
import WSPRMap from './Components/WSPRMap';
import Histogram from './Components/Histogram';
import AntennaGain from './Components/AntennaGain';
import ReceptionBarGraph from './Components/ReceptionBarGraph';
import NumberOfReceptionsGraph from './Components/NumberOfReceptionsGraph';

//MUI
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

//Misc
import GridLayout from "react-grid-layout";
import dayjs from 'dayjs';

function App() {
	const [WSPRAPromiseState, setWSPRAPromiseState] = useState({});
	const [WSPRAData, setWSPRAData] = useState(null);
	const [WSPRAError, setWSPRAError] = useState(null);
	const [TXSignA, setTXSignA] = useState("SK0WE");

	const [WSPRBPromiseState, setWSPRBPromiseState] = useState({});
	const [WSPRBData, setWSPRBData] = useState(null);
	const [WSPRBError, setWSPRBError] = useState(null);
	const [TXSignB, setTXSignB] = useState("SK0WE/P");

	const [WSPRCPromiseState, setWSPRCPromiseState] = useState({});
	const [WSPRCData, setWSPRCData] = useState(null);
	const [WSPRCError, setWSPRCError] = useState(null);
	const [TXSignC, setTXSignC] = useState("Compare");

	const [band, setBand] = useState(10);
	const [start, setStart] = useState(dayjs('2022-06-03 13:24'));
	const [startTemp, setStartTemp] = useState(dayjs('2022-06-03 13:24'));
	const [stop, setStop] = useState(dayjs('2022-06-03 16:28'));
	const [stopTemp, setStopTemp] = useState(dayjs('2022-06-03 16:28'));
	const [numberOfEntries, setNumberOfEntries] = useState(2000);
	const [numberOfEntriesTemp, setNumberOfEntriesTemp] = useState(2000);

	const [showBottomBar, setShowBottomBar] = useState(true);

	function submitButton(e) {
		setStart(startTemp);
		setStop(stopTemp);
		setNumberOfEntries(numberOfEntriesTemp);

		//Fetching data for Transmitter A
		var tempAPromiseState = {};
		resolvePromise(getJSONWithParameters(TXSignA, startTemp, stopTemp, band, numberOfEntriesTemp), tempAPromiseState, () => {
			setWSPRAData(tempAPromiseState["data"]);
			setWSPRAError(tempAPromiseState["error"]);
			setWSPRAPromiseState(tempAPromiseState);
		});
		
		//Fetching data for Transmitter B
		var tempBPromiseState = {};
		resolvePromise(getJSONWithParameters(TXSignB, startTemp, stopTemp, band, numberOfEntriesTemp), tempBPromiseState, () => {
			setWSPRBData(tempBPromiseState["data"]);
			setWSPRBError(tempBPromiseState["error"]);
			setWSPRBPromiseState(tempBPromiseState);
		});

		//Fetching data for Transmitter C, faking it for now
		WSPRCPromiseState.promise = 1;
		WSPRCPromiseState.data = null;
		WSPRCPromiseState.error = null;
		setWSPRCData(null);
		setWSPRCError(null);
	};

	//When data for Transmitter A and B is fetched, compare them
	useEffect(() => {
		//Safe check
		if (!WSPRAPromiseState.data || !WSPRBPromiseState.data || !WSPRAPromiseState.data.data || !WSPRAPromiseState.data.data)
			return;

		//Compare data
		var tempCPromiseState = {};
		resolvePromise(compare(WSPRAPromiseState.data,WSPRBPromiseState.data, start, stop), tempCPromiseState, () => {
			setWSPRCData(tempCPromiseState["data"]);
			setWSPRCError(tempCPromiseState["error"]);
			setWSPRCPromiseState(tempCPromiseState);
		});
	}, [WSPRAData, WSPRBData]);

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
					<header style={{ height: 70, width: "100%", textAlign: "right", paddingTop: 10 }}>
						<div className="Wrapper" style={{ maxWidth: 1000, margin: "0 auto" }}>
							<DateTimePicker onChange={(newValue) => setStartTemp(newValue)} label="Start" value={startTemp} format="YYYY-MM-DD HH:mm" />
							<DateTimePicker onChange={(newValue) => setStopTemp(newValue)} label="Stop" value={stopTemp} format="YYYY-MM-DD HH:mm" />
						</div>
					</header>
					<div className="App ">
						<TextField id="outlined-basic" label="tx_sign A" style={{ width: 160 }} onChange={(e) => setTXSignA(e.target.value)} variant="outlined" value={TXSignA} />
						<TextField id="outlined-basic" label="tx_sign B" style={{ width: 160 }} onChange={(e) => setTXSignB(e.target.value)} variant="outlined" value={TXSignB} />
						<TextField
							value={band}
							onChange={(e) => setBand(e.target.value)}
							select
							label="Band"
							style={{ width: 120 }}
						>
							<MenuItem key={1} value="7">7 MHz</MenuItem>
							<MenuItem key={2} value="10">10 MHz</MenuItem>
							<MenuItem key={3} value="14">14 MHz</MenuItem>
						</TextField>
						<TextField id="outlined-basic" label="number of entries" onChange={(e) => setNumberOfEntriesTemp(e.target.value)} variant="outlined" type="number" value={numberOfEntriesTemp} />
						<Button variant="contained" size="large" style={{ height: 56 }} onClick={submitButton}>🔍</Button>

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
								{ i: "i", x: 0, y: 5, w: 3, h: 2, static: false },
								{ i: "j", x: 3, y: 5, w: 3, h: 2, static: false },
							]}
							cols={6}
							rowHeight={140}
							width={1000}
							onResize={()=>window.dispatchEvent(new Event('resize'))}
						>
							<div className="PanelContainer" key="f">
								<div className="PanelHeader">Data points {TXSignA}</div>
								<div className="PanelContent" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
									<div style={{ lineHeight: "100px", color: "green", fontSize: "3em" }}>{WSPRAData && WSPRAData.data && WSPRAData.data.length || "No data"}</div>
								</div>
							</div>
							<div className="PanelContainer" key="g">
								<div className="PanelHeader">Data points {TXSignB}</div>
								<div className="PanelContent" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
									<div style={{ lineHeight: "100px", color: "green", fontSize: "3em" }}>{WSPRBData && WSPRBData.data && WSPRBData.data.length || "No data"}</div>
								</div>
							</div>
							<div className="PanelContainer" key="h">
								<div className="PanelHeader">Data points compare</div>
								<div className="PanelContent" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
									<div style={{ lineHeight: "100px", color: "green", fontSize: "3em" }}>{WSPRCData && WSPRCData.data && WSPRCData.data.length || "No data"}</div>
								</div>
							</div>
							<div className="PanelContainer" key="a">
								<div className="PanelHeader">{TXSignA}</div>
								<div className="PanelContent" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
									{promiseNoData(WSPRAPromiseState) || <WSPRMap data={WSPRAPromiseState.data.data} meta={WSPRAPromiseState.data.meta} title={TXSignA} />}
								</div>
							</div>
							<div className="PanelContainer" key="b">
								<div className="PanelHeader">{TXSignB}</div>
								<div className="PanelContent" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
									{promiseNoData(WSPRBPromiseState) || <WSPRMap data={WSPRBPromiseState.data.data} meta={WSPRBPromiseState.data.meta} title={TXSignB} />}
								</div>
							</div>
							<div className="PanelContainer" key="c">
								<div className="PanelHeader">Compare</div>
								<div className="PanelContent" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
									{promiseNoData(WSPRCPromiseState) || <WSPRMap data={WSPRCPromiseState.data.data} meta={WSPRCPromiseState.data.meta} title={TXSignC} />}
								</div>
							</div>
							<div className="PanelContainer" key="d">
								<div className="PanelHeader">Antenna gain pattern</div>
								<div className="PanelContent" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
									{promiseNoData(WSPRCPromiseState) || <AntennaGain data={WSPRCPromiseState.data} />}
								</div>
							</div>
							<div className="PanelContainer" key="e">
								<div className="PanelHeader">Receptions difference</div>
								<div className="PanelContent" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
									{promiseNoData(WSPRCPromiseState) || <ReceptionBarGraph data={WSPRCPromiseState.data} />}
								</div>
							</div>
							<div className="PanelContainer" key="i">
								<div className="PanelHeader">Histogram</div>
								<div className="PanelContent" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
									{promiseNoData(WSPRCPromiseState)|| <Histogram data={WSPRCPromiseState.data} />}
								</div>
							</div>
							<div className="PanelContainer" key="j">
								<div className="PanelHeader">Number of receptions over time</div>
								<div className="PanelContent" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onTouchMove={e => e.stopPropagation()}>
									{promiseNoData(WSPRCPromiseState)|| <NumberOfReceptionsGraph data={[WSPRAPromiseState.data, WSPRBPromiseState.data, WSPRCPromiseState.data]} start={start} stop={stop} titles={[TXSignA,TXSignB,TXSignC]} />}
								</div>
							</div>
						</GridLayout>
					</div>
				</div>
				{showBottomBar&&<BottomBar data={[WSPRAPromiseState.data, WSPRBPromiseState.data, WSPRCPromiseState.data]} TXSignA={TXSignA} TXSignB={TXSignB} close={()=>setShowBottomBar(false)} />}
				{!showBottomBar&&<Button style={{position:"absolute",bottom:0,right:20}} onClick={()=>setShowBottomBar(true)}>Show data panel</Button>}
			</ThemeProvider>
		</LocalizationProvider>
	);
}

export default App;

