import React, {useEffect, useState} from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

import '../styles/SimpleTable.css';


const VISIBLE_FIELDS = ['name', 'rating', 'country', 'dateCreated', 'isAdmin'];

function SimpleTable({ dataTable }) {

	const [rows, setRows] = useState(generateRows())

	function generateRows() {
		return dataTable.data.map((row, index) => (
			<tr key={index}>
				{row.map((col, index) => (
					<td key={index}>{col}</td>
				))}
			</tr>
		))
	}

	useEffect(()=>{
		setRows(generateRows());
	},[dataTable])

	if(!dataTable)
		return <>No dataTable</>;
	if(!Array.isArray(dataTable.data))
		return <>No data in dataTable</>;
	if( dataTable.data.length===0 )
		return <p>No data 😓</p>;
	
	return (
		<div className="SimpleTable">
			<table>
				<thead>
					<tr>
						{dataTable.meta.map((col, index) => (
							<th key={index}><b>{col.name}</b></th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows}
				</tbody>
			</table>
		</div>
	);
}

export default SimpleTable;