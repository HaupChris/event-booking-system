import React from 'react';
import { Box, Button, Card, CardContent, IconButton, Tab, Tabs, Typography } from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import type {
  AdminOptionItem,
  AdminOptionScope,
  AdminOptionType,
} from '../../../services/adminOptionService';
import { getAdminTitle, getFrontendTitle } from '../utils/titleUtils';

interface OptionCrudListProps {
  optionType: AdminOptionType;
  scope: AdminOptionScope;
  options: AdminOptionItem[];
  loading: boolean;
  onScopeChange: (scope: AdminOptionScope) => void;
  onAddOption: () => void;
  onEditOption: (option: AdminOptionItem) => void;
  onDeleteOption: (optionId: number) => void;
}

const OPTION_LABEL_MAP: Record<AdminOptionType, string> = {
  ticket: 'Ticket',
  beverage: 'Beverage',
  food: 'Food',
};

const OptionCrudList: React.FC<OptionCrudListProps> = ({
  optionType,
  scope,
  options,
  loading,
  onScopeChange,
  onAddOption,
  onEditOption,
  onDeleteOption,
}) => {
  const optionLabel = OPTION_LABEL_MAP[optionType];
  const showDescription = optionType === 'beverage' || optionType === 'food';
  const showAmount = optionType === 'ticket';

  return (
    <Box sx={{ mt: 1 }}>
      <Tabs
        value={scope}
        onChange={(_, value) => onScopeChange(value as AdminOptionScope)}
        sx={{ mb: 2 }}
      >
        <Tab value="regular" label="Regular" />
        <Tab value="artist" label="Artist" />
      </Tabs>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="h6">{optionLabel} Setup</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={onAddOption}>
          Add {optionLabel}
        </Button>
      </Box>

      {!loading && options.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No {optionLabel.toLowerCase()} options configured yet.
        </Typography>
      )}

      {options.map((option) => (
        <Card key={option.id} variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 1,
              }}
            >
              <Box>
                <Typography variant="h6">{getAdminTitle(option)}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Frontend titel: {getFrontendTitle(option)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Preis: €{Number(option.price || 0).toFixed(2)}
                </Typography>
                {showAmount && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Verfuegbare Anzahl: {option.amount ?? 0}
                  </Typography>
                )}
              </Box>
              <Box>
                <IconButton size="small" onClick={() => onEditOption(option)}>
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => onDeleteOption(option.id)}>
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {showDescription && (
              <Typography variant="body2" color="text.secondary">
                {option.description || 'No description'}
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default OptionCrudList;
