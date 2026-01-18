import React from 'react';
import {
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import ThemedFormLayout from '../layouts/ThemedFormLayout';
import FormCard from '../display/FormCard';
import SelectionOptionWithImage from '../display/SelectionOptionWithImage';
import type { BeverageOption } from '../../../form/userArea/interface';

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
  updateBooking: (key: any, value: any) => void;
  formContent: {
    beverage_options: BeverageOption[];
  };
  texts: BeverageSelectionTextProps;
  getImageSource: (beverage_id: number) => string;
}

function BeverageSelectionFormBase(props: BeverageSelectionFormBaseProps) {
  const { texts, getImageSource } = props;
  const theme = useTheme();

  // Function to handle beverage selection
  const handleBeverageSelect = (id: number) => () => {
    props.updateBooking('beverage_id', id);
  };

  return (
    <ThemedFormLayout missionBriefing={texts.missionBriefing} footerId={texts.footerId}>
      <List sx={{ p: { xs: 1, sm: 2 } }}>
        <FormCard selected={props.currentBooking.beverage_id === -1}>
          <ListItemButton
            onClick={handleBeverageSelect(-1)}
            sx={{
              py: 1.5,
              px: { xs: 2, sm: 3 },
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <ListItemAvatar sx={{ minWidth: { xs: 36, sm: 40 } }}>
              <LocalBarIcon
                sx={{
                  color: alpha(theme.palette.text.primary, 0.7),
                  fontSize: '1.5rem',
                }}
              />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.text.primary,
                    fontWeight: 'medium',
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
