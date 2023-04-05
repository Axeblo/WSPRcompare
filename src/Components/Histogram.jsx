import '../styles/Histogram.css';

import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto'

import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

function Histogram({ dataset }) {
    const [histogram, setHistogram] = useState(null);
    const [filterBy, setFilterBy] = useState(-1);
    const [filterType, setFilterType] = useState("=");
    const [filterText, setFilterText] = useState("*");
    const [filterOptions, setFilterOptions] = useState(["*"]);
    const [column, setColumn] = useState(16);
    const [incompatibleData, setIncompatibleData] = useState(false);
    const [selectDataset, setSelectDataset] = useState(2);
    
    const [anchorEl, setAnchorEl] = React.useState(null);

    useEffect(() => {
        if (!dataset[selectDataset] || !dataset[selectDataset].dataTable) return;
        if (histogram) histogram.destroy();

        var incompatible = false;
        dataset[selectDataset].dataTable.data.forEach(row => { if (typeof(row[column]) !== 'number') incompatible = true;});

        if(incompatible){
            setIncompatibleData(true);
            return;
        }
        else
            setIncompatibleData(false);


        //Find the lowest value and the highest value
        var lowestValue = Infinity;
        var highestValue = -Infinity;

        dataset[selectDataset].dataTable.data.forEach(row => { if (row[column] < lowestValue) lowestValue = row[column]; });
        dataset[selectDataset].dataTable.data.forEach(row => { if (row[column] > highestValue) highestValue = row[column]; });

        if(lowestValue === Infinity || highestValue === -Infinity){
            return;
        }

        //Decide the number of buckets.
        var span = highestValue - lowestValue+1;
        var numberOfBuckets = 0;
        var bucketSpan = 1;

        if( span > 1000 ) {
            numberOfBuckets = Math.floor((highestValue - lowestValue + 1)/100);
            bucketSpan = 100;
        }
        else if( span > 100 ) {
            numberOfBuckets = Math.floor((highestValue - lowestValue + 1)/10);
            bucketSpan = 10;
        }
        else
            numberOfBuckets = Math.floor(highestValue - lowestValue + 1);

        var buckets = new Array(numberOfBuckets).fill(0);
        var histogramLabels = [numberOfBuckets];

        for (var i = 0; i < numberOfBuckets; ++i) {
            histogramLabels[i] = i*bucketSpan + lowestValue;
        }

        dataset[selectDataset].dataTable.data.forEach(row => {
            buckets[Math.floor((row[column] - lowestValue)/bucketSpan)] += 1;
        });

        var chart = new Chart(
            document.getElementById('histogram'),
            {
                type: 'bar',
                data: {
                    labels: histogramLabels,
                    datasets: [
                        {
                            label: '# of receptions',
                            data: buckets,
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

        setHistogram(chart);
    },[dataset, column, selectDataset]);

    useEffect(() => {
        if(!dataset || !dataset[selectDataset] || !dataset[selectDataset].dataTable.meta) return;

        var myFilterOptions = ["*"];
        dataset[selectDataset].dataTable.data.forEach(row => {
            if( row.name ) {
                if( !myFilterOptions.find(item=>item===row[0]) )
                    myFilterOptions.push(row[0]);
            }
        })
        setFilterOptions(myFilterOptions);
    },[filterBy]);
    
    if (!dataset || !dataset[selectDataset] || !dataset[selectDataset].dataTable || !dataset[selectDataset].dataTable.data)
        return <div style={{ lineHeight: "100px" }}>No data 😓</div>;
        return (
            <div className="Histogram">
                <canvas id="histogram"></canvas>
                {incompatibleData&&(
                    <div style={{position:"absolute", top: "100px", textAlign:"center", left:"0px", right: "0px"}} >
                        Data is not compatible with histograms 😔
                    </div>)}
                <TextField
                    value={selectDataset}
                    onChange={(e) => setSelectDataset(e.target.value)}
                    select
                    label="Data set"
                    size="small"
                    style={{width: "120px"}} >
                    {dataset.map((row,index)=><MenuItem key={index} value={index}>{row.name}</MenuItem>)}
                </TextField>
                <div style={{width:10, display:"inline-block"}}/>
                <TextField
                    value={column}
                    onChange={(e) => setColumn(e.target.value)}
                    select
                    label="Column"
                    size="small"
                    style={{width: "120px"}} >
                    {dataset[selectDataset].dataTable.meta.map((row,index)=><MenuItem key={index} value={index}>{row.name}</MenuItem>)}
                </TextField>
                <div style={{width:10, display:"inline-block"}}/>
                <Button
                    variant="outlined"
                    disabled
                    onClick={(e)=>setAnchorEl(e.currentTarget)}
                    style={{height:"40px", minWidth:"40px", width:"40px"}}><FilterAltIcon/></Button>
                <Popover
                    id={Boolean(anchorEl)?'popover':undefined}
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    onClose={()=>setAnchorEl(null)}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }} >
                    <Typography sx={{ p: 2 }}>
                        <TextField
                            value={filterBy}
                            onChange={(e) => setFilterBy(e.target.value)}
                            select
                            label="Filter by column"
                            size="small"
                            style={{ width: 120 }} >
                            <MenuItem key={-1} value={-1}>No filter</MenuItem>
                            {dataset[selectDataset].dataTable.meta.map((row,index)=><MenuItem key={index} value={index}>{row.name}</MenuItem>)}
                        </TextField>
                        <div style={{width:10, display:"inline-block"}}/>
                        <TextField
                            value={filterType}
                            onChange={(e) => setFilterBy(e.target.value)}
                            select
                            label=""
                            size="small"
                            style={{ width: 60 }} >
                            <MenuItem key={"="} value={"="}>=</MenuItem>
                            <MenuItem key={"<"} value={"<"}>{"<"}</MenuItem>
                            <MenuItem key={">"} value={">"}>{">"}</MenuItem>
                        </TextField>
                        <div style={{width:10, display:"inline-block"}}/>
                        <TextField
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            select
                            label="filter text"
                            size="small"
                            style={{ width: 120 }} >
                            {filterOptions.map((row,index)=><MenuItem key={index} value={row}>{row}</MenuItem>)}
                        </TextField>
                    </Typography>
                </Popover>
            </div>);
}

export default Histogram;