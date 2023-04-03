import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

import '../styles/DataTable.css';

function DataTable({data, meta, title}) {
  if(data === undefined || meta === undefined)
    return <>undef</>;


  return (
    <div className="DataTable">
      <table>
        <thead>
        <tr>
          {meta.map((col, index) => (
            <th key={index}><b>{col.name}</b></th>
          ))}
        </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
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

export default DataTable;