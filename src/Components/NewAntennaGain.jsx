import '../styles/AntennaGain.css'

import React, {useEffect, useState} from "react";
import Chart from 'chart.js/auto'

function AntennaGain({dataTable}) {
    const [antennaGainChart,setAntennaGainChart] = useState(null);

    useEffect(()=>{
        if(!dataTable) return;
        if(!dataTable.data) return;
        if(!dataTable.meta) return;
        if(!dataTable.data[0]) return;

        if(antennaGainChart) antennaGainChart.destroy();

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

        var chart = new Chart(
        document.getElementById('antennaGain'),
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
                        min: -10,
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
        setAntennaGainChart(chart);
    },[dataTable]);

    if(!dataTable)
        return <div style={{lineHeight:"100px"}}>No data 😓</div>;

    if(!dataTable.data)
        return <div style={{lineHeight:"100px"}}>No data in dataTable❗</div>;
        
    if(!dataTable.data[0])
        return <div style={{lineHeight:"100px"}}>No data 😓</div>;

    return <div className="AntennaGain"><canvas id="antennaGain"></canvas></div>;
}

export default AntennaGain;