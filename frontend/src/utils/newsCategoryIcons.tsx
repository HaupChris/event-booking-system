import React from 'react';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import CampaignIcon from '@mui/icons-material/Campaign';
import EventIcon from '@mui/icons-material/Event';
import SchoolIcon from '@mui/icons-material/School';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import InfoIcon from '@mui/icons-material/Info';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import type { SvgIconProps } from '@mui/material/SvgIcon';

export interface NewsIconOption {
  value: string;
  label: string;
}

export const NEWS_ICON_OPTIONS: NewsIconOption[] = [
  { value: 'announcement', label: 'Ankuendigung' },
  { value: 'campaign', label: 'Megafon' },
  { value: 'calendar', label: 'Kalender' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'travel', label: 'Anreise' },
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warnung' },
  { value: 'music', label: 'Musik' },
  { value: 'community', label: 'Community' },
  { value: 'food', label: 'Essen' },
];

const ICON_MAP: Record<string, React.ComponentType<SvgIconProps>> = {
  announcement: AnnouncementIcon,
  campaign: CampaignIcon,
  calendar: EventIcon,
  workshop: SchoolIcon,
  travel: DirectionsCarIcon,
  info: InfoIcon,
  warning: WarningAmberIcon,
  music: MusicNoteIcon,
  community: Diversity3Icon,
  food: RestaurantIcon,
};

export const DEFAULT_NEWS_ICON_KEY = 'announcement';

export const getNewsCategoryIconFromKey = (
  iconKey: string | null | undefined,
  props?: SvgIconProps
): React.ReactElement => {
  const normalized = (iconKey || DEFAULT_NEWS_ICON_KEY).toLowerCase();
  const Icon = ICON_MAP[normalized] || ICON_MAP[DEFAULT_NEWS_ICON_KEY];
  return <Icon {...props} />;
};
