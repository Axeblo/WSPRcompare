import './BottomBar.css';
import './App.css';

import React, {useState, useEffect} from 'react';

import MyTable from './MyTable';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function prmiseNoDataTable(WSPRPromise,WSPRData,WSPRError) {
    if(!WSPRPromise)
      return <div className="loading_table">No data 😓</div>;
    if(!WSPRData) {
      if(!WSPRError)
        return <div className="loading_table"><div className="lds-dual-ring"></div></div>;
      else
        return <h1>Error...</h1>;
    }
    if(!WSPRError)
      return "";
  }

function BottomBar({data,TXSignA,TXSignB}) {
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
    </div>);
}

export default BottomBar;