/**
 * Clean, responsive presentation for options (tickets, beverages, food).
 * Shows a table on desktop and compact cards on mobile.
 */

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Typography,
  Box,
  alpha,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import { VisibilityOutlined as ViewIcon } from '@mui/icons-material';
import type { CombinedBooking } from '../interface';
import { getUsersForOption } from '../utils/optionsUtils';
import { spacePalette } from '../../../components/styles/theme';
import OptionItemModal from './OptionItemModal';
import { useModal } from '../../../hooks/useModal';

interface OptionsTableProps {
  options: {
    id: number;
    title: string;
    price?: number;
    description?: string;
    count: number;
    isArtist: boolean;
  }[];
  bookings: CombinedBooking[];
  optionType: 'ticket' | 'beverage' | 'food' | 'professions';
  showPrice?: boolean;
  showDescription?: boolean;
}

const OptionsTable: React.FC<OptionsTableProps> = ({
  options,
  bookings,
  optionType,
  showPrice = true,
  showDescription = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { selectedItem, isOpen, open, close } = useModal<(typeof options)[0]>();

  const getSelectedUsers = () => {
    if (!selectedItem) return [];
    return getUsersForOption(bookings, selectedItem.id, optionType);
  };

  // Group options by type (regular/artist)
  const regularOptions = options.filter((o) => !o.isArtist);
  const artistOptions = options.filter((o) => o.isArtist);

  // Mobile card view
  const renderMobileCards = (sectionOptions: typeof options, sectionTitle: string) => {
    if (sectionOptions.length === 0) return null;

    return (
      <Box key={sectionTitle} sx={{ mb: 3 }}>
        <Typography
          variant="subtitle2"
          sx={{
            bgcolor: alpha(spacePalette.primary.main, 0.08),
            px: 2,
            py: 1,
            borderRadius: 1,
            fontWeight: 'bold',
            mb: 2,
          }}
        >
          {sectionTitle}
        </Typography>
        <Stack spacing={1.5}>
          {sectionOptions.map((option) => (
            <Card
              key={option.id}
              variant="outlined"
              sx={{
                '&:hover': {
                  bgcolor: alpha(spacePalette.primary.main, 0.02),
                },
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 1,
                  }}
                >
                  <Typography variant="body1" fontWeight="medium" sx={{ flex: 1 }}>
                    {option.title}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => open(option)}
                    sx={{
                      color: spacePalette.primary.main,
                      ml: 1,
                    }}
                  >
                    <ViewIcon fontSize="small" />
                  </IconButton>
                </Box>

                {showDescription && option.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {option.description}
                  </Typography>
                )}

                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Chip
                    label={`${option.count} selected`}
                    size="small"
                    sx={{
                      bgcolor: alpha(spacePalette.primary.main, 0.15),
                      color: spacePalette.primary.main,
                      fontWeight: 'bold',
                    }}
                  />
                  {showPrice && option.price !== undefined && (
                    <Typography variant="body1" fontWeight="medium">
                      €{option.price.toFixed(2)}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    );
  };

  const renderTableSection = (sectionOptions: typeof options, sectionTitle: string) => {
    if (sectionOptions.length === 0) return null;

    return (
      <>
        <TableRow>
          <TableCell
            colSpan={showDescription ? 5 : 4}
            sx={{
              bgcolor: alpha(spacePalette.primary.main, 0.08),
              fontWeight: 'bold',
              fontSize: '0.9rem',
              py: 1,
            }}
          >
            {sectionTitle}
          </TableCell>
        </TableRow>
        {sectionOptions.map((option) => (
          <TableRow
            key={option.id}
            hover
            sx={{
              '&:hover': {
                bgcolor: alpha(spacePalette.primary.main, 0.02),
              },
            }}
          >
            <TableCell>
              <Typography variant="body1" fontWeight="medium">
                {option.title}
              </Typography>
            </TableCell>

            {showDescription && (
              <TableCell sx={{ maxWidth: 300 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {option.description || '-'}
                </Typography>
              </TableCell>
            )}

            <TableCell align="center">
              <Chip
                label={option.count}
                size="small"
                sx={{
                  bgcolor: alpha(spacePalette.primary.main, 0.15),
                  color: spacePalette.primary.main,
                  fontWeight: 'bold',
                  minWidth: 45,
                }}
              />
            </TableCell>

            {showPrice && (
              <TableCell align="right">
                {option.price !== undefined ? (
                  <Typography variant="body1" fontWeight="medium">
                    €{option.price.toFixed(2)}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    -
                  </Typography>
                )}
              </TableCell>
            )}

            <TableCell align="center">
              <IconButton
                size="small"
                onClick={() => open(option)}
                sx={{
                  color: spacePalette.primary.main,
                  '&:hover': {
                    bgcolor: alpha(spacePalette.primary.main, 0.1),
                  },
                }}
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </>
    );
  };

  return (
    <>
      {isMobile ? (
        // Mobile card view
        <Box>
          {regularOptions.length > 0 && renderMobileCards(regularOptions, 'Regular Participants')}
          {artistOptions.length > 0 && renderMobileCards(artistOptions, 'Artists')}
        </Box>
      ) : (
        // Desktop table view
        <TableContainer component={Paper} elevation={0} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Option</TableCell>
                {showDescription && <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>}
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Count
                </TableCell>
                {showPrice && (
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    Price
                  </TableCell>
                )}
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Details
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {regularOptions.length > 0 &&
                renderTableSection(regularOptions, 'Regular Participants')}
              {artistOptions.length > 0 && renderTableSection(artistOptions, 'Artists')}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {selectedItem && (
        <OptionItemModal
          open={isOpen}
          onClose={close}
          title={selectedItem.title}
          description={selectedItem.description}
          price={selectedItem.price}
          users={getSelectedUsers()}
          isArtist={selectedItem.isArtist}
          isMobile={isMobile}
        />
      )}
    </>
  );
};

export default OptionsTable;
