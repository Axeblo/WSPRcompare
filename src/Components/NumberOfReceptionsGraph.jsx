import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import Chart from 'chart.js/auto';

function NumberOfReceptionsGraph({data, start, stop, titles}) {
	const [chartStore, setChartStore] = useState(null);

    //Every time data changes, update the chart
	useEffect(() => {
		if (!data||!data[0]||!data[1]||!data[2])
			return;

        var labels = [];

        for (var i = start; i < stop; i = i.add(2, 'minutes'))
            labels.push(dayjs(i).format("DD/MM HH:mm"));
        

        var output1 = [];
        for (var i = start; i < stop; i = i.add(2, 'minutes')) {
            var results = data[0].data.filter(row => {
                return row[1] === dayjs(i).format("YYYY-MM-DD HH:mm:ss");
            });
            output1.push(results.length);
        }

        var output2 = [];
        for (var i = start; i < stop; i = i.add(2, 'minutes')) {
            var results = data[1].data.filter(row => {
                return row[1] === dayjs(i).format("YYYY-MM-DD HH:mm:ss");
            });
            output2.push(results.length);
        }

        var output3 = [];
        for (var i = start; i < stop; i = i.add(2, 'minutes')) {
            var results = data[2].data.filter(row => {
                return row[1] === dayjs(i).format("YYYY-MM-DD HH:mm:ss");
            });
            output3.push(results.length);
        }

		if (chartStore) chartStore.destroy();
		setChartStore(null);


		var chart = new Chart(
			document.getElementById('number_of_receptions'),
			{
				type: 'line',
				data: {
                    labels: labels,
					datasets: [
						{
							label: titles[0],
                            fill: true,
							data: output1
						},
						{
							label: titles[1],
                            fill: true,
							data: output2
						},
						{
							label: titles[2],
                            fill: true,
							data: output3
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
                    maintainAspectRatio: false,
                    responsive: true,
                    // plugins:{
                    //     legend: {
                    //         position: "right",
                    //         align: "middle"
                    //     },
                    // },
				},
			}
		);
		setChartStore(chart);

	}, [data]);

    return <div style={{width:"100%", height:"100%"}}><canvas style={{width:"100%", height:"100%"}} id="number_of_receptions"></canvas></div>
}

export default NumberOfReceptionsGraph;