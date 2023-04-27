import '../styles/AntennaGain.css'

import React, {useEffect, useState, useRef} from "react";
import * as d3 from 'd3';
import { axisBottom, axisLeft } from 'd3-axis';

function deleteCircularHeatmap(selector) {
    d3.select(selector).select("svg").remove();
}

function createCircularHeatMap(data, selector) {
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

    const margin = { top: 20, right: 20, bottom: 40, left: 40 }
    const width = 480;
    const height = 400;
    const inner_radius = 60;
    const outer_radius = 180;
    
    const sliceSize = 20
    const numSlices = 360/sliceSize
    
    
    let minSNR = d3.min(data,d=>d[SNR])    
    let maxSNR = d3.max(data,d=>d[SNR])
    var numberOfBuckets = maxSNR-minSNR; // each histogram is a column, so number of rows in column

    let cellHeight = (outer_radius-inner_radius)/numberOfBuckets; //Cell row height
    const svgRoot =
    d3.select(selector)
        .append("svg")
        .attr("width", width)
        .attr("height", height)

    const svg = svgRoot
        .append('g')
        .attr('transform', `translate(${width/2},${height/2})`);
    
    var theta = d3.scaleLinear()
        .domain([0,360])
        .range([0.0,2.0*Math.PI])

    let majorData = []; //All the histograms stored.
    let means = Array()//Mean values

    for( let i = 0; i < numSlices; ++i ) {

        const sliceBegin = sliceSize*i //Deg
        const sliceEnd = sliceSize*(i+1) //Deg
    
        let dataSlice = data.filter(d=>d[AZIMUTH] >= sliceBegin&&d[AZIMUTH]<sliceEnd)
        
        if(dataSlice.length >= 1) means = [...means,{sliceBegin:sliceBegin, azimuth:i*sliceSize, value:dataSlice.reduce((acc, curr)=>acc+curr[SNR], 0)/dataSlice.length}] ;

        const histogram = d3.histogram()
            .value(d=>d[SNR])
            .domain([minSNR,maxSNR])
            .thresholds(numberOfBuckets);
        const bins = histogram(dataSlice)
        majorData = [...majorData, ...bins.map(d=>{return {length:d.length, x0:d.x0, x1:d.x1, sliceBegin:sliceBegin, sliceEnd:sliceEnd}})]
    }

    function ir(d, i) {
        var row = i%numberOfBuckets;
        return inner_radius+row*cellHeight;
    }

    function or(d, i) {
        var row = i%numberOfBuckets + 1;
        return inner_radius+row*cellHeight;
    }

    function sa(d, i) {
        var column = Math.floor(i/numberOfBuckets);
        return theta(column*sliceSize)
    }

    function ea(d, i) {
        var column = Math.floor(i/numberOfBuckets + 1)
        return theta(column*sliceSize)
    }
    const majorDataMax = d3.max(majorData, d=>d.length)

    var colorScale = d3.scaleLinear()
        .domain([0, majorDataMax*1/3, majorDataMax*2/3, majorDataMax])
        .range(["#352033", "red", "blue", "white"]);



    //Label path
    let label_rad = outer_radius+8;
    svg.append("def")
        .append("path")
        .attr("id", "time_path")
        .attr("d", "M0 "+"-"+label_rad+" a"+label_rad+" "+label_rad+" 0 1 1 -1 0");

    //Inner label path
    label_rad = inner_radius-10;
    svg.append("def")
        .append("path")
        .attr("id", "inner_path")
        .attr("d", "M0 "+"-"+label_rad+" a"+label_rad+" "+label_rad+" 0 1 1 -1 0");


    ///Labels
    for(var i=0; i<numSlices; i++) {
        svg.append("text")
            .attr("class", "time label")
            .append("textPath")
            .attr("xlink:href", "#time_path")
            .attr("startOffset", i*sliceSize*100/360+"%")
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .text(""+i*sliceSize)
            .attr("fill", "#AAA")
    }

    //Status label 1
    svg.append('text')
        .attr("id", "status")
        .attr("font-size","16px")
        .attr("text-anchor", "middle")
        .attr("fill", "#CCC")
    
        //Status label 2
    svg.append('text')
        .attr("id", "status2")
        .attr("font-size","15px")
        .attr("text-anchor", "middle")
        .attr("fill", "#CCC")
        .attr("y", "20")

    //Range label
    svg.append('text')
        .append("textPath")
        .attr("id", "status")
        .attr("font-size","11px")
        .attr("text-anchor", "left")
        .attr("fill", "#CCC")
        .attr("startOffset", 0.6+"%")
        .attr("x", 20)
        .attr("y", "-40")
        .attr("xlink:href", "#time_path")
        .text(maxSNR+"dBm")
    svg.append('text')
        .append("textPath")
        .attr("font-size","11px")
        .attr("text-anchor", "left")
        .attr("startOffset", 0+"%")
        .attr("fill", "#CCC")
        .attr("xlink:href", "#inner_path")

        .text(minSNR+"dBm")


    //Each cell
    svg.append('g').selectAll('path')
        .data(majorData)
        .join("path")
            .attr("fill", d=>((d.length===0)?"#222":colorScale(d.length)))
            .style("transition", "opacity 1s")
            .on('mouseover', (event,d)=>{
                d3.select('#status').text(majorData.filter(d2=>d2.sliceBegin===d.sliceBegin&&d2.length>0).length+" spots");
                for(var s = 0; s<360; s+=sliceSize) {
                    if(s ===d.sliceBegin) continue;
                    d3.selectAll('.slice'+s).style("opacity",0.3)
                }
                let sliceDatapoints = data.filter(dat=>dat[AZIMUTH]>=d.sliceBegin&&dat[AZIMUTH]<d.sliceEnd).map(d=>d[SNR])
                let stdDev = d3.deviation(sliceDatapoints)
                if(stdDev !== undefined )
                    d3.select('#status2').text("StdDev: "+stdDev.toFixed(2));
            })
            .on('mouseout', (e,d)=>{
                d3.select('#status').text("");
                d3.select('#status2').text("");
                for(var s = 0; s<360; s+=sliceSize) {
                    d3.selectAll('.slice'+s).style("opacity",1)
                }
            })
            .attr("class", d=>"slice"+d.sliceBegin)
            .attr("d", d3.arc()
                .innerRadius((d, i)=>ir(d.length, i))
                .outerRadius((d, i)=>or(d.length, i))
                .startAngle((d, i)=>sa(d.length, i))
                .endAngle((d, i)=>ea(d.length, i))
                .padAngle(0.1)
                .padRadius(inner_radius))


    //For the SNR Curve
    var lineRadial = d3.lineRadial()
        .angle(d => theta(d.azimuth)+thetaOffset)
        .radius(d => inner_radius+(d.value-minSNR)*cellHeight )
        .curve(d3.curveBasisClosed);

    
    let thetaOffset = theta(sliceSize/2)//For snr path and dots

    // //Create the mean SNR curve
    // svg.append("path")
    //     .data([means])
    //     .attr("d", lineRadial)
    //     .attr("fill", "none")
    //     .attr("stroke", "black")
	// 	.style("stroke", "white")
    //     .style("stroke-opacity", 1)
    //     .style("stroke-width", 3 + "px");

    //Create dots for each mean value
    svg.append("g")
        .selectAll(".radarCircle")
        .data(means)
        .join("circle")
        .attr("class", "radarCircle")
        .attr("r", 4)
        .attr("cx", d=>(inner_radius+(d.value-minSNR)*cellHeight)*Math.cos(theta(d.azimuth)-Math.PI/2+thetaOffset) )
        .attr("cy", d=>(inner_radius+(d.value-minSNR)*cellHeight)*Math.sin(theta(d.azimuth)-Math.PI/2+thetaOffset))
        .style("fill", "white")
        .style("fill-opacity", 1)
        .on('mouseover', (event,d)=>{
                d3.select('#status').text("μ="+d.value.toFixed(2));
                for(var s = 0; s<360; s+=sliceSize) {
                    if(s ===d.sliceBegin) continue;
                    d3.selectAll('.slice'+s).style("opacity",0.3)
                }
        })
        .on('mouseout', (e,d)=>{
            d3.select('#status').text("");
            d3.select('#status2').text("");
            for(var s = 0; s<360; s+=sliceSize) {
                d3.selectAll('.slice'+s).style("opacity",1)
            }
        })
}

function CircularHeatmap({datasets, defaultDatasetIndex}) {
    const [errorMessage, setErrorMessage] = useState(null);
    const gainChartRef = useRef(null)
    const chartRef = useRef();

    function createEmptyChart() {
        
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

        deleteCircularHeatmap("#heatmap")
        createCircularHeatMap(dataTable.data, "#heatmap")
        
    },[datasets]);

    return <div id="heatmap">
        {errorMessage&&<div className="ErrorMessage">{errorMessage}</div>}
            </div>;
}

export default CircularHeatmap;