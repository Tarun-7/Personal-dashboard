import React, { useState, useEffect, useRef } from 'react';

import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  TableSortLabel,
} from '@mui/material';

import { BarChart3 } from 'lucide-react';

const FINNHUB_API_KEY = '';

const sortFunctions = {
  invested: (a, b) => a.totalAmount - b.totalAmount,
  marketValue: (a, b) => a.totalMarketValue - b.totalMarketValue,
  ibkrFees: (a, b) => a.totalIbCommission - b.totalIbCommission,
  realizedGains: (a, b) => a.realizedGains - b.realizedGains,
  unrealizedGains: (a, b) => a.unrealizedGains - b.unrealizedGains,
};

const IbkrTransactions = ({ transactions = [] }) => {
  const [pagination, setPagination] = useState({});
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortBy, setSortBy] = useState('invested');
  const [priceMap, setPriceMap] = useState({});
  const fetchedSymbolsRef = useRef(new Set());

  // Filter out CASH asset class
  const filteredTransactions = transactions.filter(
    (txn) => txn['AssetClass']?.toUpperCase() !== 'CASH'
  );

  // Fetch latest prices from Finnhub API
  useEffect(() => {
    const uniqueSymbols = [
      ...new Set(filteredTransactions.map((txn) => txn.Symbol).filter(Boolean)),
    ];

    if (uniqueSymbols.length === 0) return;

    const newSymbols = uniqueSymbols.filter(
      (symbol) => !fetchedSymbolsRef.current.has(symbol)
    );

    if (newSymbols.length === 0) return;

    const fetchPrices = async () => {
      for (const symbol of newSymbols) {
        try {
          const res = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(
              symbol
            )}&token=${FINNHUB_API_KEY}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data && typeof data.c === 'number' && data.c > 0) {
              setPriceMap((prev) => ({ ...prev, [symbol]: data.c }));
            } else {
              setPriceMap((prev) => ({ ...prev, [symbol]: 0 }));
            }
          } else {
            setPriceMap((prev) => ({ ...prev, [symbol]: 0 }));
          }
        } catch (error) {
          console.error(`Error fetching price for ${symbol}:`, error);
          setPriceMap((prev) => ({ ...prev, [symbol]: 0 }));
        } finally {
          fetchedSymbolsRef.current.add(symbol);
          await new Promise((r) => setTimeout(r, 100)); // Rate limit delay
        }
      }
    };

    fetchPrices();
  }, [filteredTransactions.length]);

  if (!filteredTransactions.length) {
    return (
      <Box className="flex flex-col items-center justify-center h-96">
        <Paper className="bg-gray-800 p-8 rounded-lg text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <Typography variant="h6" gutterBottom>
            No IBKR transactions found. Please upload an IBKR CSV file.
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Group transactions by symbol
  const grouped = filteredTransactions.reduce((acc, txn) => {
    const symbol = txn.Symbol || 'Unknown Symbol';
    if (!acc[symbol]) acc[symbol] = [];
    acc[symbol].push(txn);
    return acc;
  }, {});

  // Create summary rows
  const summaryRows = Object.entries(grouped).map(([symbol, items]) => {
    let totalQuantity = 0;
    let totalAmount = 0;
    let totalIbCommission = 0;
    let realizedGains = 0;

    items.forEach((txn) => {
      let qty = parseFloat(txn.Quantity);
      if (isNaN(qty)) qty = 0;

      let tradeMoney = parseFloat(txn.TradeMoney);
      if (isNaN(tradeMoney)) tradeMoney = 0;

      const ibCommission = parseFloat(txn.IBCommission) || 0;

      totalQuantity += qty;
      totalAmount += tradeMoney;
      totalIbCommission += ibCommission;
      realizedGains += parseFloat(txn.FifoPnlRealized) || 0;
    });

    const marketPrice = priceMap[symbol] || 0;
    const totalMarketValue = marketPrice * totalQuantity;

    // Unrealized Gains = Market Value - Fees - Invested Amount
    const unrealizedGains = totalMarketValue - totalIbCommission - totalAmount;

    const description = items[0]?.Description || 'No Description';

    return {
      symbol,
      description,
      totalQuantity,
      totalAmount,
      totalMarketValue,
      totalIbCommission,
      realizedGains,
      unrealizedGains,
    };
  });

  // Calculate totals for numeric columns except quantity
  const totals = summaryRows.reduce(
    (acc, row) => {
      acc.totalAmount += row.totalAmount;
      acc.totalMarketValue += row.totalMarketValue;
      acc.totalIbCommission += row.totalIbCommission;
      acc.realizedGains += row.realizedGains;
      acc.unrealizedGains += row.unrealizedGains;
      return acc;
    },
    {
      totalAmount: 0,
      totalMarketValue: 0,
      totalIbCommission: 0,
      realizedGains: 0,
      unrealizedGains: 0,
    }
  );

  // Sort summary rows by selected column and order
  const sortedSummaryRows = summaryRows.sort((a, b) => {
    const fn = sortFunctions[sortBy];
    if (!fn) return 0;
    const res = fn(a, b);
    return sortOrder === 'asc' ? res : -res;
  });

  // Sorting handler
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  return (
    <Box
      className="bg-gray-900 text-white min-h-screen"
      display="flex"
      flexDirection="column"
      alignItems="center"
      width="100%"
      p={2}
    >
      <Typography variant="h5" mb={2}>
        Transactions Summary by Symbol (USD, Finnhub prices)
      </Typography>

      <TableContainer
        component={Paper}
        sx={{ mb: 4, maxWidth: 960, backgroundColor: '#23272f' }}
      >
        <Table sx={{ '& td, & th': { color: '#fff' } }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#1a202c' }}>
              <TableCell style={{ color: '#fff' }}><strong>Symbol</strong></TableCell>
              <TableCell style={{ color: '#fff' }}><strong>Description</strong></TableCell>
              <TableCell style={{ color: '#fff' }} align="right"><strong>Quantity</strong></TableCell>

              <TableCell style={{ color: '#fff' }} align="right" sortDirection={sortBy === 'invested' ? sortOrder : false}>
                <TableSortLabel
                  active={sortBy === 'invested'}
                  direction={sortBy === 'invested' ? sortOrder : 'asc'}
                  onClick={() => handleSort('invested')}
                  sx={{ color: '#fff' }}
                >
                  Invested $
                </TableSortLabel>
              </TableCell>

              <TableCell style={{ color: '#fff' }} align="right" sortDirection={sortBy === 'marketValue' ? sortOrder : false}>
                <TableSortLabel
                  active={sortBy === 'marketValue'}
                  direction={sortBy === 'marketValue' ? sortOrder : 'asc'}
                  onClick={() => handleSort('marketValue')}
                  sx={{ color: '#fff' }}
                >
                  Market Value $
                </TableSortLabel>
              </TableCell>

              <TableCell style={{ color: '#fff' }} align="right" sortDirection={sortBy === 'ibkrFees' ? sortOrder : false}>
                <TableSortLabel
                  active={sortBy === 'ibkrFees'}
                  direction={sortBy === 'ibkrFees' ? sortOrder : 'asc'}
                  onClick={() => handleSort('ibkrFees')}
                  sx={{ color: '#fff' }}
                >
                  IBKR Fees $
                </TableSortLabel>
              </TableCell>

              <TableCell style={{ color: '#fff' }} align="right" sortDirection={sortBy === 'realizedGains' ? sortOrder : false}>
                <TableSortLabel
                  active={sortBy === 'realizedGains'}
                  direction={sortBy === 'realizedGains' ? sortOrder : 'asc'}
                  onClick={() => handleSort('realizedGains')}
                  sx={{ color: '#fff' }}
                >
                  Realized Gains $
                </TableSortLabel>
              </TableCell>

              <TableCell style={{ color: '#fff' }} align="right" sortDirection={sortBy === 'unrealizedGains' ? sortOrder : false}>
                <TableSortLabel
                  active={sortBy === 'unrealizedGains'}
                  direction={sortBy === 'unrealizedGains' ? sortOrder : 'asc'}
                  onClick={() => handleSort('unrealizedGains')}
                  sx={{ color: '#fff' }}
                >
                  Unrealized Gains $
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedSummaryRows.map((row, idx) => (
              <TableRow
                key={row.symbol}
                sx={{ backgroundColor: idx % 2 === 0 ? '#23272f' : '#1a202c', color: '#fff' }}
              >
                <TableCell sx={{ color: '#fff' }}>{row.symbol}</TableCell>
                <TableCell sx={{ color: '#fff' }}>{row.description}</TableCell>
                <TableCell sx={{ color: '#fff' }} align="right">{row.totalQuantity.toFixed(4)}</TableCell>
                <TableCell sx={{ color: '#fff' }} align="right">${row.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                <TableCell sx={{ color: '#fff' }} align="right">${row.totalMarketValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                <TableCell sx={{ color: '#fff' }} align="right">${Math.abs(row.totalIbCommission).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                <TableCell sx={{ color: '#fff' }} align="right">${row.realizedGains.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                <TableCell sx={{ color: '#fff' }} align="right">${row.unrealizedGains.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              </TableRow>
            ))}

            {/* Totals row */}
            <TableRow sx={{ backgroundColor: '#1a202c', fontWeight: 'bold', color: '#fff' }}>
              <TableCell colSpan={2}>Totals</TableCell>
              <TableCell align="right">-</TableCell>
              <TableCell align="right">${totals.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell align="right">${totals.totalMarketValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell align="right">${Math.abs(totals.totalIbCommission).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell align="right">${totals.realizedGains.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell align="right">${totals.unrealizedGains.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" mb={2}>
        Transactions Details by Symbol
      </Typography>

      {Object.entries(grouped).map(([symbol, items]) => {
        const page = pagination[symbol]?.page || 0;
        const rowsPerPage = pagination[symbol]?.rowsPerPage || 5;

        const handleChangePage = (_, newPage) =>
          setPagination((prev) => ({
            ...prev,
            [symbol]: { ...prev[symbol], page: newPage },
          }));

        const handleChangeRowsPerPage = (e) =>
          setPagination((prev) => ({
            ...prev,
            [symbol]: { page: 0, rowsPerPage: parseInt(e.target.value, 10) },
          }));

        const paginatedRows = items.slice(
          page * rowsPerPage,
          page * rowsPerPage + rowsPerPage
        );

        return (
          <Box key={symbol} mb={6} maxWidth={960} width="100%">
            <Typography variant="subtitle1" fontWeight="bold" mb={1} sx={{ color: '#fff' }}>
              Symbol: {symbol}
            </Typography>
            <TableContainer component={Paper} sx={{ backgroundColor: '#23272f' }}>
              <Table size="small" sx={{ '& td, & th': { color: '#fff' } }}>
                <TableHead sx={{ backgroundColor: '#1a202c' }}>
                  <TableRow>
                    {Object.keys(items[0]).map((col, i) => (
                      <TableCell key={i} sx={{ color: '#fff' }}>{col}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRows.map((row, i) => (
                    <TableRow
                      key={i}
                      hover
                      sx={{ backgroundColor: i % 2 === 0 ? '#23272f' : '#1a202c', color: '#fff' }}
                    >
                      {Object.values(row).map((val, j) => (
                        <TableCell key={j} sx={{ color: '#fff' }}>{val}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 20]}
                component="div"
                count={items.length}
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

export default IbkrTransactions;
