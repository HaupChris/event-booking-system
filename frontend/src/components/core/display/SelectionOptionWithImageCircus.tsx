import React from 'react';
import { alpha, Avatar, Box, ListItem, ListItemButton, Typography } from '@mui/material';
import SpaIcon from '@mui/icons-material/Spa';
import { Park } from '@mui/icons-material';
import FormCard from './FormCard';
import type { SelectionOptionWithImageProps } from './SelectionOptionWithImage';
import portholeImage from '../../../img/rocket_porthole.png';

function SelectionOptionWithImageCircus(props: SelectionOptionWithImageProps) {
  const isVegetarian =
    props.description.toLowerCase().includes('vegetarisch') ||
    props.title.toLowerCase().includes('vegetarisch');
  const isVegan =
    props.description.toLowerCase().includes('vegan') ||
    props.title.toLowerCase().includes('vegan');
  const descriptionText = props.description.split('//')[0];

  return (
    <FormCard
      selected={props.selected}
      sx={{
        marginTop: 3,
        border: '2px solid',
        borderColor: props.selected ? '#d8b87a' : alpha('#cda163', 0.55),
        borderRadius: '14px',
        backgroundColor: 'rgba(28, 12, 12, 0.78)',
      }}
    >
      {props.selected && (
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

      <ListItem disablePadding sx={{ width: '100%', position: 'relative' }}>
        <ListItemButton
          onClick={props.onClick}
          sx={{
            p: { xs: 1.6, sm: 2.2 },
            width: '100%',
            position: 'relative',
            zIndex: 2,
            '&:hover': {
              backgroundColor: alpha('#d8b87a', 0.12),
            },
          }}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: { xs: 1.25, sm: 2 },
            }}
          >
            <Box sx={{ position: 'relative', ml: { xs: 0.6, sm: 0 }, flexShrink: 0 }}>
              <Avatar
                alt={props.title}
                src={props.imageSource}
                variant="rounded"
                sx={{
                  width: { xs: 78, sm: 86 },
                  height: { xs: 78, sm: 86 },
                  border: '2px solid',
                  borderColor: alpha('#d8b87a', 0.55),
                  borderRadius: '12px',
                  objectFit: 'cover',
                  boxShadow: '0 5px 14px rgba(0,0,0,0.35)',
                }}
              />
              <img
                src={portholeImage}
                alt="curtain-overlay"
                style={{
                  position: 'absolute',
                  top: -12,
                  left: -12,
                  width: 98,
                  height: 98,
                  zIndex: 1,
                  pointerEvents: 'none',
                }}
              />
            </Box>

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 1,
                  mb: 0.35,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: '#f4ead6',
                    fontWeight: 'medium',
                    fontFamily: '"Merriweather", serif',
                    fontSize: { xs: '0.95rem', sm: '1.1rem' },
                    lineHeight: 1.2,
                  }}
                >
                  {props.title}
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: 'rgba(74, 41, 24, 0.62)',
                    p: 0.4,
                    px: 1.1,
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: alpha('#d8b87a', 0.5),
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#e8d2ab',
                      fontWeight: 'bold',
                      fontFamily: '"Rye", serif',
                      fontSize: { xs: '0.98rem', sm: '1.2rem' },
                      lineHeight: 1,
                    }}
                  >
                    {props.price}€
                  </Typography>
                </Box>
              </Box>

              <Typography
                variant="body2"
                sx={{
                  color: alpha('#e5cf9f', 0.9),
                  fontFamily: '"Merriweather", serif',
                  fontSize: { xs: '0.84rem', sm: '0.94rem' },
                }}
              >
                {descriptionText}
              </Typography>

              {(isVegan || isVegetarian) && (
                <Box
                  sx={{
                    mt: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    p: 0.4,
                    px: 1.1,
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: alpha('#d8b87a', 0.45),
                    bgcolor: 'rgba(74, 41, 24, 0.62)',
                    color: '#e8d2ab',
                  }}
                >
                  {isVegan ? (
                    <Park sx={{ fontSize: '1rem' }} />
                  ) : (
                    <SpaIcon sx={{ fontSize: '1rem' }} />
                  )}
                  <Typography
                    sx={{
                      fontFamily: '"Merriweather", serif',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                    }}
                  >
                    {isVegan ? 'vegan' : 'vegetarisch'}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </ListItemButton>
      </ListItem>
    </FormCard>
  );
}

export default SelectionOptionWithImageCircus;
