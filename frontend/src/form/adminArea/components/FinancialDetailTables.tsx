import React from 'react';
import {
  alpha,
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { ConfirmationNumber, LocalDining, Paid, SportsBar } from '@mui/icons-material';
import AdminCard from './AdminCard';
import { adminPalette } from '../theme/adminPalette';
import type { ViewFilterType } from '../utils/optionsUtils';

type CategoryTotals = Record<string, { count: number; total: number; isArtist: boolean }>;

interface FinancialDetailTablesProps {
  ticketTotals: CategoryTotals;
  beverageTotals: CategoryTotals;
  foodTotals: CategoryTotals;
  grandTotal: number;
  viewType: ViewFilterType;
}

const FinancialDetailTables: React.FC<FinancialDetailTablesProps> = ({
  ticketTotals,
  beverageTotals,
  foodTotals,
  grandTotal,
  viewType,
}) => {
  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
        }}
      >
        <AdminCard sx={{ height: '100%' }} title="Ticket Sales" icon={<ConfirmationNumber />}>
          <Box sx={{ p: 2 }}>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(adminPalette.primary.main, 0.05) }}>
                    <TableCell>Ticket Type</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Total (EUR)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(ticketTotals).map(([key, { count, total, isArtist }]) => (
                    <TableRow
                      key={key}
                      sx={{
                        bgcolor: isArtist ? alpha(adminPalette.primary.main, 0.08) : 'transparent',
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {isArtist && (
                            <Chip label="A" color="primary" size="small" sx={{ mr: 1 }} />
                          )}
                          {key.split('-')[1]}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{count}</TableCell>
                      <TableCell align="right">{total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow
                    sx={{
                      '& td': {
                        fontWeight: 'bold',
                        bgcolor: alpha(adminPalette.text.primary, 0.04),
                      },
                    }}
                  >
                    <TableCell>Total Tickets</TableCell>
                    <TableCell align="right">
                      {Object.values(ticketTotals).reduce((sum, { count }) => sum + count, 0)}
                    </TableCell>
                    <TableCell align="right">
                      {Object.values(ticketTotals)
                        .reduce((sum, { total }) => sum + total, 0)
                        .toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </AdminCard>
        <AdminCard sx={{ height: '100%' }} title="Beverage Sales" icon={<SportsBar />}>
          <Box sx={{ p: 2 }}>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(adminPalette.primary.main, 0.05) }}>
                    <TableCell>Beverage Type</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Total (EUR)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(beverageTotals).map(([key, { count, total, isArtist }]) => (
                    <TableRow
                      key={key}
                      sx={{
                        bgcolor: isArtist ? alpha(adminPalette.primary.main, 0.08) : 'transparent',
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {isArtist && (
                            <Chip label="A" color="primary" size="small" sx={{ mr: 1 }} />
                          )}
                          {key.split('-')[1]}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{count}</TableCell>
                      <TableCell align="right">{total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow
                    sx={{
                      '& td': {
                        fontWeight: 'bold',
                        bgcolor: alpha(adminPalette.text.primary, 0.04),
                      },
                    }}
                  >
                    <TableCell>Total Beverages</TableCell>
                    <TableCell align="right">
                      {Object.values(beverageTotals).reduce((sum, { count }) => sum + count, 0)}
                    </TableCell>
                    <TableCell align="right">
                      {Object.values(beverageTotals)
                        .reduce((sum, { total }) => sum + total, 0)
                        .toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </AdminCard>
        <AdminCard sx={{ height: '100%' }} title="Food Sales" icon={<LocalDining />}>
          <Box sx={{ p: 2 }}>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(adminPalette.primary.main, 0.05) }}>
                    <TableCell>Food Type</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Total (EUR)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(foodTotals).map(([key, { count, total, isArtist }]) => (
                    <TableRow
                      key={key}
                      sx={{
                        bgcolor: isArtist ? alpha(adminPalette.primary.main, 0.08) : 'transparent',
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {isArtist && (
                            <Chip label="A" color="primary" size="small" sx={{ mr: 1 }} />
                          )}
                          {key.split('-')[1]}
                          <br />
                          {key.split('-')[2]}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{count}</TableCell>
                      <TableCell align="right">{total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow
                    sx={{
                      '& td': {
                        fontWeight: 'bold',
                        bgcolor: alpha(adminPalette.text.primary, 0.04),
                      },
                    }}
                  >
                    <TableCell>Total Food</TableCell>
                    <TableCell align="right">
                      {Object.values(foodTotals).reduce((sum, { count }) => sum + count, 0)}
                    </TableCell>
                    <TableCell align="right">
                      {Object.values(foodTotals)
                        .reduce((sum, { total }) => sum + total, 0)
                        .toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </AdminCard>
      </Box>
      <Paper
        sx={{
          mt: 3,
          p: 3,
          bgcolor: alpha(adminPalette.primary.main, 0.1),
          borderRadius: 2,
          border: `1px solid ${adminPalette.divider}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
          }}
        >
          <Typography variant="h5" color="primary.main" fontWeight="medium">
            Total Revenue: EUR{grandTotal.toFixed(2)}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" color="primary" startIcon={<Paid />}>
              {viewType === 'all' ? 'All' : viewType === 'regular' ? 'Regular' : 'Artist'} Payments
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default FinancialDetailTables;
