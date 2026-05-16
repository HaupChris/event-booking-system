/**
 * News Feed
 * =========
 * Display news feed with read/unread status
 */

import React, { useState } from 'react';
import {
  alpha,
  Alert,
  Badge,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import EventIcon from '@mui/icons-material/Event';
import SchoolIcon from '@mui/icons-material/School';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CampaignIcon from '@mui/icons-material/Campaign';
import type { NewsItem } from '../../services/profileService';
import MissionHeading from '../core/display/MissionHeading';
import { useThemeMode } from '../styles/theme';
import { useBrandingPack } from '../../branding/useBrandingPack';
import MarkdownContent from '../core/display/MarkdownContent';
import { getNewsCategoryIconFromKey } from '../../utils/newsCategoryIcons';

interface NewsFeedProps {
  news: NewsItem[];
  isOnline: boolean;
  onMarkAsRead: (newsId: number) => Promise<void>;
}

interface NewsFeedCardProps {
  item: NewsItem;
  isExpanded: boolean;
  isCircusMode: boolean;
  theme: Theme;
  bodyFont: string;
  headingFont: string;
  onToggle: (newsId: number, isRead: boolean) => void;
}

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

const resolveCategoryIcon = (item: NewsItem) => {
  if (item.category_icon) {
    return getNewsCategoryIconFromKey(item.category_icon);
  }
  return getCategoryIcon(item.category);
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

const resolveCategoryLabel = (item: NewsItem) =>
  item.category_label || getCategoryLabel(item.category);

const getCardSx = (isCircusMode: boolean, isNew: boolean) => {
  const cardSx = {
    mb: 1.75,
    borderRadius: isCircusMode ? '12px' : 2,
    borderLeft: isNew ? '4px solid' : undefined,
    borderLeftColor: isNew ? (isCircusMode ? '#d8b87a' : 'primary.main') : undefined,
  };

  if (!isCircusMode) {
    return cardSx;
  }

  return {
    ...cardSx,
    backgroundColor: 'rgba(28, 12, 12, 0.72)',
    borderColor: alpha('#cda163', 0.5),
    boxShadow: '0 8px 22px rgba(0,0,0,0.36)',
  };
};

const getCategoryChipSx = (isCircusMode: boolean, bodyFont: string) => {
  if (!isCircusMode) {
    return undefined;
  }

  return {
    borderColor: alpha('#d8b87a', 0.6),
    color: '#f4ead6',
    fontFamily: bodyFont,
  };
};

const NewsFeedCard: React.FC<NewsFeedCardProps> = ({
  item,
  isExpanded,
  isCircusMode,
  theme,
  bodyFont,
  headingFont,
  onToggle,
}) => {
  const isNew = !item.is_read;

  return (
    <Card key={item.id} variant="outlined" sx={getCardSx(isCircusMode, isNew)}>
      <CardHeader
        sx={{ px: { xs: 2, sm: 2.5 }, pt: { xs: 2, sm: 2.5 }, pb: 1.25 }}
        avatar={resolveCategoryIcon(item)}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isNew && <Badge badgeContent={<FiberNewIcon fontSize="small" />} color="primary" />}
            <IconButton
              onClick={() => onToggle(item.id, item.is_read)}
              sx={{
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s',
                color: isCircusMode ? '#d8b87a' : undefined,
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
            <Typography
              variant="h6"
              component="span"
              sx={{ fontFamily: isCircusMode ? headingFont : undefined }}
            >
              {item.title}
            </Typography>
            {item.category && (
              <Chip
                label={resolveCategoryLabel(item)}
                size="small"
                color={isCircusMode ? 'default' : 'primary'}
                variant="outlined"
                sx={getCategoryChipSx(isCircusMode, bodyFont)}
              />
            )}
          </Box>
        }
        subheader={
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontFamily: isCircusMode ? bodyFont : undefined }}
            >
              {new Date(item.published_date).toLocaleDateString('de-DE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Typography>
          </Box>
        }
      />
      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
          <Box
            sx={{
              color: isCircusMode ? '#f4ead6' : theme.palette.text.primary,
              fontFamily: isCircusMode ? bodyFont : undefined,
              '& p': {
                mt: 0,
                mb: 1.25,
              },
            }}
          >
            <MarkdownContent content={item.content} />
          </Box>

          {item.read_date && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 2, fontFamily: isCircusMode ? bodyFont : undefined }}
            >
              Gelesen am: {new Date(item.read_date).toLocaleDateString('de-DE')}
            </Typography>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};

const NewsFeed: React.FC<NewsFeedProps> = ({ news, isOnline, onMarkAsRead }) => {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const brandingPack = useBrandingPack();
  const isCircusMode = mode === 'circus';
  const [expandedNews, setExpandedNews] = useState<Set<number>>(new Set());

  const handleExpandClick = async (newsId: number, isRead: boolean) => {
    const newExpanded = new Set(expandedNews);

    if (expandedNews.has(newsId)) {
      newExpanded.delete(newsId);
    } else {
      newExpanded.add(newsId);
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

  return (
    <Box sx={{ pb: 0.5 }}>
      <MissionHeading
        title="Neuigkeiten"
        subtitle="Alle Updates fuer deine Festival-Crew"
        icon={<CampaignIcon />}
      />

      {!isOnline && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Du bist offline. Neueste Nachrichten werden angezeigt, sobald du wieder online bist.
        </Alert>
      )}

      {news.length === 0 ? (
        <Alert severity="info">Noch keine Neuigkeiten verfügbar. Schau später wieder vorbei!</Alert>
      ) : (
        news.map((item) => (
          <NewsFeedCard
            key={item.id}
            item={item}
            isExpanded={expandedNews.has(item.id)}
            isCircusMode={isCircusMode}
            theme={theme}
            bodyFont={brandingPack.typography.body}
            headingFont={brandingPack.typography.heading}
            onToggle={handleExpandClick}
          />
        ))
      )}
    </Box>
  );
};

export default NewsFeed;
