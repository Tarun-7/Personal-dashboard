import React, { useState, useEffect } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@mui/material';
import { BarChart3 } from 'lucide-react';

const CACHE_KEY_MARKET_VALUES = 'kuveraMarketValues';
const CACHE_KEY_MARKET_VALUES_TIMESTAMP = 'kuveraMarketValuesTimestamp';
const CACHE_EXPIRY_MS = 60 * 60 * 1000;

const KuveraTransactions = ({ transactions = [], onTotalMarketValue }) => {
  
  const [pagination, setPagination] = useState({});
  const [sortDirection, setSortDirection] = useState('desc');
  const [sortBy, setSortBy] = useState('totalAmount');
  const [marketValues, setMarketValues] = useState({});
  const [fundCodes, setFundCodes] = useState({});

useEffect(() => {
  // Fetch fund codes once on mount
  const fetchFundCodes = async () => {
    try {
      const response = await fetch('/data/KuveraCode.json');
      if (!response.ok) throw new Error(`Network error: ${response.statusText}`);
      const data = await response.json();
      setFundCodes(data);
      console.log('Fund codes loaded:', data);
    } catch (error) {
      console.error('Error fetching fund codes:', error);
    }
  };
  fetchFundCodes();
}, []);

useEffect(() => {
  if (!fundCodes || Object.keys(fundCodes).length === 0) return;

  const cachedValues = localStorage.getItem(CACHE_KEY_MARKET_VALUES);
  const cachedTimestamp = localStorage.getItem(CACHE_KEY_MARKET_VALUES_TIMESTAMP);
  const now = Date.now();
  const isCacheValid =
    cachedValues &&
    cachedTimestamp &&
    now - parseInt(cachedTimestamp, 10) < CACHE_EXPIRY_MS;

  if (isCacheValid) {
    setMarketValues(JSON.parse(cachedValues));
    console.log('Using cached market values');
    if (onTotalMarketValue) {
      const totalValue = Object.values(JSON.parse(cachedValues)).reduce(
        (acc, val) => acc + parseFloat(val || 0),
        0
      );
      onTotalMarketValue(totalValue);
    }
    return;
  }

  const fetchMarketValues = async () => {
    const values = {};
    for (const [fund, code] of Object.entries(fundCodes)) {
      try {
        const response = await fetch(`https://api.mfapi.in/mf/${code}/latest`);
        if (response.ok) {
          const data = await response.json();
          const nav = data?.data?.[0]?.nav;
          if (nav) {
            values[fund] = parseFloat(nav);
            console.log(`Fetched NAV for ${fund} (${code}):`, nav);
          }
        } else {
          console.error(`Failed to fetch NAV for ${fund} (${code}):`, response.status);
        }
      } catch (error) {
        console.error(`Error fetching NAV for ${fund} (${code}):`, error);
      }
    }
    setMarketValues(values);
    localStorage.setItem(CACHE_KEY_MARKET_VALUES, JSON.stringify(values));
    localStorage.setItem(CACHE_KEY_MARKET_VALUES_TIMESTAMP, now.toString());

    if (onTotalMarketValue) {
      const totalValue = Object.values(values).reduce(
        (acc, val) => acc + parseFloat(val || 0),
        0
      );
      onTotalMarketValue(totalValue);
    }
  };

  fetchMarketValues();
}, [fundCodes, onTotalMarketValue]);

    
  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="bg-gray-800 p-8 rounded-lg text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Transactions - Kuvera</h2>
          <p className="text-gray-400">Kuvera transactions are currently unavailable. Please upload a Kuvera transactions CSV file to view here.</p>
        </div>
      </div>
    );
  }

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