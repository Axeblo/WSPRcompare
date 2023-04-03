import React, { useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import dayjs from 'dayjs';

function ReceptionBarGraph({data}) {
	const [chart, setChart] = useState(null);

    //Every time data changes, update the chart
	useEffect(() => {
		if (!data)
			return;

		if (chart) chart.destroy();
		setChart(null);

		var chart = new Chart(
			document.getElementById('receptions'),
			{
				type: 'bar',
				data: {
					labels: data.data.map(row => dayjs(row[1]).format("DD/MM HH:MM")),
					datasets: [
						{
							label: 'SNR difference',
							data: data.data.map(row => row[16])
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
						},
					},
				},
			}
		);
		setChart(chart);

	}, [data]);

    return <div style={{width:"100%", height:"100%"}}><canvas style={{width:"100%", height:"100%"}} id="receptions"></canvas></div>
}

export default ReceptionBarGraph;