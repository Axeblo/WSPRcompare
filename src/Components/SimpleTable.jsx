import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

import '../styles/SimpleTable.css';


const VISIBLE_FIELDS = ['name', 'rating', 'country', 'dateCreated', 'isAdmin'];

function SimpleTable({ dataTable }) {
	if(!dataTable)
		return <>No dataTable</>;
	if(!dataTable.data)
		return <>No data in dataTable</>;
	
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
					{dataTable.data.map((row, index) => (
						<tr key={index}>
							{row.map((col, index) => (
								<td key={index}>{col}</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export default SimpleTable;