// src/form/adminArea/components/ProgressList.tsx

import React, { useState } from 'react';
import {
  List, ListItemButton, ListItemText, Collapse,
  Typography, Box, LinearProgress, Badge,
  IconButton, alpha
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  MoreHoriz as MoreHorizIcon
} from '@mui/icons-material';
import { spacePalette } from '../../../components/styles/theme';

export interface ProgressItem {
  id: number | string;
  title: string;
  description?: string;
  currentCount: number;
  totalNeeded: number;
  children?: React.ReactNode;
  badgeContent?: number;
  badgeIcon?: React.ReactNode;
}

interface ProgressListProps {
  items: ProgressItem[];
  onItemDetails?: (item: ProgressItem) => void;
  sortOrder?: 'asc' | 'desc';
  subtitle?: (item: ProgressItem) => React.ReactNode;
}

const ProgressList: React.FC<ProgressListProps> = ({
  items,
  onItemDetails,
  subtitle
}) => {
  const [expanded, setExpanded] = useState<number | string | null>(null);

  const toggleExpanded = (id: number | string) => {
    setExpanded(expanded === id ? null : id);
  };

  const calculateProgress = (current: number, total: number) => {
    return total > 0 ? (current / total) * 100 : 0;
  };

  const getProgressColor = (current: number, total: number) => {
    const progress = calculateProgress(current, total);
    if (progress >= 100) return spacePalette.status.success;
    if (progress >= 75) return spacePalette.primary.main;
    if (progress >= 50) return spacePalette.status.warning;
    return spacePalette.status.error;
  };

  return (
    <List>
      {items.map((item) => {
        const progress = calculateProgress(item.currentCount, item.totalNeeded);
        const progressColor = getProgressColor(item.currentCount, item.totalNeeded);

        return (
          <Box key={item.id} sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => toggleExpanded(item.id)}
              sx={{
                borderLeft: 3,
                borderColor: progressColor,
                bgcolor: 'background.paper',
                borderRadius: 1,
                '&:hover': {
                  bgcolor: alpha(progressColor, 0.05)
                },
                boxShadow: 1
              }}
            >
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {item.title}
                  </Typography>
                }
                secondary={
                  subtitle ? subtitle(item) : (
                    item.description && (
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {item.description}
                      </Typography>
                    )
                  )
                }
              />

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: { xs: '60%', sm: '50%' },
                  mr: 1
                }}
              >
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(progress, 100)}
                    color={
                      progress >= 100 ? "success" :
                      progress >= 75 ? "primary" :
                      progress >= 50 ? "warning" : "error"
                    }
                  />
                </Box>
                <Box minWidth={45}>
                  <Typography variant="body2" color="text.secondary">
                    {`${item.currentCount}/${item.totalNeeded}`}
                  </Typography>
                </Box>
              </Box>

              {item.badgeContent !== undefined && item.badgeIcon && (
                <Badge
                  badgeContent={item.badgeContent}
                  color="primary"
                  sx={{ mr: 1 }}
                >
                  {item.badgeIcon}
                </Badge>
              )}

              {onItemDetails && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onItemDetails(item);
                  }}
                >
                  <MoreHorizIcon />
                </IconButton>
              )}

              {expanded === item.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>

            <Collapse in={expanded === item.id} timeout="auto" unmountOnExit>
              <Box sx={{ pl: 2, pr: 2, pt: 1, pb: 2 }}>
                {item.children}
              </Box>
            </Collapse>
          </Box>
        );
      })}
    </List>
  );
};

export default ProgressList;