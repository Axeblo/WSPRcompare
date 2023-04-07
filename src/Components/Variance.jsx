import "../styles/Variance.css"

import React, {useEffect, useState} from "react";

import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import SettingsIcon from '@mui/icons-material/Settings';

function Variance({datasets, defaultDatasetIndex}) {
    
    const [selectDataset, setSelectDataset] = useState(defaultDatasetIndex);
    const [errorMessage, setErrorMessage] = useState(null);
    const [column, setColumn] = useState(16);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [value, setValue] = React.useState(NaN);
    const [incompatibleData, setIncompatibleData] = useState(false);

    useEffect(() => {
        setErrorMessage(null);
        if( !Array.isArray(datasets) ){
			setErrorMessage("Invalid datasets");
			return;
		}

		var dataset = datasets[selectDataset]

		if( dataset === undefined ){
			setErrorMessage("Invalid dataset index");
			return;
		}

		var status = dataset.status

		if( status === undefined ){
			setErrorMessage("Incorrect dataset format, no status.");
			return;
		}

		if( status === "no_action") {
			setErrorMessage("No query");
			return;
		}

		if( status === "loading") {
			setErrorMessage("loading...");
			return;
		}

		if( status !== "done") {
			setErrorMessage("Unknown error...");
			return;
		}

		var dataTable = dataset.dataTable;

		if( dataTable === undefined ) {
			setErrorMessage("No dataTable");
			return;
		}

		if( dataTable === null ) {
			setErrorMessage("No dataTable(null)");
			return;
		}

		if( !Array.isArray(dataTable.data) ) {
			setErrorMessage("No data in tableData");
			return;
		}

        var incompatible = false;
        dataTable.data.forEach(row => { if (typeof(row[column]) !== 'number') incompatible = true;});

        if(incompatible){
            setIncompatibleData(true);
            return;
        }
        else
            setIncompatibleData(false);

        const mean = dataTable.data.reduce((acc, row) => acc + row[column], 0) / dataTable.data.length;
        const sq = dataTable.data.map(row =>Math.pow( row[column] - mean, 2) )
        const variance = sq.reduce((acc, curr) => acc + curr,0) / dataTable.data.length;
        setValue(variance);
    },[datasets, selectDataset, column]);

    if( !Array.isArray(datasets) ||
        datasets.length <= selectDataset ||
        datasets[selectDataset].dataTable === undefined ||
        datasets[selectDataset].dataTable === null ||
        !Array.isArray(datasets[selectDataset].dataTable.data) )
        return <>{errorMessage}</>;

    return (
    <>
        {incompatibleData&&(<span className="VarianceNumber" style={{fontSize:"20px"}} title="🤷‍♀️">Incompatible 😔</span>)}
        {(!incompatibleData)&&(<span className="VarianceNumber" title={value.toFixed(1)}>{value.toFixed(2)}</span>)}
        <Button
            variant="text"
            onClick={(e)=>setAnchorEl(e.currentTarget)}
            className="VarianceSettingsButton"><SettingsIcon/></Button>
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
                    value={selectDataset}
                    onChange={(e) => setSelectDataset(e.target.value)}
                    select
                    label="Data set"
                    size="small"
                    style={{width: "120px", marginRight: "10px"}} >
                    {datasets.map((row,index)=><MenuItem key={index} value={index}>{row.name}</MenuItem>)}
                </TextField>
                <TextField
                    value={column}
                    onChange={(e) => setColumn(e.target.value)}
                    select
                    label="Column"
                    size="small"
                    style={{width: "120px"}} >
                    {datasets[selectDataset].dataTable.meta.map((row,index)=><MenuItem key={index} value={index}>{row.name}</MenuItem>)}
                </TextField>
            </div>
        </Popover>
    </>);
}

export default Variance;