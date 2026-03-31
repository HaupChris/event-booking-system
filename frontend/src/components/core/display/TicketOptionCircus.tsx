import React from 'react';
import { alpha, Box, FormControlLabel, Paper, Radio, Typography } from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import SignalWifiStatusbarConnectedNoInternet4Icon from '@mui/icons-material/SignalWifiStatusbarConnectedNoInternet4';
import type { TicketOptionComponentProps } from './TicketOption';

const TicketOptionCircus: React.FC<TicketOptionComponentProps> = (props) => {
  const { remaining = 0, isLowStock = false } = props;
  const isSelected = props.currentBooking.ticket_id === props.option.id;

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 2,
        backgroundColor: 'rgba(28, 12, 12, 0.78)',
        borderRadius: '14px',
        border: '2px solid',
        borderColor: isSelected ? '#d8b87a' : alpha('#cda163', 0.55),
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        boxShadow: isSelected
          ? '0 0 14px rgba(216, 184, 122, 0.2), inset 0 0 0 1px rgba(244,205,142,0.2)'
          : 'none',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: props.soldOut ? '#f44336' : '#d8b87a',
          boxShadow: `0 0 6px ${props.soldOut ? '#f44336' : '#d8b87a'}`,
          zIndex: 10,
        }}
      />

      {isSelected && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            zIndex: 1,
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              width: '100%',
              height: '2px',
              background:
                'linear-gradient(to right, transparent, rgba(216,184,122,0.9), transparent)',
              top: 0,
              animation: 'scanDown 2s infinite',
            },
            '@keyframes scanDown': {
              '0%': { transform: 'translateY(0)' },
              '100%': { transform: 'translateY(100%)' },
            },
          }}
        />
      )}

      <FormControlLabel
        sx={{
          p: 0,
          m: 0,
          width: '100%',
          height: '100%',
          '& .MuiFormControlLabel-label': {
            width: '100%',
            opacity: props.soldOut ? 0.6 : 1,
          },
        }}
        disabled={props.soldOut}
        value={props.option.id}
        control={
          <Radio
            sx={{
              position: 'absolute',
              top: { xs: 12, sm: 14 },
              left: { xs: 8, sm: 12 },
              color: alpha('#d8b87a', 0.8),
              '&.Mui-checked': {
                color: '#d8b87a',
              },
              zIndex: 2,
            }}
          />
        }
        label={
          <Box
            sx={{
              pt: 2.2,
              pb: 1.8,
              px: { xs: 1.5, sm: 2 },
              pl: { xs: 5, sm: 6 },
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  gap: { xs: 1, sm: 0 },
                }}
              >
                <Box
                  sx={{ display: 'flex', alignItems: 'center', width: { xs: '100%', sm: 'auto' } }}
                >
                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      border: '2px solid #dfbf84',
                      background:
                        'radial-gradient(circle at 35% 30%, rgba(72,38,24,0.95) 0%, rgba(38,18,14,0.95) 100%)',
                      color: '#e6c586',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      ml: 1,
                      mr: 1,
                      flexShrink: 0,
                      '& .MuiSvgIcon-root': {
                        fontSize: '0.92rem',
                      },
                    }}
                  >
                    <FlightTakeoffIcon />
                  </Box>

                  <Typography
                    variant="body1"
                    sx={{
                      color: '#f4ead6',
                      fontWeight: 'medium',
                      fontFamily: '"Merriweather", serif',
                      fontSize: { xs: '0.95rem', sm: '1rem' },
                    }}
                  >
                    {props.option.title}
                  </Typography>
                </Box>

                {props.soldOut ? (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      bgcolor: alpha('#f44336', 0.18),
                      p: 0.5,
                      px: 1,
                      borderRadius: '4px',
                      border: '1px solid',
                      borderColor: alpha('#f44336', 0.35),
                      flexShrink: 0,
                      ml: 'auto',
                    }}
                  >
                    <SignalWifiStatusbarConnectedNoInternet4Icon
                      sx={{
                        fontSize: '0.8rem',
                        mr: 0.5,
                        color: '#f44336',
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#f44336',
                        fontWeight: 'medium',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontSize: '0.7rem',
                      }}
                    >
                      Ausgebucht
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      bgcolor: 'rgba(74, 41, 24, 0.62)',
                      p: 0.5,
                      px: 1.5,
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: alpha('#d8b87a', 0.5),
                      flexShrink: 0,
                      ml: 'auto',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#e8d2ab',
                        fontWeight: 'bold',
                        fontFamily: '"Rye", serif',
                        fontSize: { xs: '1.05rem', sm: '1.2rem' },
                      }}
                    >
                      {props.option.price}€
                    </Typography>
                  </Box>
                )}
              </Box>

              {isLowStock && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mt: 1,
                    pt: 1,
                    borderTop: '1px solid',
                    borderColor: alpha('#d8b87a', 0.22),
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      bgcolor: alpha('#d8b87a', 0.14),
                      p: 0.5,
                      px: 1,
                      borderRadius: '4px',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#f4d79e',
                        fontWeight: 'medium',
                        fontFamily: '"Merriweather", serif',
                        fontSize: '0.7rem',
                      }}
                    >
                      Noch {remaining} verfuegbar
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        }
      />
    </Paper>
  );
};

export default TicketOptionCircus;
