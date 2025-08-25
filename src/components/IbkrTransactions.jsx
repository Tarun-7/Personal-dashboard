import React, { useState, useEffect, useRef, useMemo } from 'react';
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

const CACHE_KEY = 'ibkr_price_map';
const CACHE_TIMESTAMP_KEY = 'ibkr_price_map_timestamp';
const CACHE_EXPIRY_MS = 3600000; // 1 hour

const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;

// Debug environment variables
console.log('Environment variables check:');
console.log('FINNHUB_API_KEY:', FINNHUB_API_KEY ? 'Loaded ✓' : 'Missing ✗');
console.log('ALPHA_VANTAGE_API_KEY:', ALPHA_VANTAGE_API_KEY ? 'Loaded ✓' : 'Missing ✗');
console.log('All env vars:', import.meta.env);

const sortFunctions = {
  invested: (a, b) => a.totalAmount - b.totalAmount,
  marketValue: (a, b) => a.totalMarketValue - b.totalMarketValue,
  ibkrFees: (a, b) => a.totalIbCommission - b.totalIbCommission,
  realizedGains: (a, b) => a.realizedGains - b.realizedGains,
  unrealizedGains: (a, b) => a.unrealizedGains - b.unrealizedGains,
};

const IbkrTransactions = ({ transactions = [], onTotalMarketValueChange }) => {
  const [pagination, setPagination] = useState({});
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortBy, setSortBy] = useState('invested');
  const [priceMap, setPriceMap] = useState({});
  const fetchedSymbolsRef = useRef(new Set());
  const prevTotalMarketValue = useRef(null);

  // Filter out CASH asset class, memoized
  const filteredTransactions = useMemo(
    () => transactions.filter(txn => txn['AssetClass']?.toUpperCase() !== 'CASH'),
    [transactions]
  );

  // Get unique symbols, memoized
  const uniqueSymbols = useMemo(
    () => [...new Set(filteredTransactions.map(txn => txn.Symbol).filter(Boolean))],
    [filteredTransactions]
  );

  // Fetch prices effect with caching
  useEffect(() => {
    const cachedPrices = localStorage.getItem(CACHE_KEY);
    const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    const now = Date.now();

    if (cachedPrices && cachedTimestamp && now - Number(cachedTimestamp) < CACHE_EXPIRY_MS) {
      const parsedPrices = JSON.parse(cachedPrices);
      setPriceMap(parsedPrices);
      fetchedSymbolsRef.current = new Set(Object.keys(parsedPrices));
      return;
    }

    const newSymbols = uniqueSymbols.filter(sym => !fetchedSymbolsRef.current.has(sym));
    if (newSymbols.length === 0) return;

    const fetchPrices = async () => {
      let newPrices = {};
      for (const symbol of newSymbols) {
        try {
          const isLSEETF = filteredTransactions.some(
            txn => txn.Symbol === symbol && txn.ListingExchange === "LSEETF"
          );
          let price = 0;
          console.log(`Fetching price for ${symbol}, isLSEETF: ${isLSEETF}`);

          if (isLSEETF) {
            // Append '.LON' only if symbol is exactly 'VUAA'
            const symbolForApi = symbol === 'VUAA' ? `${symbol}.LON` : symbol;

            const apiRes = await fetch(
                `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbolForApi)}&apikey=${ALPHA_VANTAGE_API_KEY}`
            );
            const apiData = await apiRes.json();
            price = Number(apiData?.['Global Quote']?.['05. price']) || 0;
          } else {
            const apiRes = await fetch(
              `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(
                symbol
              )}&token=${FINNHUB_API_KEY}`
            );
            if (apiRes.ok) {
              const apiData = await apiRes.json();
              console.log(`Finnhub response for ${symbol}:`, apiData);
              price = Number(apiData?.c) || 0;
            } else {
              console.log(`Finnhub API error for ${symbol}:`, apiRes.status, apiRes.statusText);
            }
          }

          console.log(`Final price for ${symbol}: ${price}`);
          newPrices[symbol] = price;
          fetchedSymbolsRef.current.add(symbol);
          await new Promise(r => setTimeout(r, 150)); // API rate limits
        } catch (error) {
          console.log(`Error fetching price for ${symbol}:`, error);
          newPrices[symbol] = 0;
          fetchedSymbolsRef.current.add(symbol);
        }
      }
      setPriceMap(prev => {
        const updated = { ...prev, ...newPrices };
        return updated;
      });
    };

    fetchPrices();
  }, [uniqueSymbols, filteredTransactions]);

  // Cache priceMap to localStorage whenever it updates
  useEffect(() => {
    if (Object.keys(priceMap).length > 0) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(priceMap));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    }
  }, [priceMap]);

  // Group transactions by symbol
  const grouped = filteredTransactions.reduce((acc, txn) => {
    const symbol = txn.Symbol || 'Unknown Symbol';
    if (!acc[symbol]) acc[symbol] = [];
    acc[symbol].push(txn);
    return acc;
  }, {});

  // Summary rows memoized
  const summaryRows = useMemo(() => {
    console.log('Calculating summary rows with priceMap:', priceMap);
    return Object.entries(grouped).map(([symbol, items]) => {
      let totalQuantity = 0;
      let totalAmount = 0;
      let totalIbCommission = 0;
      let realizedGains = 0;

      items.forEach(txn => {
        const qty = parseFloat(txn.Quantity) || 0;
        const tradeMoney = parseFloat(txn.TradeMoney) || 0;
        const ibCommission = parseFloat(txn.IBCommission) || 0;
        const fifoPnlRealized = parseFloat(txn.FifoPnlRealized) || 0;

        totalQuantity += qty;
        totalAmount += tradeMoney;
        totalIbCommission += ibCommission;
        realizedGains += fifoPnlRealized;
      });

      const marketPrice = priceMap[symbol] || 0;
      const totalMarketValue = marketPrice * totalQuantity;
      console.log(`Market calculation for ${symbol}:`, {
        marketPrice,
        totalQuantity,
        totalMarketValue,
      });

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
  }, [grouped, priceMap]);

  // Calculate totals memoized
  const totals = useMemo(() => {
    return summaryRows.reduce(
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
  }, [summaryRows]);

  // Effect to notify parent on total market value change, only if it changed
  useEffect(() => {
    if (
      onTotalMarketValueChange &&
      totals.totalMarketValue !== prevTotalMarketValue.current
    ) {
      onTotalMarketValueChange(totals.totalMarketValue);
      prevTotalMarketValue.current = totals.totalMarketValue;
    }
  }, [totals.totalMarketValue, onTotalMarketValueChange]);

  // Sort summary rows memoized
  const sortedSummaryRows = useMemo(() => {
    const fn = sortFunctions[sortBy];
    if (!fn) return summaryRows;
    return [...summaryRows].sort((a, b) => {
      const result = fn(a, b);
      return sortOrder === 'asc' ? result : -result;
    });
  }, [summaryRows, sortBy, sortOrder]);

  // Sorting handler
  const handleSort = column => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  if (!filteredTransactions.length) {
    return (
      <Box className="flex flex-col items-center justify-center min-h-[300px]">
        <Paper className="bg-gray-800 p-8 rounded-lg text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <Typography variant="h6" gutterBottom>
            No IBKR transactions found. Please upload an IBKR CSV file.
          </Typography>
        </Paper>
      </Box>
    );
  }

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
        Transactions Summary by Symbol (USD, Finnhub & Alpha Vantage prices)
      </Typography>

      <TableContainer
        component={Paper}
        sx={{ mb: 4, maxWidth: 960, backgroundColor: '#23272f' }}
      >
        <Table sx={{ '& td, & th': { color: '#fff' } }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#1a202c' }}>
              <TableCell>
                <strong>Symbol</strong>
              </TableCell>
              <TableCell>
                <strong>Description</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Quantity</strong>
              </TableCell>
              <TableCell
                align="right"
                sortDirection={sortBy === 'invested' ? sortOrder : false}
              >
                <TableSortLabel
                  active={sortBy === 'invested'}
                  direction={sortBy === 'invested' ? sortOrder : 'asc'}
                  onClick={() => handleSort('invested')}
                  sx={{
                    color: '#fff',
                    '&:hover': { color: '#fff' },
                    '& .MuiTableSortLabel-icon': { color: '#fff !important' },
                  }}
                >
                  Invested $
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="right"
                sortDirection={sortBy === 'marketValue' ? sortOrder : false}
              >
                <TableSortLabel
                  active={sortBy === 'marketValue'}
                  direction={sortBy === 'marketValue' ? sortOrder : 'asc'}
                  onClick={() => handleSort('marketValue')}
                  sx={{
                    color: '#fff',
                    '&:hover': { color: '#fff' },
                    '& .MuiTableSortLabel-icon': { color: '#fff !important' },
                  }}
                >
                  Market Value $
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="right"
                sortDirection={sortBy === 'ibkrFees' ? sortOrder : false}
              >
                <TableSortLabel
                  active={sortBy === 'ibkrFees'}
                  direction={sortBy === 'ibkrFees' ? sortOrder : 'asc'}
                  onClick={() => handleSort('ibkrFees')}
                  sx={{
                    color: '#fff',
                    '&:hover': { color: '#fff' },
                    '& .MuiTableSortLabel-icon': { color: '#fff !important' },
                  }}
                >
                  IBKR Fees $
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="right"
                sortDirection={sortBy === 'realizedGains' ? sortOrder : false}
              >
                <TableSortLabel
                  active={sortBy === 'realizedGains'}
                  direction={sortBy === 'realizedGains' ? sortOrder : 'asc'}
                  onClick={() => handleSort('realizedGains')}
                  sx={{
                    color: '#fff',
                    '&:hover': { color: '#fff' },
                    '& .MuiTableSortLabel-icon': { color: '#fff !important' },
                  }}
                >
                  Realized Gains $
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="right"
                sortDirection={sortBy === 'unrealizedGains' ? sortOrder : false}
              >
                <TableSortLabel
                  active={sortBy === 'unrealizedGains'}
                  direction={sortBy === 'unrealizedGains' ? sortOrder : 'asc'}
                  onClick={() => handleSort('unrealizedGains')}
                  sx={{
                    color: '#fff',
                    '&:hover': { color: '#fff' },
                    '& .MuiTableSortLabel-icon': { color: '#fff !important' },
                  }}
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
                <TableCell>{row.symbol}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell align="right">{row.totalQuantity.toFixed(4)}</TableCell>
                <TableCell align="right">
                  ${row.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell align="right">
                  ${row.totalMarketValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell align="right">
                  ${Math.abs(row.totalIbCommission).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell align="right">
                  ${row.realizedGains.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell align="right">
                  ${row.unrealizedGains.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ backgroundColor: '#1a202c', fontWeight: 'bold', color: '#fff' }}>
              <TableCell colSpan={3}>Totals</TableCell>
              <TableCell align="right">
                ${totals.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell align="right">
                ${totals.totalMarketValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell align="right">
                ${Math.abs(totals.totalIbCommission).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell align="right">
                ${totals.realizedGains.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell align="right">
                ${totals.unrealizedGains.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
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
