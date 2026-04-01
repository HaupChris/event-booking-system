import React from 'react';
import {
  Box,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
  alpha,
  Chip,
  useTheme,
} from '@mui/material';
import ThemedFormLayout from '../layouts/ThemedFormLayout';
import FormCard from '../display/FormCard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { Material } from '../../../form/userArea/interface';
import CircularProgressWithLabel from '../feedback/CircularProgressWithLabel';
import { useThemeMode } from '../../styles/theme';
import MissionHeading from '../display/MissionHeading';

interface MaterialsTextProps {
  missionBriefing: string;
  footerId: string;
  title: string;
  materialsTitle: string;
  bringingItems: (count: number) => string;
}

interface MaterialsFormBaseProps<TMaterialsField extends string = 'material_ids'> {
  currentBooking: { [K in TMaterialsField]: number[] };
  updateBooking: (key: TMaterialsField, value: number[]) => void;
  formContent: {
    materials?: Material[];
  };
  texts: MaterialsTextProps;
  materialsPropName?: TMaterialsField;
}

function MaterialsFormBase<TMaterialsField extends string = 'material_ids'>(
  props: MaterialsFormBaseProps<TMaterialsField>
) {
  const { texts } = props;
  const materialsPropName = (props.materialsPropName ?? 'material_ids') as TMaterialsField;
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isCircusMode = mode === 'circus';
  const selectedMaterialIds =
    (props.currentBooking[materialsPropName] as number[] | undefined) ?? [];

  function handleToggle(material_id: number) {
    if (!selectedMaterialIds.includes(material_id)) {
      props.updateBooking(materialsPropName, [...selectedMaterialIds, material_id]);
    } else {
      props.updateBooking(
        materialsPropName,
        selectedMaterialIds.filter((id) => id !== material_id)
      );
    }
  }

  // Get materials array from appropriate prop in formContent
  const materials = props.formContent.materials || [];

  const circusSurfaceBg = 'rgba(26, 11, 18, 0.58)';
  const circusInnerBg = 'rgba(26, 11, 18, 0.72)';

  const sectionCardSx = isCircusMode
    ? {
        border: '2px solid',
        borderColor: alpha('#d8b87a', 0.9),
        backgroundColor: `${circusSurfaceBg} !important`,
        backgroundImage: 'none !important',
        borderRadius: '14px',
        boxShadow: '0 10px 24px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(244,205,142,0.2)',
      }
    : { border: 'none' };

  return (
    <ThemedFormLayout missionBriefing={texts.missionBriefing} footerId={texts.footerId}>
      <FormCard elevation={2} sx={sectionCardSx}>
        <MissionHeading title={texts.materialsTitle} withDivider={true} />

        {selectedMaterialIds.length > 0 && (
          <Box
            sx={{
              mb: 2.2,
              p: 1.4,
              border: '1px solid',
              borderColor: isCircusMode
                ? alpha('#d8b87a', 0.55)
                : alpha(theme.palette.primary.main, 0.35),
              borderRadius: isCircusMode ? '12px' : '8px',
              backgroundColor: isCircusMode
                ? circusInnerBg
                : alpha(theme.palette.background.default, 0.35),
            }}
          >
            <Typography
              sx={{
                mb: 1,
                color: isCircusMode ? '#f0ddb7' : theme.palette.text.primary,
                fontFamily: isCircusMode ? '"Rye", serif' : undefined,
                fontSize: isCircusMode ? '1.15rem' : '1rem',
              }}
            >
              {texts.bringingItems(selectedMaterialIds.length)}
            </Typography>

            <Box>
              {materials
                .filter((material) => selectedMaterialIds.includes(material.id))
                .map((material) => (
                  <Chip
                    key={material.id}
                    label={material.title}
                    color="primary"
                    size="small"
                    icon={<CheckCircleIcon />}
                    sx={{
                      fontWeight: 'medium',
                      bgcolor: isCircusMode
                        ? alpha('#d8b87a', 0.18)
                        : alpha(theme.palette.primary.main, 0.2),
                      color: isCircusMode ? '#f4ead6' : theme.palette.text.primary,
                      '& .MuiChip-label': { px: 1 },
                      margin: 0.5,
                      border: isCircusMode ? '1px solid' : 'none',
                      borderColor: isCircusMode ? alpha('#d8b87a', 0.5) : undefined,
                    }}
                    onDelete={() => handleToggle(material.id)}
                  />
                ))}
            </Box>
          </Box>
        )}

        {/* Materials List */}
        <List dense className={'material-list'}>
          {materials
            .filter(
              (material) =>
                material.num_needed > material.num_booked ||
                selectedMaterialIds.includes(material.id)
            )
            .sort((a, b) => b.num_needed - b.num_booked - (a.num_needed - a.num_booked))
            .map((material: Material) => {
              const labelId = `checkbox-list-secondary-label-${material.id}`;
              const isSelected = selectedMaterialIds.includes(material.id);
              const num_booked = material.num_booked + (isSelected ? 1 : 0);

              return (
                <Paper
                  elevation={2}
                  key={material.id}
                  sx={{
                    mb: 2,
                    backgroundColor: isCircusMode
                      ? circusInnerBg
                      : alpha(theme.palette.background.paper, 0.7),
                    borderRadius: isCircusMode ? '14px' : '8px',
                    border: isSelected ? '2px solid' : '1px solid',
                    borderColor: isSelected
                      ? isCircusMode
                        ? '#d8b87a'
                        : theme.palette.primary.main
                      : isCircusMode
                        ? alpha('#cda163', 0.55)
                        : alpha(theme.palette.primary.main, 0.3),
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: isCircusMode
                      ? isSelected
                        ? '0 0 12px rgba(216,184,122,0.22), 0 8px 18px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(244,205,142,0.12)'
                        : '0 8px 18px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(244,205,142,0.12)'
                      : isSelected
                        ? `0 0 12px ${alpha(theme.palette.primary.main, 0.3)}`
                        : 'none',
                  }}
                >
                  {/* Futuristic scanner line animation for selected option */}
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
                          background: isCircusMode
                            ? 'linear-gradient(to right, transparent, rgba(216,184,122,0.9), transparent)'
                            : `linear-gradient(to right, transparent, ${theme.palette.primary.main}, transparent)`,
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
                      position: 'relative',
                      zIndex: 2,
                    }}
                  >
                    <ListItemButton
                      onClick={() => handleToggle(material.id)}
                      sx={{
                        py: 1.5,
                        px: { xs: 2, sm: 2.5 },
                        '&:hover': {
                          backgroundColor: isCircusMode
                            ? alpha('#d8b87a', 0.12)
                            : alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      {/* Progress Circle */}
                      <Box sx={{ paddingRight: '1em' }}>
                        <CircularProgressWithLabel
                          valueCurrent={num_booked}
                          valueMax={material.num_needed}
                        />
                      </Box>
                      <ListItemText
                        id={labelId}
                        primary={
                          <Typography
                            variant={'subtitle1'}
                            sx={{
                              color: isCircusMode ? '#f4ead6' : theme.palette.text.primary,
                              fontWeight: isSelected ? 'medium' : 'normal',
                              fontFamily: isCircusMode ? '"Merriweather", serif' : undefined,
                            }}
                          >
                            {material.title}
                          </Typography>
                        }
                      />
                      <Checkbox
                        edge="end"
                        onChange={() => handleToggle(material.id)}
                        checked={isSelected}
                        inputProps={{ 'aria-labelledby': labelId }}
                        sx={{
                          color: isCircusMode
                            ? alpha('#d8b87a', 0.75)
                            : alpha(theme.palette.primary.main, 0.7),
                          '&.Mui-checked': {
                            color: isCircusMode ? '#d8b87a' : theme.palette.primary.main,
                          },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                </Paper>
              );
            })}
        </List>
      </FormCard>
    </ThemedFormLayout>
  );
}

export default MaterialsFormBase;
