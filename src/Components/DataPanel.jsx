import '../styles/DataPanel.css';

import React, { useState } from 'react';

import SimpleTable         from './SimpleTable';
import ComplicatedTable    from './ComplicatedTable';
import Tabs                from '@mui/material/Tabs';
import Tab                 from '@mui/material/Tab';
import Checkbox            from '@mui/material/Checkbox';
import FormControlLabel    from '@mui/material/FormControlLabel';

function DataPanel({ datasets }) {
	const [selectedTab, setSelectedTab] = useState(0);
	const [checked,     setChecked]     = useState(false);

	const handleTabChange = (event, newValue) => {
		setSelectedTab(newValue);
	};

	if (!Array.isArray(datasets)) {
		return <p>No datasets 😔</p>;
	}

	return (<>
		<Tabs
			value={selectedTab}
			onChange={handleTabChange}
			indicatorColor="primary"
			textColor="primary"
			centered>
			{datasets.map((tab, index) => (<Tab key={index} label={tab.name} />))}
		</Tabs>
		{/* <FormControlLabel
			style={{position:"absolute", top: 4, left: 10}}
			className="SimpleCheck"
			control={
				<Checkbox
				checked={checked}
				onChange={(e)=>setChecked(event.target.checked)} />
			}
			label="Simple table" /> */}
		
		{datasets[selectedTab] === undefined&&<p>Dataset index out of range 😔</p>}
		{datasets[selectedTab].dataTable === undefined && <p>No data ❗</p>}
		{(!checked)&&datasets[selectedTab].dataTable && <ComplicatedTable dataTable={datasets[selectedTab].dataTable} />}
		{checked&&datasets[selectedTab].dataTable && <SimpleTable dataTable={datasets[selectedTab].dataTable} />}
	</>);
}

export default DataPanel;