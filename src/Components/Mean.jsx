import "../styles/Mean.css"

import React, {useEffect, useState} from "react";

import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import SettingsIcon from '@mui/icons-material/Settings';

function Mean({datasets, defaultDatasetIndex}) {
    
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

        //Check if every entry in collumn is a number, if its not set incompatible
        var incompatible = false;
        dataTable.data.forEach(row => { if (typeof(row[column]) !== 'number') incompatible = true;});

        if(incompatible){
            setIncompatibleData(true);
            return;
        }
        else
            setIncompatibleData(false);

        var mean = dataTable.data.reduce((acc, row) => acc + row[column], 0) / dataTable.data.length;
        setValue(mean);
    },[datasets, selectDataset, column]);

    if( !Array.isArray(datasets) ||
        datasets.length <= selectDataset ||
        datasets[selectDataset].dataTable === undefined ||
        datasets[selectDataset].dataTable === null ||
        !Array.isArray(datasets[selectDataset].dataTable.data) )
        return <>{errorMessage}</>;



    return (
    <>
        <span className="MeanNumber">{incompatibleData?(<span style={{fontSize:"14px"}}>Not compatible data 😔</span>):value.toFixed(1)}</span>
        <Button
            variant="text"
            onClick={(e)=>setAnchorEl(e.currentTarget)}
            className="MeanSettingsButton"><SettingsIcon/></Button>
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
                    value={selectDataset}
                    onChange={(e) => setSelectDataset(e.target.value)}
                    select
                    label="Data set"
                    size="small"
                    style={{width: "120px"}} >
                    {datasets.map((row,index)=><MenuItem key={index} value={index}>{row.name}</MenuItem>)}
                </TextField>
                <div style={{width:10, display:"inline-block"}}/>
                <TextField
                    value={column}
                    onChange={(e) => setColumn(e.target.value)}
                    select
                    label="Column"
                    size="small"
                    style={{width: "120px"}} >
                    {datasets[selectDataset].dataTable.meta.map((row,index)=><MenuItem key={index} value={index}>{row.name}</MenuItem>)}
                </TextField>
            </Typography>
        </Popover>
    </>);
}

export default Mean;