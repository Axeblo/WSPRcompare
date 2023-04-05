import "../styles/Variance.css"

import React, {useEffect, useState} from "react";

import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import SettingsIcon from '@mui/icons-material/Settings';

function Variance({dataset}) {
    
    const [selectDataset, setSelectDataset] = useState(2);
    const [column, setColumn] = useState(16);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [value, setValue] = React.useState(NaN);
    const [incompatibleData, setIncompatibleData] = useState(false);

    useEffect(() => {
        //Check if every entry in collumn is a number, if its not set incompatible

        var dataTable = dataset[selectDataset].dataTable;

        var incompatible = false;
        dataTable.data.forEach(row => { if (typeof(row[column]) !== 'number') incompatible = true;});

        if(incompatible){
            setIncompatibleData(true);
            return;
        }
        else
            setIncompatibleData(false);

        const mean = dataTable.data.reduce((acc, row) => acc + row[column], 0) / dataTable.data.length;
        const sq = dataset[selectDataset].dataTable.data.map(row => {
            const deviation = row[selectDataset] - mean;
            return deviation * deviation;
        });

        const variance = sq.reduce((acc, curr) => ( acc + curr) / dataTable.data.length, 0);
        setValue(variance);
    },[dataset, selectDataset, column]);

    return (
    <>
        {incompatibleData&&(<span className="VarianceNumber" style={{fontSize:"20px"}} title="🤷‍♀️">Incompatible 😔</span>)}
        {(!incompatibleData)&&(<span className="VarianceNumber" title={value.toFixed(1)}>{value.toFixed(1)}</span>)}
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
            <Typography sx={{ p: 2 }}>
                <TextField
                    value={selectDataset}
                    onChange={(e) => setSelectDataset(e.target.value)}
                    select
                    label="Data set"
                    size="small"
                    style={{width: "120px", marginRight: "10px"}} >
                    {dataset.map((row,index)=><MenuItem key={index} value={index}>{row.name}</MenuItem>)}
                </TextField>
                <TextField
                    value={column}
                    onChange={(e) => setColumn(e.target.value)}
                    select
                    label="Column"
                    size="small"
                    style={{width: "120px"}} >
                    {dataset[selectDataset].dataTable.meta.map((row,index)=><MenuItem key={index} value={index}>{row.name}</MenuItem>)}
                </TextField>
            </Typography>
        </Popover>
    </>);
}

export default Variance;