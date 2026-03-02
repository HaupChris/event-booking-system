/**
 * News Feed
 * =========
 * Display news feed with read/unread status
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Alert,
  IconButton,
  Collapse,
  Badge,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import EventIcon from '@mui/icons-material/Event';
import SchoolIcon from '@mui/icons-material/School';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import type { NewsItem } from '../../services/profileService';

interface NewsFeedProps {
  news: NewsItem[];
  isOnline: boolean;
  onMarkAsRead: (newsId: number) => Promise<void>;
}

const NewsFeed: React.FC<NewsFeedProps> = ({ news, isOnline, onMarkAsRead }) => {
  const [expandedNews, setExpandedNews] = useState<Set<number>>(new Set());
  const cardContentSx = { p: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 2.5, sm: 3 } } };

  const handleExpandClick = async (newsId: number, isRead: boolean) => {
    const newExpanded = new Set(expandedNews);

    if (expandedNews.has(newsId)) {
      newExpanded.delete(newsId);
    } else {
      newExpanded.add(newsId);

      // Mark as read when expanding (if not already read)
      if (!isRead) {
        try {
          await onMarkAsRead(newsId);
        } catch (error) {
          console.error('Error marking news as read:', error);
        }
      }
    }

    setExpandedNews(newExpanded);
  };

  const getCategoryIcon = (category: string | null) => {
    switch (category?.toLowerCase()) {
      case 'anreise':
        return <DirectionsCarIcon />;
      case 'timetable':
        return <EventIcon />;
      case 'workshop':
        return <SchoolIcon />;
      default:
        return <AnnouncementIcon />;
    }
  };

  const getCategoryLabel = (category: string | null) => {
    switch (category?.toLowerCase()) {
      case 'anreise':
        return 'Anreise';
      case 'timetable':
        return 'Zeitplan';
      case 'workshop':
        return 'Workshop';
      case 'announcement':
        return 'Ankündigung';
      default:
        return 'Allgemein';
    }
  };

  if (news.length === 0) {
    return (
      <Box>
        <Alert severity="info">
          Noch keine Neuigkeiten verfügbar. Schau später wieder vorbei!
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {!isOnline && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Du bist offline. Neueste Nachrichten werden angezeigt, sobald du wieder online bist.
        </Alert>
      )}

      {news.map((item) => {
        const isExpanded = expandedNews.has(item.id);
        const isNew = !item.is_read;

        return (
          <Card
            key={item.id}
            variant="outlined"
            sx={{
              mb: 3,
              borderRadius: 2,
              borderLeft: isNew ? '4px solid' : undefined,
              borderLeftColor: isNew ? 'primary.main' : undefined,
            }}
          >
            <CardHeader
              sx={{ px: { xs: 2.5, sm: 3 }, pt: { xs: 2.5, sm: 3 }, pb: 1.5 }}
              avatar={getCategoryIcon(item.category)}
              action={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {isNew && (
                    <Badge badgeContent={<FiberNewIcon fontSize="small" />} color="primary" />
                  )}
                  <IconButton
                    onClick={() => handleExpandClick(item.id, item.is_read)}
                    sx={{
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s',
                    }}
                    aria-expanded={isExpanded}
                    aria-label="show more"
                  >
                    <ExpandMoreIcon />
                  </IconButton>
                </Box>
              }
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" component="span">
                    {item.title}
                  </Typography>
                  {item.category && (
                    <Chip
                      label={getCategoryLabel(item.category)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
              }
              subheader={
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(item.published_date).toLocaleDateString('de-DE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                  {item.author && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      • von {item.author}
                    </Typography>
                  )}
                </Box>
              }
            />
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <CardContent sx={cardContentSx}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {item.content}
                </Typography>

                {item.read_date && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 2 }}
                  >
                    Gelesen am: {new Date(item.read_date).toLocaleDateString('de-DE')}
                  </Typography>
                )}
              </CardContent>
            </Collapse>
          </Card>
        );
      })}
    </Box>
  );
};

export default NewsFeed;
