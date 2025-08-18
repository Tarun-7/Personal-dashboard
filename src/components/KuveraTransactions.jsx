import React, { useState, useEffect } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@mui/material';


const KuveraTransactions = ({ transactions = [], onTotalMarketValue }) => {
    
    const [pagination, setPagination] = useState({});
    const [sortDirection, setSortDirection] = useState('desc'); // State for sorting direction
    const [sortBy, setSortBy] = useState('totalAmount'); // State for sorting by
    const [marketValues, setMarketValues] = useState({}); // State to hold market values
    const [fundCodes, setFundCodes] = useState({}); // State to hold fund codes

    useEffect(() => {
        // Fetch fund codes from the JSON file
        const fetchFundCodes = async () => {
            try {
              const response = await fetch('/data/KuveraCode.json'); // Adjust the path as necessary
              if (!response.ok) {
                const responseText = await response.text(); // Get the response as text
                console.error('Error fetching JSON:', response.status, responseText);
                throw new Error(`Network response was not ok: ${response.statusText}`);
              }
              const data = await response.json(); // Parse the JSON
              setFundCodes(data);
            } catch (error) {
              console.error('Error fetching fund codes:', error);
            }
        };
        fetchFundCodes();
      }, []);

    useEffect(() => {
        // Fetch market values for each fund
        const fetchMarketValues = async () => {
            const values = {};
            for (const [fund, code] of Object.entries(fundCodes)) {
            const response = await fetch(`https://api.mfapi.in/mf/${code}/latest`);
            if (response.ok) {
                const data = await response.json();
                values[fund] = data.data[0].nav; // Assuming nav is the market value
            }
            }
            setMarketValues(values);
        };
        if (Object.keys(fundCodes).length) {
            fetchMarketValues();
        }
    }, [fundCodes]);
    
    if (!transactions.length)
      return <Typography>No transactions uploaded yet.</Typography>;
    
      // Group by fund name (3rd column, index 2)
    const grouped = transactions.reduce((acc, row) => {
      const fund = Object.values(row)[2] ?? "Unknown Fund";
      (acc[fund] = acc[fund] || []).push(row);
      return acc;
    }, {});
    
    // Summary rows
    const summaryRows = Object.entries(grouped).map(([fund, rows]) => {
      const totalAmount = rows.reduce((s, r) => s + parseFloat(Object.values(r)[7] || 0), 0);
      const totalUnits = rows.reduce((s, r) => s + parseFloat(r["Units"] || 0), 0);
      return { fund, totalAmount, totalUnits, marketValue: marketValues[fund] || 0  };
    });
    
    // Sort summary rows based on sortBy and sortDirection
    const sortedSummaryRows = summaryRows.sort((a, b) => {
      if (sortBy === 'totalAmount') {
        return sortDirection === 'asc' ? a.totalAmount - b.totalAmount : b.totalAmount - a.totalAmount;
      }
      return 0; // You can add more sort conditions if needed
    });
    
    
    const handleSort = () => {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    };
    
    // Calculate total market value
    const totalMarketValue = sortedSummaryRows.reduce(
      (sum, r) => sum + ((r.marketValue || 0) * (r.totalUnits || 0)),
      0
    );

  // Notify parent when totalMarketValue changes
    useEffect(() => {
      if (onTotalMarketValue) {
        onTotalMarketValue(totalMarketValue);
      }
    }, [totalMarketValue, onTotalMarketValue]);
    
    return (
      <Box className="bg-gray-900 text-white min-h-screen" display="flex" flexDirection="column" alignItems="center" width="100%">
        <Typography variant="h5" mb={2} className="text-white">Transactions Summary by Fund</Typography>
        <TableContainer component={Paper} sx={{ mb: 4, maxWidth: 960, backgroundColor: '#23272f' }}>
          <Table sx={{ '& td, & th': { color: '#fff' } }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#1a202c' }}>
                <TableCell className="text-white"><strong>Fund Name</strong></TableCell>
                <TableCell align="right" className="text-white"><strong>Units</strong></TableCell>
                <TableCell align="right" className="text-white"><strong>NAV</strong></TableCell>
                <TableCell align="right" className="text-white" onClick={handleSort} style={{ cursor: 'pointer' }}>
                  <strong>Invested {sortDirection === 'asc' ? '↑' : '↓'}</strong>
                </TableCell>
                <TableCell align="right" className="text-white" onClick={handleSort} style={{ cursor: 'pointer' }}>
                  <strong>Market value {sortDirection === 'asc' ? '↑' : '↓'}</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedSummaryRows.map((row, idx) => (
                <TableRow key={idx} sx={{ backgroundColor: idx % 2 === 0 ? '#23272f' : '#1a202c' }}>
                  <TableCell className="text-white">{row.fund}</TableCell>
                  <TableCell align="right" className="text-white">{row.totalUnits.toFixed(2)}</TableCell>
                  <TableCell align="right" className="text-white">₹{(row.marketValue ? row.marketValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00')}</TableCell>
                  <TableCell align="right" className="text-white">₹{(row.totalAmount ? row.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00')}</TableCell>
                  <TableCell align="right" className="text-white">₹{((row.marketValue || 0) * (row.totalUnits || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ backgroundColor: '#1a202c' }}>
                <TableCell className="text-white"><strong>Total</strong></TableCell>
                <TableCell align="right" className="text-white"></TableCell>
                <TableCell align="right" className="text-white"></TableCell>
                <TableCell align="right" className="text-white">
                  <strong>
                    ₹{sortedSummaryRows.reduce((sum, r) => sum + r.totalAmount, 0).toLocaleString()}
                  </strong>
                </TableCell>
                <TableCell align="right" className="text-white">
                  <strong>₹{sortedSummaryRows.reduce((sum, r) => sum + ((r.marketValue || 0) * (r.totalUnits || 0)), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Typography variant="h6" mb={2} className="text-white">Transactions Details by Fund</Typography>
        {Object.entries(grouped).map(([fund, rows]) => {
          const page = pagination[fund]?.page || 0;
          const rowsPerPage = pagination[fund]?.rowsPerPage || 5;
          const handleChangePage = (_, newPage) => {
            setPagination(prev => ({
              ...prev,
              [fund]: { ...prev[fund], page: newPage }
            }));
          };
          const handleChangeRowsPerPage = (e) => {
            setPagination(prev => ({
              ...prev,
              [fund]: { page: 0, rowsPerPage: parseInt(e.target.value, 10) }
            }));
          };
          const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

          return (
            <Box className="bg-gray-900 text-white" key={fund} mb={6} maxWidth={960} width="100%">
              <Typography variant="subtitle1" fontWeight="bold" mb={1} className="text-white">
                Fund: {fund}
              </Typography>
              <TableContainer component={Paper} sx={{ backgroundColor: '#23272f' }}>
                <Table size="small" sx={{ '& td, & th': { color: '#fff' } }}>
                  <TableHead sx={{ backgroundColor: '#1a202c' }}>
                    <TableRow>
                      {Object.keys(rows[0]).map((col, i) => (
                        <TableCell key={i} className="text-white">{col}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedRows.map((row, i) => (
                      <TableRow key={i} hover sx={{ backgroundColor: i % 2 === 0 ? '#23272f' : '#1a202c' }}>
                        {Object.values(row).map((val, j) => (
                          <TableCell key={j} className="text-white">{val}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 20]}
                  component="div"
                  count={rows.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  sx={{ color: '#fff', backgroundColor: '#23272f' }}
                />
              </TableContainer>
            </Box>
          );
        })}
      </Box>
    );
  };

  export default KuveraTransactions;