import '../styles/ReceptionsOverTime.css';

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import Chart from 'chart.js/auto';

function ReceptionsOverTime({dataset, start, stop}) {
	const [chartStore, setChartStore] = useState(null);

    //Every time data changes, update the chart
	useEffect(() => {
		if (!dataset)
		return;

        var labels = [];

        for (var i = start; i <= stop; i = i.add(2, 'minutes'))
			labels.push(dayjs(i).format("DD/MM HH:mm"));
    

		var output = [];

		dataset.forEach((row, index) => {
			var temp = new Array(labels.length).fill(0);

			row.dataTable.data.forEach((row, index) => {
				var date = dayjs(row[1]);
				var i = date.diff(start,"m")/2;
				temp[i] += 1;
			});

			/*
			for (var i = start; i < stop; i = i.add(2, 'minutes')) {
				var results = row.dataTable.data.filter(row => {
					return row[1] === dayjs(i).format("YYYY-MM-DD HH:mm:ss");
				});
				temp.push(results.length);
			}*/
			output.push(temp);
		})

		if (chartStore) chartStore.destroy();
		setChartStore(null);

		var chart = new Chart(
			document.getElementById('number_of_receptions'),
			{
				type: 'line',
				data: {
                    labels: labels,
					datasets:
						dataset.map((row, index)=>{return {label:row.name, fill:true, data:output[index]}}),
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
		setChartStore(chart);
	}, [dataset]);

    return <div className="ReceptionsOverTime"><canvas style={{width:"100%", height:"100%"}} id="number_of_receptions"></canvas></div>
}

export default ReceptionsOverTime;