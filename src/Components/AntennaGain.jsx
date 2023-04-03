import '../styles/AntennaGain.css'

import React, {useEffect, useState} from "react";
import Chart from 'chart.js/auto'

function AntennaGain({data}) {
    const [antennaGainChart,setAntennaGainChart]  = useState(null);

    useEffect(()=>{
        if(!data) return;
        if(!data.data) return;

        if(antennaGainChart) antennaGainChart.destroy();
        setAntennaGainChart(null);

        const bucketSize = 20;
        const bucketCount = 360/bucketSize;
        
        var buckets = [bucketCount];
        var labels = [bucketCount];
        for(var i = 0; i < bucketCount; ++i) {
            labels[i] = i*bucketSize;
        }
        data.data.forEach(row => {
            buckets[Math.floor(row[12]/bucketSize)] = row[16];
        });

        var chart = new Chart(
        document.getElementById('antennaGain'),
        {
            type: 'radar',
            data: {
            labels: labels,
            datasets: [
                {
                label: "SNR Difference",
                data: buckets
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
    },[data]);

    if(!data)
        return <div style={{lineHeight:"100px"}}>No data 😓</div>;

    return <div className="AntennaGain"><canvas id="antennaGain"></canvas></div>;
}

export default AntennaGain;