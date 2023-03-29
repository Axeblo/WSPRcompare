import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

function MyTable({data, meta}) {
  if(data === undefined || meta === undefined)
    return <></>;

  return (
    <Paper style={{ height: 400, width: '100%' }}>
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
  );
}

export default MyTable;