

import '../styles/Histogram.css';

import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { axisBottom, axisLeft } from 'd3-axis';
import Chart from 'chart.js/auto'

import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FilterAltIcon from '@mui/icons-material/FilterAlt';


function D3Histogram({ datasets, defaultDatasetIndex, width, height, margin  }) {
    const ID         = 0
    const TIME       = 1
    const BAND       = 2
    const RX_SIGN    = 3
    const RX_LAT     = 4
    const RX_LON     = 5
    const RX_LOC     = 6
    const TX_SIGN    = 7
    const TX_LAT     = 8
    const TX_LON     = 9
    const TX_LOC     = 10
    const DISTANCE   = 11
    const AZIMUTH    = 12
    const RX_AZIMUTH = 13 
    const FREQUENCY  = 14
    const POWER      = 15
    const SNR        = 16
    const DRIFT      = 17
    const VERSION    = 18
    const CODE       = 19
    const SNRA       = 20
    const SNRB       = 21
    const DRIFTA     = 22
    const DRIFTB     = 23

    const histogramRef    = useRef( null);
    const histogramCanvas = useRef();
    const containerRef    = useRef();

    
    const [errorMessage,      setErrorMessage      ] = useState(null);
    const [filterBy,          setFilterBy          ] = useState(-1);
    const [filterType,        setFilterType        ] = useState("=");
    const [filterText,        setFilterText        ] = useState("*");
    const [filterValue,       setFilterValue       ] = useState(0);
    const [filterIsNumber,    setFilterIsNumber    ] = useState(false);
    const [disableFilterText, setDisableFilterText ] = useState(true);
    const [filterOptions,     setFilterOptions     ] = useState(["*"]);
    const [column,            setColumn            ] = useState(16);
    const [incompatibleData,  setIncompatibleData  ] = useState(false);
    const [selectDataset,     setSelectDataset     ] = useState(defaultDatasetIndex);
    const [mean,              setMean              ] = useState(null);
    const [variance,          setVariance          ] = useState(null);
    const [standardDeviation, setStandardDeviation ] = useState(null);
    const [numberOfDatapoints,setNumberOfDatapoints] = useState(0);
    const [dimensions,        setDimensions        ] = useState({ width: 0, height: 0 });
    
    const [anchorEl, setAnchorEl] = React.useState(null);



    function createEmptyChart() {
        // if (histogramRef.current) {
        //     // histogramRef.current.destroy();
        //     histogramRef.current.data={};
        //     histogramRef.current.update();
        // }
        // else {
        //     histogramRef.current = new Chart(
        //         histogramCanvas.current,
        //         {
        //             type: 'bar',
        //             data: {
        //             },
        //             options: {
        //                 scales: {
        //                     x: {
        //                       grid: {
        //                         display: true,
        //                         color: '#ffffff22',
        //                       },
        //                     },
        //                     y: {
        //                       grid: {
        //                         display: true,
        //                         color: '#ffffff22',
        //                       },
        //                     },
        //                 },
        //                 maintainAspectRatio: false,
        //                 responsive: true,
        //                 plugins:{
        //                     legend: {
        //                         position: "top",
        //                         align: "middle",
        //                         display: false
        //                     },
        //                 },
        //             },
        //         }
        //     );
        // }
    }

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
          const { width, height } = entries[0].contentRect;
          setDimensions({ width, height });
        });
      
        if (containerRef.current) {
          resizeObserver.observe(containerRef.current);
        }
      
        return () => {
          if (containerRef.current) {
            resizeObserver.unobserve(containerRef.current);
          }
        };
      }, []);

    useEffect(() => {
        setErrorMessage(null);
        setMean(null);
        setStandardDeviation(null);
        setVariance(null);
        setNumberOfDatapoints(0);
        if( !Array.isArray(datasets) ){
			setErrorMessage("Invalid datasets");
            createEmptyChart();
			return;
		}

		var dataset = datasets[selectDataset]

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
        
		if( !Array.isArray(dataTable.data) || dataTable.data.length === 0) {
            setErrorMessage("No data in tableData");
            createEmptyChart();
			return;
		}
        
        dataTable = {...dataTable}

        //Filter
        if(filterBy !== -1) {
            if( !filterIsNumber ){
                setFilterType("=")
                dataTable.data = dataTable.data.filter(row=>row[filterBy]===filterOptions[filterText])
            }
            else {
                if(filterType === "=") {
                    dataTable.data = dataTable.data.filter(row=>row[filterBy]===filterValue)
                }
                else if( filterType === ">" ) {
                    dataTable.data = dataTable.data.filter(row=>row[filterBy]>filterValue)
                }
                else if( filterType === ">=" ) {
                    dataTable.data = dataTable.data.filter(row=>row[filterBy]>=filterValue)
                }
                else if( filterType === "<" ) {
                    dataTable.data = dataTable.data.filter(row=>row[filterBy]<filterValue)
                }
                else if( filterType === "<=" ) {
                    dataTable.data = dataTable.data.filter(row=>row[filterBy]<=filterValue)
                }
                else {
                    console.log("Unknown filter type.");
                }
            }
        }
        setNumberOfDatapoints(dataTable.data.length)
        
        if( dataTable.data.length === 0 ){
            setErrorMessage("No data after filter");
            createEmptyChart();
            return;
        }
        var incompatible = false;
        dataTable.data.forEach(row => { if (typeof(row[column]) !== 'number') incompatible = true;});
        
        if(incompatible){
            setIncompatibleData(true);
            createEmptyChart();
            setMean(null);
            setVariance(null);
            setStandardDeviation(null);
            return;
        }
        else
        setIncompatibleData(false);


        //Find the lowest value and the highest value
        var lowestValue = Infinity;
        var highestValue = -Infinity;
        
        dataTable.data.forEach(row => { if (row[column] < lowestValue) lowestValue = row[column]; });
        dataTable.data.forEach(row => { if (row[column] > highestValue) highestValue = row[column]; });
        
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
        
        
        var data = dataTable.data.map(row=>row[16])
        
        
        d3.select(containerRef.current).selectAll('*').remove();

        if (dimensions.width === 0 || dimensions.height === 0) {
            return;
          }

        const svg = d3
        .select(containerRef.current)
        .append('svg')
        .attr('width', dimensions.width)
        .attr('height', dimensions.height);

        const x = d3.scaleLinear().domain([d3.min(data), d3.max(data)]).range([0, width - margin.left - margin.right]);
        const bins = d3.histogram().domain(x.domain()).thresholds(x.ticks(numberOfBuckets))(data);
        const y = d3.scaleLinear().domain([0, d3.max(bins, (d) => d.length)]).range([height - margin.top - margin.bottom, 0]);

        const mean = d3.mean(data);
        const stdDev = d3.deviation(data);
        const varianceTemp = d3.variance(data);

        const normalDistribution = (x) => {
            return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-((x - mean) * (x - mean)) / (2 * stdDev * stdDev));
        };

        svg
        .selectAll('.bar')
        .data(bins)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('fill','rgba(30,110,190,0.8)')
        .attr('x', (d) => x(d.x0) + margin.left)
        .attr('y', (d) => y(d.length))
        .attr('width', (d) => x(d.x1) - x(d.x0) - 1)
        .attr('height', (d) => height - margin.bottom - y(d.length));

        const line = d3.line().x((d) => x(d[0])).y((d) => y(d[1]));

        const curveData = Array.from({ length: data.length }, (_, i) => [
            x.domain()[0] + (i * (x.domain()[1] - x.domain()[0])) / data.length,
            normalDistribution(x.domain()[0] + (i * (x.domain()[1] - x.domain()[0])) / data.length) * data.length,
        ]);

        svg
        .append('path')
        .datum(curveData)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(255,120,120,0.6)')
        .attr('stroke-width', 2)
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
        .attr('d', line);

        // Draw x-axis
        const xAxis = axisBottom(x);
        svg
            .append('g')
            .attr('transform', `translate(${margin.left}, ${height - margin.bottom})`)
            .attr('stroke', '#666')
            .attr('font-size','20px')
            .call(xAxis)
            .append('text')
            .attr('x', (width - margin.left - margin.right) / 2)
            .attr('y', 35)
            .style('font-size', '14px')
            .style('text-anchor', 'middle')
            .text('X-Axis Label');
            
            // Draw y-axis
            const yAxis = axisLeft(y);
            svg
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`)
            .attr('stroke', '#666')
            .call(yAxis)
            .append('text')
            .attr('x', -((height - margin.top - margin.bottom) / 2))
            .attr('y', -35)
            .attr('fill', 'black')
            .style('font-size', '14px')
            .style('text-anchor', 'middle')
            .attr('transform', 'rotate(-90)')
            .text('Y-Axis Label');

        setMean(mean);
        setVariance(varianceTemp);
        setStandardDeviation(stdDev);
    },[datasets, selectDataset, column, filterText, filterBy, filterValue, filterType, dimensions]);

    function handleFilterOnChange(e) {
        setFilterBy(e.target.value);
        if(e.target.value===-1) {
            setDisableFilterText(true);
            setFilterOptions([]);
            return;
        }
        setDisableFilterText(false);

        const dataTable = datasets[selectDataset].dataTable;

        if( dataTable.meta[e.target.value].type !== "LowCardinality(String)" ) {
            setFilterIsNumber(true);
            setFilterOptions([]);
            return;
        }
        setFilterIsNumber(false);


        const myFilterText = [];


        var uniq = dataTable.data.map(row=>row[e.target.value])
        uniq = [...new Set(uniq)];


        uniq.sort();

        setFilterOptions(uniq);
    }
    
    return (
        <div className="Histogram">
            <div ref={containerRef} style={{width: "100%", height: "100%"}}></div>;
            {incompatibleData&&(
                <div style={{position:"absolute", top: "100px", textAlign:"center", left:"0px", right: "0px"}} >
                    Data is not compatible with histograms 😔
                </div>)}
            {Array.isArray(datasets)&&(
            <>
            {mean!==null&&variance!==null&&standardDeviation!==null&&
                <div style={{display:"inline-block", position:"absolute", top: "50px", right: "30px", textAlign:"left"}}>
                    <span style={{marginRight:"10px"}}>μ: {mean.toFixed(1)}</span>
                    <span style={{marginRight:"10px"}}>σ²: {variance.toFixed(1)}</span>
                    <span style={{marginRight:"10px"}}>σ: {standardDeviation.toFixed(1)}</span><br/>
                    <span style={{}}>Entries: {numberOfDatapoints}</span>
                </div>}
                <TextField
                    value={selectDataset}
                    onChange={(e) => setSelectDataset(e.target.value)}
                    select
                    label="Data set"
                    size="small"
                    style={{width: "120px"}} >
                    {datasets.map((row,index)=><MenuItem key={index} value={index}>{row.name}</MenuItem>)}
                </TextField>
                <div style={{width:10, display:"inline-block"}}/>
                {datasets[selectDataset]!==undefined&&
                datasets[selectDataset] !== null&&
                datasets[selectDataset].dataTable !== undefined&&
                datasets[selectDataset].dataTable !== null&&(
                <>
                    <TextField
                        value={column}
                        onChange={(e) => setColumn(e.target.value)}
                        select
                        label="Column"
                        size="small"
                        style={{width: "120px"}} >
                        {datasets[selectDataset].dataTable.meta.map((row,index)=><MenuItem key={index} value={index}>{row.name}</MenuItem>)}
                    </TextField>
                    <div style={{width:10, display:"inline-block"}}/>
                    <Button
                        variant="outlined"
                        // disabled
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
                        <div style={{padding:"15px"}}>
                            <TextField
                                value={filterBy}
                                onChange={(e) => handleFilterOnChange(e)}
                                select
                                label="Filter by column"
                                size="small"
                                style={{ width: 120 }} >
                                <MenuItem key={-1} value={-1}>No filter</MenuItem>
                                {datasets[selectDataset].dataTable.meta.map((row,index)=><MenuItem key={index} value={index}>{row.name}</MenuItem>)}
                            </TextField>
                            <div style={{width:10, display:"inline-block"}}/>
                            <TextField
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                select
                                label=""
                                size="small"
                                style={{ width: 60 }} >
                                <MenuItem key={0} value={"="}>=</MenuItem>
                                <MenuItem key={1} value={"<"}>{"<"}</MenuItem>
                                <MenuItem key={2} value={"<="}>{"≤"}</MenuItem>
                                <MenuItem key={3} value={">"}>{">"}</MenuItem>
                                <MenuItem key={4} value={">="}>{"≥"}</MenuItem>
                            </TextField>
                            <div style={{width:10, display:"inline-block"}}/>
                            {(!filterIsNumber)&&<TextField
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                select
                                label="filter text"
                                size="small"
                                disabled={disableFilterText}
                                style={{ width: 120 }} >
                                {filterOptions.map((row,index)=><MenuItem key={index} value={index}>{row}</MenuItem>)}
                            </TextField>}
                            {filterIsNumber&&<TextField
                                value={filterValue}
                                onChange={(e)=>setFilterValue(parseInt(e.target.value))}
                                disabled={disableFilterText}

                                size="small"
                                type="number"
                                label="value">
                            </TextField>}

                        </div>
                    </Popover>
                </>)}
            </>)}
        </div>
    );
}

export default D3Histogram;