import '../styles/BottomBar.css';

import React, {useState} from 'react';

import SimpleTable from './SimpleTable';
import ComplicatedTable from './ComplicatedTable';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';


function BottomBar({datasets, close}) {
    const [selectedTab, setSelectedTab] = useState(0);

    const handleTabChange = (event, newValue) => {
      setSelectedTab(newValue);
    };

    if(!datasets) {
      return <p>No datasets</p>;
    }

    return (
    <div className="BottomBar">
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            centered>
            {datasets.map((tab,index)=>(<Tab key={index} label={tab.name}/>))}
          </Tabs>
          {!datasets[selectedTab].dataTable&&(<p>No data 😓</p>)}
          {/* {datasets[selectedTab].dataTable&&(<SimpleTable dataTable={datasets[selectedTab].dataTable}/>)} */}
          {datasets[selectedTab].dataTable&&(<ComplicatedTable dataTable={datasets[selectedTab].dataTable}/>)}
          <Button
            className="MyButton"
            variant="contained"
            onClick={close}><CloseIcon/></Button>
    </div>);
}

export default BottomBar;