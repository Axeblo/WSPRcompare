import '../styles/ReceptionsOverTime.css';

import React, { useEffect, useState, useRef } from 'react';
import dayjs from 'dayjs';

import Chart from 'chart.js/auto';

function ReceptionsOverTime({datasets, start, stop}) {
	const [chartStore, setChartStore] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);


	const chartRef = useRef();
    const canvasRef = useRef();


	function createEmptyChart() {
		var labels = [];

        for (var i = start; i <= stop; i = i.add(2, 'minutes'))
			labels.push(dayjs(i).format("DD/MM HH:mm"));

		if (chartRef.current) chartRef.current.destroy();

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

        var labels = [];

        for (var i = start; i <= stop; i = i.add(2, 'minutes'))
			labels.push(dayjs(i).format("DD/MM HH:mm"));

		var output = [];

		datasets.forEach((row, index) => {
			var temp = new Array(labels.length).fill(0);
			if( row.dataTable )
				row.dataTable.data.forEach((row, index) => {
					var date = dayjs(row[1]);
					var i = date.diff(start,"m")/2;
					temp[i] += 1;
			});
			output.push(temp);
		})

		if (chartRef.current) chartRef.current.destroy();

		chartRef.current = new Chart(
			canvasRef.current,
			{
				type: 'line',
				data: {
                    labels: labels,
					datasets:
						datasets.map((row, index)=>{return {label:row.name, fill:true, data:output[index]}}),
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
	}, [datasets]);

    return <div className="ReceptionsOverTime"><div className="ErrorMessage">{errorMessage}</div><canvas style={{width:"100%", height:"100%"}} id="number_of_receptions" ref={canvasRef}></canvas></div>
}

export default ReceptionsOverTime;