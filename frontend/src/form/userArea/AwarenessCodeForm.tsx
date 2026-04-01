import React from 'react';
import {
  Box,
  Typography,
  alpha,
  List,
  ListItem,
  Avatar,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import PngIcon from '../../components/core/display/PngIcon';
import Awareness from '../../assets/icons/awareness.png';
import Consent from '../../assets/icons/consent.png';
import Fotos from '../../assets/icons/fotos.png';
import NoRacism from '../../assets/icons/no-racism.png';
import Partiality from '../../assets/icons/partiality.png';
import { Balance } from '@mui/icons-material';
import FormCard from '../../components/core/display/FormCard';
import ThemedFormLayout from '../../components/core/layouts/ThemedFormLayout';
import { userAreaTexts } from '../constants/texts';
import { useThemeMode } from '../../components/styles/theme';

function AwarenessCodeForm() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const { mode } = useThemeMode();
  const isCircusMode = mode === 'circus';
  const icons = [
    <PngIcon icon={Awareness} fontSize={isXs ? 50 : 62} />,
    <PngIcon icon={NoRacism} fontSize={isXs ? 50 : 62} />,
    <PngIcon icon={Consent} fontSize={isXs ? 50 : 62} />,
    <PngIcon icon={Partiality} fontSize={isXs ? 50 : 62} />,
    <PngIcon icon={Fotos} fontSize={isXs ? 50 : 62} />,
    <Balance color={isCircusMode ? undefined : 'secondary'} fontSize={isXs ? 'medium' : 'large'} />,
  ];

  return (
    <ThemedFormLayout
      missionBriefing={userAreaTexts.awarenessCodeForm.missionBriefing}
      footerId={userAreaTexts.awarenessCodeForm.footerId}
    >
      {/* Code Rules List */}
      <List sx={{ width: '100%' }}>
        {userAreaTexts.awarenessCodeForm.codeRules.map((item, index) => (
          <FormCard
            key={item.title}
            sx={{
              mt: 2,
              pl: 0,
              pr: 2,
              ...(isCircusMode && {
                border: '2px solid',
                borderColor: alpha('#d8b87a', 0.8),
                backgroundColor: alpha('#1a0b12', 0.58),
                borderRadius: '14px',
                boxShadow: '0 10px 24px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(244,205,142,0.2)',
              }),
            }}
          >
            {/* Circuit background decoration */}
            {!isCircusMode && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '150px',
                  height: '150px',
                  opacity: 0.03,
                  zIndex: 0,
                  backgroundImage: `
                       radial-gradient(circle, ${theme.palette.primary.main} 1px, transparent 1px),
                       linear-gradient(to right, transparent 4px, ${theme.palette.primary.main} 1px, transparent 1px),
                       linear-gradient(to bottom, transparent 4px, ${theme.palette.primary.main} 1px, transparent 1px)
                     `,
                  backgroundSize: '20px 20px, 10px 10px, 10px 10px',
                  backgroundPosition: '0 0, 10px 0, 0 10px',
                  transform: 'rotate(15deg)',
                }}
              />
            )}

            <ListItem
              sx={{
                position: 'relative',
                zIndex: 1,
              }}
            >
              <ListItemText
                disableTypography
                sx={{ ml: 2 }}
                primary={
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{
                      color: isCircusMode ? '#f0ddb7' : theme.palette.primary.main,
                      fontWeight: 'medium',
                      mb: 1,
                      fontFamily: isCircusMode ? '"Rye", serif' : undefined,
                    }}
                  >
                    {item.title}
                  </Typography>
                }
                secondary={
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      flexDirection: 'row',
                      gap: 1,
                    }}
                  >
                    {/* Modified ListItemAvatar */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: { xs: 80, sm: 120 },
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: isCircusMode
                            ? 'radial-gradient(circle at 35% 30%, rgba(72,38,24,0.95) 0%, rgba(38,18,14,0.95) 100%)'
                            : alpha(theme.palette.primary.main, 0.1),
                          border: isCircusMode ? '2px solid' : '1px solid',
                          borderColor: isCircusMode
                            ? alpha('#dfbf84', 0.95)
                            : alpha(theme.palette.primary.main, 0.5),
                          boxShadow: isCircusMode
                            ? '0 2px 6px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(244,205,142,0.35), inset 0 0 12px rgba(0,0,0,0.25)'
                            : `0 0 10px ${alpha(theme.palette.primary.main, 0.2)}`,
                          width: { xs: 70, sm: 100 },
                          height: { xs: 70, sm: 100 },
                          color: isCircusMode ? '#e6c586' : undefined,
                        }}
                      >
                        {icons[index]}
                      </Avatar>
                    </Box>

                    <Typography
                      variant="body2"
                      component="div"
                      sx={{
                        color: isCircusMode
                          ? alpha('#f4ead6', 0.9)
                          : alpha(theme.palette.text.primary, 0.8),
                        lineHeight: 1.6,
                        flex: 1,
                        fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
                      }}
                    >
                      {item.text}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          </FormCard>
        ))}
      </List>
    </ThemedFormLayout>
  );
}

export default AwarenessCodeForm;
