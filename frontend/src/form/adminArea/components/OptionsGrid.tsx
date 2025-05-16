import React, { useState } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, IconButton,
  Chip, useMediaQuery, useTheme, alpha
} from '@mui/material';
import { MoreHoriz as MoreHorizIcon, People as PeopleIcon } from '@mui/icons-material';
import { CombinedBooking } from "../interface";
import { OptionItem, getUsersForOption } from "../utils/optionsUtils";
import { spacePalette } from '../../../components/styles/theme';
import OptionItemModal from './OptionItemModal';

interface OptionsGridProps {
  options: {
    id: number;
    title: string;
    price?: number;
    description?: string;
    count: number;
    isArtist: boolean;
  }[];
  bookings: CombinedBooking[];
  optionType: 'ticket' | 'beverage' | 'food';
  icon?: React.ReactNode;
}

const OptionsGrid: React.FC<OptionsGridProps> = ({
  options,
  bookings,
  optionType,
  icon
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedOption, setSelectedOption] = useState<typeof options[0] | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = (option: typeof options[0]) => {
    setSelectedOption(option);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const getSelectedUsers = () => {
    if (!selectedOption) return [];
    return getUsersForOption(bookings, selectedOption.id, optionType);
  };

  return (
    <>
      <Grid container spacing={3}>
        {options.map((option) => (
          <Grid item xs={12} sm={6} md={4} key={`${option.isArtist ? 'artist' : 'regular'}-${option.id}`}>
            <Card
              elevation={2}
              sx={{
                bgcolor: option.isArtist
                  ? alpha(spacePalette.primary.main, 0.08)
                  : 'transparent',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                },
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <CardContent sx={{
                p: 2,
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 1
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {icon && (
                      <Box sx={{ mr: 1, color: spacePalette.primary.main }}>
                        {icon}
                      </Box>
                    )}
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{
                        fontWeight: 'medium',
                        fontSize: { xs: '1rem', sm: '1.25rem' }
                      }}
                    >
                      {option.title}
                      {option.isArtist && (
                        <Chip
                          label="Artist"
                          color="primary"
                          size="small"
                          sx={{ ml: 1, verticalAlign: 'middle' }}
                        />
                      )}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenModal(option)}
                    sx={{
                      color: spacePalette.primary.main,
                      '&:hover': {
                        backgroundColor: alpha(spacePalette.primary.main, 0.1)
                      }
                    }}
                  >
                    <MoreHorizIcon />
                  </IconButton>
                </Box>

                {option.description && !isMobile && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {option.description}
                  </Typography>
                )}

                <Box sx={{
                  mt: 'auto',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <PeopleIcon
                      sx={{
                        mr: 1,
                        color: spacePalette.primary.main,
                        fontSize: '1.2rem'
                      }}
                    />
                    <Typography
                      variant="h5"
                      component="div"
                      sx={{
                        fontWeight: 'bold',
                        color: spacePalette.primary.main
                      }}
                    >
                      {option.count}
                    </Typography>
                  </Box>

                  {option.price !== undefined && (
                    <Chip
                      label={`€${option.price.toFixed(2)}`}
                      variant="outlined"
                      size="small"
                      sx={{
                        borderColor: alpha(spacePalette.primary.main, 0.5),
                        backgroundColor: alpha(spacePalette.primary.main, 0.1),
                        color: spacePalette.primary.main,
                        fontWeight: 'medium'
                      }}
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedOption && (
        <OptionItemModal
          open={openModal}
          onClose={handleCloseModal}
          title={selectedOption.title}
          description={selectedOption.description}
          price={selectedOption.price}
          users={getSelectedUsers()}
          isArtist={selectedOption.isArtist}
          isMobile={isMobile}
        />
      )}
    </>
  );
};

export default OptionsGrid;