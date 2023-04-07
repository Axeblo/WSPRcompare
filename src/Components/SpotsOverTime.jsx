import '../styles/SpotsOverTime.css';

import React, { useEffect, useState, useRef } from 'react';
import dayjs from 'dayjs';
import dayjsPluginUTC from 'dayjs-plugin-utc'
dayjs.extend(dayjsPluginUTC)

import Chart from 'chart.js/auto';

function SpotsOverTime({datasets, start, stop}) {
	const [chartStore, setChartStore] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);


	const chartRef = useRef();
    const canvasRef = useRef();


	function createEmptyChart() {
		var labels = [];

		if (chartRef.current) {
			chartRef.current.data = {labels: labels};
			chartRef.current.update();
		}
		else {
			chartRef.current = new Chart(
				canvasRef.current,
				{
					type: 'line',
					data: {
						labels: labels
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
							},
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
            createEmptyChart();
			return;
		}

		var dataset = datasets[0]

		if( dataset === undefined ){
			setErrorMessage("Invalid dataset index");
            createEmptyChart();
			return;
		}

		var status = dataset.status

		if( status === undefined ){
			setErrorMessage("Incorrect dataset format, no status.");
            createEmptyChart();
			return;
		}

		if( status === "no_action") {
			setErrorMessage("No query");
            createEmptyChart();
			return;
		}

		if( status === "loading") {
			setErrorMessage("loading...");
            createEmptyChart();
			return;
		}

		if( status !== "done") {
			setErrorMessage("Unknown error...");
            createEmptyChart();
			return;
		}

		var dataTable = dataset.dataTable;

		if( dataTable === undefined ) {
			setErrorMessage("No dataTable");
            createEmptyChart();
			return;
		}

		if( dataTable === null ) {
			setErrorMessage("No dataTable(null)");
            createEmptyChart();
			return;
		}

		if( !Array.isArray(dataTable.data) ) {
			setErrorMessage("No data in tableData");
            createEmptyChart();
			return;
		}
		
		var mean = 1;
		if( stop.diff(start, "m")/2 > 2000)
			mean = 10;

		if( stop.diff(start, "m")/2 > 7000)
			mean = 100;

        var labels = [];

        for (var i = start; !stop.isBefore(i); i = i.add(2*mean, 'minutes'))
			labels.push(i.local().format("DD/MM HH:mm"));

		var output = [];

		datasets.forEach((row, index) => {
			var temp = new Array(labels.length).fill(0);
			if( row.dataTable ) {
				row.dataTable.data.forEach((row, index) => {
					var date = dayjs.utc(row[1]);
					var i = parseInt(date.diff(start,"m")/2/mean);
					temp[i] += 1;
				})
			}
			output.push(temp);
		})

		if (chartRef.current) {
			chartRef.current.data= {
				labels: labels,
				datasets:datasets.map((row, index)=>{
					return {
						label:row.name, fill:false, data:output[index], pointRadius: 0, borderWidth: 1.3
					}
				})
			};
			chartRef.current.update();
		}
		else {
			chartRef.current = new Chart(
				canvasRef.current,
				{
					type: 'line',
					data: {
						labels: labels,
						datasets:datasets.map((row, index)=>{
							return {
								label:row.name, fill:false, data:output[index], pointRadius: 0, borderWidth: 1.3
							}
						})
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
							},
						},
						maintainAspectRatio: false,
						responsive: true,
					},
				}
			);
		}
	}, [datasets]);

    return <div className="SpotsOverTime"><div className="ErrorMessage">{errorMessage}</div><canvas style={{width:"100%", height:"100%"}} id="number_of_spots" ref={canvasRef}></canvas></div>
}

export default SpotsOverTime;