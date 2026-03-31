import React from 'react';
import { alpha, Avatar, Box, ListItem, ListItemButton, Typography, useTheme } from '@mui/material';
import SpaIcon from '@mui/icons-material/Spa';
import { Park } from '@mui/icons-material';
import portholeImage from '../../../img/rocket_porthole.png';
import FormCard from './FormCard';
import type { SelectionOptionWithImageProps } from './SelectionOptionWithImage';

function SelectionOptionWithImageDefault(props: SelectionOptionWithImageProps) {
  const theme = useTheme();

  const isVegetarian =
    props.description.toLowerCase().includes('vegetarisch') ||
    props.title.toLowerCase().includes('vegetarisch');
  const isVegan =
    props.description.toLowerCase().includes('vegan') ||
    props.title.toLowerCase().includes('vegan');
  const descriptionText = props.description.split('//')[0];

  const DietBadge = () => {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          color: isVegan ? 'white' : 'info',
          p: 0.5,
          px: 1.5,
          borderRadius: '4px',
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.3),
          ml: 2,
        }}
      >
        <Typography
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 'bold',
            fontSize: '1.25rem',
          }}
        >
          {isVegan ? (
            <>
              <Park /> vegan
            </>
          ) : (
            <>
              <SpaIcon /> vegetarisch
            </>
          )}
        </Typography>
      </Box>
    );
  };

  return (
    <FormCard selected={props.selected} sx={{ marginTop: 3 }}>
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
              background: `linear-gradient(to right, transparent, ${theme.palette.primary.main}, transparent)`,
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

      <ListItem
        disablePadding
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          position: 'relative',
        }}
      >
        <ListItemButton
          onClick={props.onClick}
          sx={{
            p: { xs: 2, sm: 3 },
            width: '100%',
            position: 'relative',
            zIndex: 2,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <Box
            sx={{
              width: '100%',
              display: { xs: 'flex', sm: 'none' },
              flexDirection: 'column',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.primary,
                fontWeight: 'medium',
                mb: 1.5,
              }}
            >
              {props.title}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                width: '100%',
              }}
            >
              <Box sx={{ position: 'relative', ml: 2, mr: 5, mt: 2 }}>
                <Avatar
                  alt={props.title}
                  src={props.imageSource}
                  variant="rounded"
                  sx={{
                    width: 100,
                    height: 100,
                    border: '2px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                  }}
                />
                <img
                  src={portholeImage}
                  alt="porthole"
                  style={{
                    position: 'absolute',
                    top: -25,
                    left: -25,
                    width: 150,
                    height: 150,
                    zIndex: 1,
                  }}
                />
              </Box>

              <Typography
                variant="body2"
                sx={{
                  color: alpha(theme.palette.text.primary, 0.7),
                  flexGrow: 1,
                }}
              >
                {descriptionText}
              </Typography>
            </Box>

            <Box
              sx={{
                alignSelf: 'flex-end',
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                justifyContent: 'end',
              }}
            >
              <Box
                sx={{
                  alignSelf: 'flex-end',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  mb: 2,
                  p: 0.5,
                  px: 1.5,
                  borderRadius: '4px',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                  }}
                >
                  {props.price}€
                </Typography>
              </Box>

              {isVegan || isVegetarian ? <DietBadge /> : ''}
            </Box>
          </Box>

          <Box
            sx={{
              width: '100%',
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
            }}
          >
            <Box sx={{ position: 'relative', mr: 3 }}>
              <Avatar
                alt={props.title}
                src={props.imageSource}
                variant="rounded"
                sx={{
                  width: 80,
                  height: 80,
                  border: '2px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  objectFit: 'cover',
                }}
              />
              <img
                src={portholeImage}
                alt="porthole"
                style={{
                  position: 'absolute',
                  top: -12,
                  left: -12,
                  width: 104,
                  height: 104,
                  zIndex: 1,
                }}
              />
            </Box>

            <Box sx={{ flexGrow: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.primary,
                  fontWeight: 'medium',
                  mb: 0.5,
                }}
              >
                {props.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: alpha(theme.palette.text.primary, 0.7),
                }}
              >
                {props.description}
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                p: 0.5,
                px: 1.5,
                borderRadius: '4px',
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.3),
                ml: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 'bold',
                  fontSize: '1.25rem',
                }}
              >
                {props.price}€
              </Typography>
            </Box>
          </Box>
        </ListItemButton>
      </ListItem>
    </FormCard>
  );
}

export default SelectionOptionWithImageDefault;
