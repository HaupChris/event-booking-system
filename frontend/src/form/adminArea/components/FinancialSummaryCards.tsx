import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import {
  ConfirmationNumber,
  LocalDining,
  MusicNote,
  Paid,
  People,
  Person,
  SportsBar,
} from '@mui/icons-material';
import StatsCard from './StatsCard';

type CategoryTotals = Record<string, { count: number; total: number; isArtist: boolean }>;

interface FinancialSummaryCardsProps {
  ticketTotals: CategoryTotals;
  beverageTotals: CategoryTotals;
  foodTotals: CategoryTotals;
  paidAmount: number;
  expectedAmount: number;
  paidCount: number;
  artistCount: number;
  regularCount: number;
  allCount: number;
  grandTotal: number;
}

const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({
  ticketTotals,
  beverageTotals,
  foodTotals,
  paidAmount,
  expectedAmount,
  paidCount,
  artistCount,
  regularCount,
  allCount,
  grandTotal,
}) => {
  const paymentProgress = expectedAmount > 0 ? (paidAmount / expectedAmount) * 100 : 0;
  const paidParticipantsProgress = allCount > 0 ? (paidCount / allCount) * 100 : 0;

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Revenue"
          value={`EUR${grandTotal.toFixed(2)}`}
          subtitle={`Expected: EUR${expectedAmount.toFixed(2)}`}
          color="primary"
          icon={<Paid fontSize="large" />}
          progress={paymentProgress}
          footer={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <Typography variant="body2">Received:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                EUR{paidAmount.toFixed(2)}
              </Typography>
            </Box>
          }
          fullHeight
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Participants"
          value={allCount}
          color="success"
          icon={<People fontSize="large" />}
          progress={paidParticipantsProgress}
          footer={
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ mr: 0.5, fontSize: '1rem' }} />
                  <Typography variant="body2">Regular</Typography>
                </Box>
                <Typography variant="body2">{regularCount}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MusicNote sx={{ mr: 0.5, fontSize: '1rem' }} />
                  <Typography variant="body2">Artists</Typography>
                </Box>
                <Typography variant="body2">{artistCount}</Typography>
              </Box>
            </Box>
          }
          fullHeight
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Tickets"
          value={Object.values(ticketTotals).reduce((sum, { count }) => sum + count, 0)}
          subtitle={`EUR${Object.values(ticketTotals)
            .reduce((sum, { total }) => sum + total, 0)
            .toFixed(2)}`}
          color="warning"
          icon={<ConfirmationNumber fontSize="large" />}
          footer={
            <Box>
              {Object.entries(ticketTotals)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 2)
                .map(([key, { count, isArtist }]) => (
                  <Box
                    key={key}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mt: 0.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {isArtist && <MusicNote sx={{ mr: 0.5, fontSize: '0.875rem' }} />}
                      <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                        {key.split('-')[1]}
                      </Typography>
                    </Box>
                    <Typography variant="body2">{count}</Typography>
                  </Box>
                ))}
              {Object.keys(ticketTotals).length > 2 && (
                <Typography variant="body2" sx={{ mt: 0.5, textAlign: 'center' }}>
                  +{Object.keys(ticketTotals).length - 2} more
                </Typography>
              )}
            </Box>
          }
          fullHeight
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Food & Beverages"
          value={`EUR${(
            Object.values(beverageTotals).reduce((sum, { total }) => sum + total, 0) +
            Object.values(foodTotals).reduce((sum, { total }) => sum + total, 0)
          ).toFixed(2)}`}
          color="info"
          icon={
            <Box sx={{ display: 'flex' }}>
              <LocalDining fontSize="large" sx={{ mr: 1 }} />
              <SportsBar fontSize="large" />
            </Box>
          }
          footer={
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2">Beverages:</Typography>
                <Typography variant="body2">
                  EUR{Object.values(beverageTotals)
                    .reduce((sum, { total }) => sum + total, 0)
                    .toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Food:</Typography>
                <Typography variant="body2">
                  EUR{Object.values(foodTotals)
                    .reduce((sum, { total }) => sum + total, 0)
                    .toFixed(2)}
                </Typography>
              </Box>
            </Box>
          }
          fullHeight
        />
      </Grid>
    </Grid>
  );
};

export default FinancialSummaryCards;
