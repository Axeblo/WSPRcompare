import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

import '../styles/ComplicatedTable.css';

import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useDemoData } from '@mui/x-data-grid-generator';

const VISIBLE_FIELDS = ['name', 'rating', 'country', 'dateCreated', 'isAdmin'];

function ComplicatedTable({ dataTable }) {

    const [columns, setColumns] = useState(formatColumns());
    const [rows, setRows] = useState(formatRows());

    function formatColumns() {
        const columns = dataTable.meta.map(row=>{
            const rowData = {}; 
                                       rowData["field"] = row.name;
                                       rowData["headerName"] = row.name;
            if(row.name==="id")        rowData["width"] = 100;
            if(row.name==="time")      rowData["width"] = 140;
            if(row.name==="band")      rowData["width"] = 30;
            if(row.name==="rx_sign")   rowData["width"] = 80;
            if(row.name==="rx_lat")    rowData["width"] = 70;
            if(row.name==="rx_lon")    rowData["width"] = 70;
            if(row.name==="rx_loc")    rowData["width"] = 70;
            if(row.name==="tx_sign")   rowData["width"] = 80;
            if(row.name==="tx_lat")    rowData["width"] = 70;
            if(row.name==="tx_lon")    rowData["width"] = 70;
            if(row.name==="tx_loc")    rowData["width"] = 70;
            if(row.name==="distance")  rowData["width"] = 60;
            if(row.name==="azimuth")   rowData["width"] = 60;
            if(row.name==="rx_azimuth")rowData["width"] = 60;
            if(row.name==="frequency") rowData["width"] = 80;
            if(row.name==="∆power")    rowData["width"] = 40;
            if(row.name==="power")     rowData["width"] = 40;
            if(row.name==="power_a")   rowData["width"] = 40;
            if(row.name==="power_b")   rowData["width"] = 40;
            if(row.name==="∆snr")      rowData["width"] = 40;
            if(row.name==="snr_a")     rowData["width"] = 40;
            if(row.name==="snr_b")     rowData["width"] = 40;
            if(row.name==="snr")       rowData["width"] = 40;
            if(row.name==="drift")     rowData["width"] = 40;
            if(row.name==="∆drift")    rowData["width"] = 40;
            if(row.name==="drift_a")   rowData["width"] = 40;
            if(row.name==="drift_b")   rowData["width"] = 40;
            if(row.name==="version")   rowData["width"] = 80;
            if(row.name==="code")      rowData["width"] = 30;
            return rowData;
        })
        return columns;
    }

    function formatRows() {
        const formattedRow = dataTable.data.map(row => {
            const rowData = {};
            for (let i = 0; i < row.length; i++) {
            rowData[dataTable.meta[i].name] = row[i];
            }
            return rowData;
        });
        return formattedRow;
    }

    useEffect(()=>{
        setColumns(formatColumns());
        setRows(formatRows());
    }, [dataTable])

	if(!dataTable)
		return <>No dataTable</>;
	if(!dataTable.data)
		return <>No data in dataTable</>;

	return (
        <DataGrid
            rows={rows}
            columns={columns}
            density="compact"
            slots={{ toolbar: GridToolbar }}
            style={{height: "calc( 100% - 50px )"}}/>
	);
}

export default ComplicatedTable;