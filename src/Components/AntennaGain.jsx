import '../styles/AntennaGain.css'

import React, {useEffect, useState, useRef} from "react";
import Chart from 'chart.js/auto'

function AntennaGain({datasets, defaultDatasetIndex}) {
    const [errorMessage, setErrorMessage] = useState(null);
    const gainChartRef = useRef(null)
    const chartRef = useRef();

    function createEmptyChart() {
        if(gainChartRef.current) gainChartRef.current.destroy();

        const bucketSize = 20; //degrees
        const bucketCount = Math.floor(360/bucketSize);

        var buckets = [];
        for (var i = 0; i < bucketCount; ++i ) {
            buckets.push([]);
        }
        var labels = Array(bucketCount);

        for(var i = 0; i < bucketCount; ++i) {
            labels[i] = i*bucketSize;
        }
        
        gainChartRef.current = new Chart(
        chartRef.current,
        {
            type: 'radar',
            data: {
                labels: labels
                },
                options: {
                    scale: {
                        /*min: -10,*/
                    },
                    scales: {
                        r: {
                            ticks: {
                            color: 'transparent',
                            backdropColor: 'transparent'
                            },
                            grid: {
                            color: '#ffffff33',
                            circular: true
                            },
                            angleLines: {
                                color: '#ffffff33'
                            }
                        }
                    },
                    plugins:{
                        legend: {
                            position: "right",
                            align: "middle",
                            display: false
                        },
                    },
                    maintainAspectRatio: false,
                    responsive: true,
                },
            },              
        );
    }

    useEffect(()=>{
        setErrorMessage(null);
        if( !Array.isArray(datasets) ){
			setErrorMessage("Invalid datasets")
            createEmptyChart();
			return;
		}

		var dataset = datasets[defaultDatasetIndex]

		if( dataset === undefined ){
			setErrorMessage("Invalid dataset index")
            createEmptyChart();
			return;
		}

		var status = dataset.status

		if( status === undefined ){
			setErrorMessage("Incorrect dataset format, no status.")
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

        if(gainChartRef.current) gainChartRef.current.destroy();

        const bucketSize = 20; //degrees
        const bucketCount = Math.floor(360/bucketSize);

        var buckets = [];
        for (var i = 0; i < bucketCount; ++i ) {
            buckets.push([]);
        }
        var labels = Array(bucketCount);

        for(var i = 0; i < bucketCount; ++i) {
            labels[i] = i*bucketSize;
        }

        dataTable.data.forEach(row => {
            const bucketIndex = Math.floor(row[12]/bucketSize);
            buckets[bucketIndex].push(row[16]);
        });

        let output = buckets.map((bucket) => { return bucket.reduce((sum, value) => value+sum, 0)/bucket.length; });

        gainChartRef.current = new Chart(
        chartRef.current,
        {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [
                    {
                    label: "SNR Difference",
                    data: output
                    }
                ]
                },
                options: {
                    scale: {
                        /*min: -10,*/
                    },
                    scales: {
                        r: {
                            ticks: {
                            color: 'transparent',
                            backdropColor: 'transparent'
                            },
                            grid: {
                            color: '#ffffff33',
                            circular: true
                            },
                            angleLines: {
                                color: '#ffffff33'
                            }
                        }
                    },
                    plugins:{
                        legend: {
                            position: "right",
                            align: "middle",
                            display: false
                        },
                    },
                    maintainAspectRatio: false,
                    responsive: true,
                },
            },              
        );
    },[datasets]);

    return <div className="AntennaGain">
        {errorMessage&&<div className="ErrorMessage">{errorMessage}</div>}
        <canvas id="antennaGain" ref={chartRef}></canvas>
            </div>;
}

export default AntennaGain;