import "../styles/ReceptionBarGraph.css";

import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

import React, { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';
import dayjs from 'dayjs';

function ReceptionBarGraph({datasets, defaultDatasetIndex}) {
    const [errorMessage, setErrorMessage] = useState(null);
	const [selectDataset, setSelectDataset] = useState(defaultDatasetIndex);
	const chartRef = useRef(null);
	const canvasRef = useRef();

	function createEmptyGraph() {
		if (chartRef.current !== null){
			chartRef.current.data = {};
			chartRef.current.update();
		}
		else {
			chartRef.current = new Chart(
				canvasRef.current,
				{
					type: 'bar',
					data: {
					},
					options: {
						scales: {
							x: {
								grid: {
									display: true,
									color: '#ffffff22',
								},
							},
							y: {
								grid: {
									display: true,
									color: '#ffffff22',
								},
							}
						},
	
						maintainAspectRatio: false,
						responsive: true,
					},
				}
			);
		}
	}

    //Every time data changes, update the chart
	useEffect(() => {
		
		setErrorMessage(null);
		if( !Array.isArray(datasets) ){
			setErrorMessage("Invalid datasets");
			createEmptyGraph();
			return;
		}

		var dataset = datasets[selectDataset]

		if( dataset === undefined ){
			setErrorMessage("Invalid dataset index")
			createEmptyGraph();
			return;
		}

		var status = dataset.status

		if( status === undefined ){
			setErrorMessage("Incorrect dataset format, no status.")
			createEmptyGraph();
			return;
		}

		if( status === "no_action") {
			setErrorMessage("No query");
			createEmptyGraph();
			return;
		}

		if( status === "loading") {
			setErrorMessage("loading...");
			createEmptyGraph();
			return;
		}

		if( status !== "done") {
			setErrorMessage("Unknown error...");
			createEmptyGraph();
			return;
		}

		var dataTable = dataset.dataTable;

		if( dataTable === undefined ) {
			setErrorMessage("No dataTable");
			createEmptyGraph();
			return;
		}

		if( dataTable === null ) {
			setErrorMessage("No dataTable(null)");
			createEmptyGraph();
			return;
		}

		if( !Array.isArray(dataTable.data) ) {
			setErrorMessage("No data in tableData");
			createEmptyGraph();
			return;
		}

		if( dataTable.data.length > 10000 ) {
			setErrorMessage("Number of entries is too high😑");
			createEmptyGraph();
			return;
		}
		if (chartRef.current){
			//chartRef.current.destroy();
			//chartRef.current = null;

			chartRef.current.data.labels = dataTable.data.map(row => dayjs(row[1]).format("DD/MM HH:mm"))
			chartRef.current.data.datasets = [
				{
					label: 'SNR difference',
					data: dataTable.data.map(row => row[16])
				}
			]
			chartRef.current.update();
		}
		else {
			chartRef.current = new Chart(
				canvasRef.current,
				{
					type: 'bar',
					data: {
						labels: dataTable.data.map(row => dayjs(row[1]).format("DD/MM HH:mm")),
						datasets: [
							{
								label: 'SNR difference',
								data: dataTable.data.map(row => row[16])
							}
						]
					},
					options: {
						scales: {
							x: {
								grid: {
									display: true,
									color: '#ffffff22',
								},
							},
							y: {
								grid: {
									display: true,
									color: '#ffffff22',
								},
							}
						},

						maintainAspectRatio: false,
						responsive: true,
					},
				}
			);
		}

	}, [selectDataset, datasets]);

    return (
	<div className="ReceptionBarGraph">
		{Array.isArray(datasets)&&<TextField
			value={selectDataset}
			onChange={(e) => setSelectDataset(e.target.value)}
			select
			label="Data set"
			size="small"
			style={{width: "120px", position:"absolute", top: 16, right:10}} >
			{datasets.map((row,index)=><MenuItem key={index} value={index}>{row.name}</MenuItem>)}
		</TextField>}
		<canvas id="ReceptionBarGraphHande" ref={canvasRef}></canvas>
		{errorMessage&&<div className="ErrorMessage">{errorMessage}</div>}
</div>);
}

export default ReceptionBarGraph;