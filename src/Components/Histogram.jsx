import '../styles/Histogram.css';

import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto'

function Histogram({ data }) {
    const [histogram, setHistogram] = useState(null);

    useEffect(() => {
        if (!data || !data.data) return;
        if (histogram) histogram.destroy();
        setHistogram(null);

        var lowestSNR = Infinity;
        var highestSNR = -Infinity;

        data.data.forEach(row => { if (row[16] < lowestSNR) lowestSNR = row[16]; });
        data.data.forEach(row => { if (row[16] > highestSNR) highestSNR = row[16]; });

        if(lowestSNR === Infinity || highestSNR === -Infinity) return;

        console.log("lowestSNR: " + lowestSNR + " highestSNR: " + highestSNR);

        var snrBuckets = new Array(highestSNR - lowestSNR).fill(0);
        var histogramLabels = [highestSNR - lowestSNR];

        for (var i = 0; i < highestSNR - lowestSNR; ++i) {
            histogramLabels[i] = i + lowestSNR;
        }

        data.data.forEach(row => {
            snrBuckets[row[16] - lowestSNR] += 1;
        });

        var chart3 = new Chart(
            document.getElementById('histogram'),
            {
                type: 'bar',
                data: {
                    labels: histogramLabels,
                    datasets: [
                        {
                            label: '# of receptions',
                            data: snrBuckets
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
                },
            }
        );

        setHistogram(chart3);
    }, [data]);

    if (!data)
        return <div style={{ lineHeight: "100px" }}>No data 😓</div>;

    return (
        <div className="histogram"><canvas id="histogram"></canvas></div>);
}

export default Histogram;