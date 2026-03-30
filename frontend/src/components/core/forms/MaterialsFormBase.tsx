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
import InventoryIcon from '@mui/icons-material/Inventory';
import BackpackIcon from '@mui/icons-material/Backpack';
import ThemedFormLayout from '../layouts/ThemedFormLayout';
import FormCard from '../display/FormCard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { Material } from '../../../form/userArea/interface';
import CircularProgressWithLabel from '../feedback/CircularProgressWithLabel';

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
  const selectedMaterialIds = (props.currentBooking[materialsPropName] as number[] | undefined) ?? [];

  function handleToggle(material_id: number) {
    if (!selectedMaterialIds.includes(material_id)) {
      props.updateBooking(materialsPropName, [
        ...selectedMaterialIds,
        material_id,
      ]);
    } else {
      props.updateBooking(
        materialsPropName,
        selectedMaterialIds.filter((id) => id !== material_id)
      );
    }
  }

  // Get materials array from appropriate prop in formContent
  const materials = props.formContent.materials || [];

  return (
    <ThemedFormLayout missionBriefing={texts.missionBriefing} footerId={texts.footerId}>
      <FormCard
        elevation={2}
        sx={{ border: 'None' }}
        title={texts.materialsTitle}
        icon={<BackpackIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: '1.5rem' }} />}
      >
        {selectedMaterialIds.length > 0 && (
          <FormCard
            selected={true}
            icon={
              <InventoryIcon sx={{ color: theme.palette.primary.main, fontSize: '1.2rem', mr: 1 }} />
            }
            title={texts.bringingItems(selectedMaterialIds.length)}
          >
            <Box sx={{ paddingX: 2 }}>
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
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                      '& .MuiChip-label': { px: 1 },
                      margin: 0.5,
                    }}
                    onDelete={() => handleToggle(material.id)}
                  />
                ))}
            </Box>
          </FormCard>
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
                    backgroundColor: alpha(theme.palette.background.paper, 0.7),
                    borderRadius: '8px',
                    border: isSelected ? '2px solid' : '1px solid',
                    borderColor: isSelected
                      ? theme.palette.primary.main
                      : alpha(theme.palette.primary.main, 0.3),
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: isSelected
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
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
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
                              color: theme.palette.text.primary,
                              fontWeight: isSelected ? 'medium' : 'normal',
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
                          color: alpha(theme.palette.primary.main, 0.7),
                          '&.Mui-checked': {
                            color: theme.palette.primary.main,
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
