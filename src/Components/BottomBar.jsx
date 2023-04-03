import '../styles/BottomBar.css';

import React, {useState} from 'react';

import MyTable from './DataTable';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';


function BottomBar({data,TXSignA,TXSignB, close}) {
    const [selectedTab, setSelectedTab] = useState(0);

    const handleTabChange = (event, newValue) => {
      setSelectedTab(newValue);
    };
  
    console.log(data);

    return (
    <div className="BottomBar">
          <Tabs value={selectedTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary" centered>
            <Tab label={TXSignA} />
            <Tab label={TXSignB} />
            <Tab label="Compare" />
          </Tabs>
          {data&&data[selectedTab]&&(<MyTable data={data[selectedTab].data} meta={data[selectedTab].meta}/>)}
          <Button
            className="myButton"
            variant="contained"
            style={{position:"absolute", top:10, right:10, width:10, height:30, minWidth:10}}
            onClick={close}>✕</Button>
    </div>);
}

export default BottomBar;