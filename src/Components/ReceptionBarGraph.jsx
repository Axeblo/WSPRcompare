import "../styles/ReceptionBarGraph.css";

import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

import React, { useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import dayjs from 'dayjs';

function ReceptionBarGraph({dataset}) {
	const [chart, setChart] = useState(null);
	const [selectDataset, setSelectDataset] = useState(0);

    //Every time data changes, update the chart
	useEffect(() => {
		if( !dataset ) return;

		if (chart !== null){
			chart.destroy();
			setChart(null);
		}

		var dataTable = dataset[selectDataset].dataTable;
		
		var newChart = new Chart(
			document.getElementById('ReceptionBarGraphHande'),
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
		setChart(newChart);

	}, [selectDataset, dataset]);

    return (
	<div className="ReceptionBarGraph">
		<TextField
			value={selectDataset}
			onChange={(e) => setSelectDataset(e.target.value)}
			select
			label="Data set"
			size="small"
			style={{width: "120px", position:"absolute", top: 16, right:10}} >
			{dataset.map((row,index)=><MenuItem key={index} value={index}>{row.name}</MenuItem>)}
		</TextField>
		<canvas id="ReceptionBarGraphHande"></canvas>
</div>);
}

export default ReceptionBarGraph;