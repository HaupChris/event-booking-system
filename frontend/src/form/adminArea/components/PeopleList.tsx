// src/form/adminArea/components/PeopleList.tsx

import React, { useState } from 'react';
import {
    List, ListItemButton, ListItemText, Collapse,
    Typography, Box, Chip, IconButton, alpha, Badge
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  MoreHoriz as MoreHorizIcon
} from '@mui/icons-material';
import { spacePalette } from '../../../components/styles/theme';

export interface Person {
  id: string | number;
  name: string;
  subtitle?: string;
  type?: 'artist' | 'regular';
  children?: React.ReactNode;
  badgeContent?: number;
  badgeIcon?: React.ReactNode;
}

interface PeopleListProps {
  people: Person[];
  onPersonDetails?: (person: Person) => void;
}

const PeopleList: React.FC<PeopleListProps> = ({
  people,
  onPersonDetails,
}) => {
  const [expanded, setExpanded] = useState<string | number | null>(null);

  const toggleExpanded = (id: string | number) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <List>
      {people.map((person) => (
        <Box key={person.id} sx={{ mb: 1 }}>
          <ListItemButton
            onClick={() => toggleExpanded(person.id)}
            sx={{
              bgcolor: person.type === 'artist'
                ? alpha(spacePalette.primary.main, 0.08)
                : 'background.paper',
              borderRadius: 1,
              '&:hover': {
                bgcolor: person.type === 'artist'
                  ? alpha(spacePalette.primary.main, 0.12)
                  : alpha('#fff', 0.1)
              },
              boxShadow: 1
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {person.type === 'artist' && (
                    <Chip
                      label="Artist"
                      color="primary"
                      size="small"
                      sx={{ mr: 1 }}
                    />
                  )}
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: expanded === person.id ? 'bold' : 'normal' }}
                  >
                    {person.name}
                  </Typography>
                </Box>
              }
              secondary={
                person.subtitle && (
                  <Typography variant="body2" color="text.secondary">
                    {person.subtitle}
                  </Typography>
                )
              }
            />

            {person.badgeContent !== undefined && person.badgeIcon && (
              <Badge
                badgeContent={person.badgeContent}
                color="primary"
                sx={{ mr: 1 }}
              >
                {person.badgeIcon}
              </Badge>
            )}

            {onPersonDetails && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onPersonDetails(person);
                }}
                sx={{
                  mr: 1,
                  color: spacePalette.primary.main
                }}
              >
                <MoreHorizIcon />
              </IconButton>
            )}

            {expanded === person.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItemButton>

          <Collapse in={expanded === person.id} timeout="auto" unmountOnExit>
            <Box sx={{ pl: 2, pr: 2, pt: 1, pb: 2 }}>
              {person.children}
            </Box>
          </Collapse>
        </Box>
      ))}
    </List>
  );
};

export default PeopleList;