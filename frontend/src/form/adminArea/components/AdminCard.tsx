import type { ReactNode } from 'react';
import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Divider,
  Tooltip,
  IconButton,
  ClickAwayListener,
  useTheme,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import type { SxProps, Theme } from '@mui/material/styles';

interface AdminCardProps {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  description?: string;
  footer?: ReactNode;
  selected?: boolean;
  elevation?: number;
  sx?: SxProps<Theme>;
  tooltipText?: string;
  tooltipPlacement?:
    | 'top'
    | 'right'
    | 'bottom'
    | 'left'
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end';
}

const AdminCard: React.FC<AdminCardProps> = ({
  title,
  icon,
  children,
  description,
  footer,
  selected = false,
  elevation = 0,
  sx,
  tooltipText,
  tooltipPlacement = 'top',
}) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const theme = useTheme();

  return (
    <Paper
      elevation={elevation}
      sx={{
        borderRadius: 2,
        border: selected ? `2px solid ${theme.palette.primary.main}` : undefined,
        overflow: 'hidden',
        mt: 2,
        ...sx,
      }}
    >
      {(title || icon) && (
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, pb: description ? 1 : 2 }}>
          {icon && (
            <Box sx={{ mr: 1.5, color: theme.palette.primary.main, display: 'flex' }}>{icon}</Box>
          )}
          {title && (
            <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
              {title}
            </Typography>
          )}
          {tooltipText && (
            <ClickAwayListener onClickAway={() => setTooltipOpen(false)}>
              <div>
                <Tooltip
                  title={tooltipText}
                  placement={tooltipPlacement}
                  arrow
                  open={tooltipOpen}
                  onClose={() => setTooltipOpen(false)}
                  disableFocusListener
                  disableHoverListener
                  disableTouchListener
                >
                  <IconButton
                    onClick={() => setTooltipOpen(true)}
                    size="small"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </div>
            </ClickAwayListener>
          )}
        </Box>
      )}

      {description && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ pl: icon ? 5 : 0 }}>
            {description}
          </Typography>
        </Box>
      )}

      <Box sx={{ px: 2, py: 2 }}>{children}</Box>

      {footer && (
        <>
          <Divider />
          <Box sx={{ p: 2, bgcolor: theme.palette.background.default }}>{footer}</Box>
        </>
      )}
    </Paper>
  );
};

export default AdminCard;
