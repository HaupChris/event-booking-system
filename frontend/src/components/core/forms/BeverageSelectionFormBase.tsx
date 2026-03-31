import React from 'react';
import {
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Box,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import ThemedFormLayout from '../layouts/ThemedFormLayout';
import FormCard from '../display/FormCard';
import SelectionOptionWithImage from '../display/SelectionOptionWithImage';
import type { BeverageOption } from '../../../form/userArea/interface';
import { useThemeMode } from '../../styles/theme';

interface BeverageSelectionTextProps {
  missionBriefing: string;
  footerId: string;
  title: string;
  noBeverage: string;
}

interface BeverageSelectionFormBaseProps {
  currentBooking: {
    beverage_id: number;
  };
  updateBooking: (key: 'beverage_id', value: number) => void;
  formContent: {
    beverage_options: BeverageOption[];
  };
  texts: BeverageSelectionTextProps;
  getImageSource: (beverage_id: number) => string;
}

function BeverageSelectionFormBase(props: BeverageSelectionFormBaseProps) {
  const { texts, getImageSource } = props;
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isCircusMode = mode === 'circus';

  // Function to handle beverage selection
  const handleBeverageSelect = (id: number) => () => {
    props.updateBooking('beverage_id', id);
  };

  return (
    <ThemedFormLayout missionBriefing={texts.missionBriefing} footerId={texts.footerId}>
      <List sx={{ p: { xs: 1, sm: 2 } }}>
        <FormCard
          selected={props.currentBooking.beverage_id === -1}
          sx={
            isCircusMode
              ? {
                  border: '2px solid',
                  borderColor:
                    props.currentBooking.beverage_id === -1 ? '#d8b87a' : alpha('#cda163', 0.55),
                  backgroundColor: 'rgba(28, 12, 12, 0.78)',
                  borderRadius: '14px',
                }
              : undefined
          }
        >
          <ListItemButton
            onClick={handleBeverageSelect(-1)}
            sx={{
              py: 1.5,
              px: { xs: 2, sm: 3 },
              '&:hover': {
                backgroundColor: isCircusMode
                  ? alpha('#d8b87a', 0.12)
                  : alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <ListItemAvatar sx={{ minWidth: { xs: 42, sm: 46 } }}>
              <Box
                sx={
                  isCircusMode
                    ? {
                        width: { xs: 32, sm: 36 },
                        height: { xs: 32, sm: 36 },
                        borderRadius: '50%',
                        border: '2px solid',
                        borderColor: alpha('#dfbf84', 0.95),
                        background:
                          'radial-gradient(circle at 35% 30%, rgba(72,38,24,0.95) 0%, rgba(38,18,14,0.95) 100%)',
                        color: '#e6c586',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow:
                          '0 2px 6px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(244,205,142,0.35), inset 0 0 12px rgba(0,0,0,0.25)',
                        '& .MuiSvgIcon-root': {
                          fontSize: { xs: '1.08rem', sm: '1.16rem' },
                        },
                      }
                    : {}
                }
              >
                <LocalBarIcon
                  sx={{
                    color: isCircusMode ? '#e6c586' : alpha(theme.palette.text.primary, 0.7),
                    fontSize: '1.5rem',
                  }}
                />
              </Box>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography
                  variant="body1"
                  sx={{
                    color: isCircusMode ? '#f4ead6' : theme.palette.text.primary,
                    fontWeight: 'medium',
                    fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
                  }}
                >
                  {texts.noBeverage}
                </Typography>
              }
            />
          </ListItemButton>
        </FormCard>

        {props.formContent.beverage_options.map((option) => {
          const isSelected = props.currentBooking.beverage_id === option.id;

          return (
            <SelectionOptionWithImage
              key={option.id}
              selected={isSelected}
              onClick={handleBeverageSelect(option.id)}
              title={option.title}
              description={option.description}
              imageSource={getImageSource(option.id)}
              price={option.price}
            />
          );
        })}
      </List>
    </ThemedFormLayout>
  );
}

export default BeverageSelectionFormBase;
