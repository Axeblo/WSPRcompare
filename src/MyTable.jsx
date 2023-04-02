import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

import './MyTable.css';

function MyTable({data, meta, title}) {
  if(data === undefined || meta === undefined)
    return <>undef</>;


  return (
    <div className="MyTable">
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
  return (
    <div className="MyTable">
      <h1>{title}</h1>
      <p>number of entries:{data.length}</p>
      <Paper style={{ height: 400, width: '100%' }} className="map">
        <TableContainer sx={{ maxHeight: 440}}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {meta.map((col, index) => (
                  <TableCell key={index}><b>{col.name}</b></TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  {row.map((col, index) => (
                    <TableCell key={index}>{col}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

      </Paper>
    </div>
  );
}

export default MyTable;