/**
 * Data transformers for material-related views
 * Transforms raw data into display-ready formats
 */

import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { Person as PersonIcon, Handyman as HandymanIcon } from '@mui/icons-material';
import type { ProgressItem } from '../components/ProgressList';
import type { Person } from '../components/PeopleList';
import type { ViewFilterType } from '../utils/optionsUtils';
import { getMaterialCount, getUsersForMaterial } from '../utils/materialUtils';
import type { FormContent, Material } from '../../userArea/interface';
import type { ArtistFormContent, ArtistMaterial } from '../../artistArea/interface';

type MaterialLike = Material | ArtistMaterial;

interface MaterialBooking {
  id: number;
  first_name: string;
  last_name: string;
  material_ids?: number[];
  artist_material_ids?: number[];
}

interface MaterialTransformConfig {
  regularBookings: MaterialBooking[];
  artistBookings: MaterialBooking[];
  formContent: FormContent;
  artistFormContent: ArtistFormContent;
  viewType: ViewFilterType;
  sortBy: 'progress' | 'name';
  sortOrder: 'asc' | 'desc';
  onMaterialClick: (material: MaterialLike, materialType: 'regular' | 'artist') => void;
}

/**
 * Transforms materials data into progress items for display
 */
export const transformMaterialsToProgressItems = ({
  regularBookings,
  artistBookings,
  formContent,
  artistFormContent,
  viewType,
  sortBy,
  sortOrder,
  onMaterialClick,
}: MaterialTransformConfig): ProgressItem[] => {
  const regularMaterials =
    viewType === 'all' || viewType === 'regular'
      ? formContent.materials.map((material) => ({
          id: `regular-${material.id}`,
          title: material.title,
          currentCount: getMaterialCount(material.id, 'regular', regularBookings, artistBookings),
          totalNeeded: material.num_needed,
          badgeContent: getUsersForMaterial(material.id, 'regular', regularBookings, artistBookings)
            .length,
          badgeIcon: <PersonIcon color="action" />,
          isRegular: true,
          material,
        }))
      : [];

  const artistMaterials =
    viewType === 'all' || viewType === 'artist'
      ? artistFormContent.artist_materials.map((material) => ({
          id: `artist-${material.id}`,
          title: material.title,
          currentCount: getMaterialCount(material.id, 'artist', regularBookings, artistBookings),
          totalNeeded: material.num_needed,
          badgeContent: getUsersForMaterial(material.id, 'artist', regularBookings, artistBookings)
            .length,
          badgeIcon: <PersonIcon color="action" />,
          isRegular: false,
          material,
        }))
      : [];

  const items = [...regularMaterials, ...artistMaterials].map((item) => ({
    ...item,
    children: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {item.isRegular
            ? 'Regular material needed for the festival setup.'
            : 'Special material needed for artist performances.'}
        </Typography>

        <Box sx={{ textAlign: 'center' }}>
          <Chip
            label="View People"
            color="primary"
            onClick={() => onMaterialClick(item.material, item.isRegular ? 'regular' : 'artist')}
            icon={<PersonIcon />}
          />
        </Box>
      </Box>
    ),
  }));

  return items.sort((a, b) => {
    if (sortBy === 'name') {
      const compare = a.title.localeCompare(b.title);
      return sortOrder === 'asc' ? compare : -compare;
    } else {
      const progressA = a.totalNeeded > 0 ? (a.currentCount / a.totalNeeded) * 100 : 0;
      const progressB = b.totalNeeded > 0 ? (b.currentCount / b.totalNeeded) * 100 : 0;
      const compare = progressA - progressB;
      return sortOrder === 'asc' ? compare : -compare;
    }
  });
};

interface PeopleTransformConfig {
  regularBookings: MaterialBooking[];
  artistBookings: MaterialBooking[];
  formContent: FormContent;
  artistFormContent: ArtistFormContent;
  viewType: ViewFilterType;
  sortBy: 'name' | 'materials';
  sortOrder: 'asc' | 'desc';
}

/**
 * Transforms bookings data into people items for display
 */
export const transformBookingsToPeopleItems = ({
  regularBookings,
  artistBookings,
  formContent,
  artistFormContent,
  viewType,
  sortBy,
  sortOrder,
}: PeopleTransformConfig): Person[] => {
  const regularPeople =
    viewType === 'all' || viewType === 'regular'
      ? regularBookings
          .filter((booking) => booking.material_ids && booking.material_ids.length > 0)
          .map((booking) => ({
            id: `regular-${booking.id}`,
            name: `${booking.first_name} ${booking.last_name}`,
            type: 'regular' as const,
            badgeContent: booking.material_ids?.length || 0,
            badgeIcon: <HandymanIcon color="action" />,
            children: (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Materials being brought:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {booking.material_ids?.map((materialId: number) => {
                    const material = formContent.materials.find((m) => m.id === materialId);
                    return material ? (
                      <Chip
                        key={materialId}
                        label={material.title}
                        variant="outlined"
                        size="small"
                      />
                    ) : null;
                  })}
                </Box>
              </Box>
            ),
          }))
      : [];

  const artistPeople =
    viewType === 'all' || viewType === 'artist'
      ? artistBookings
          .filter(
            (booking) => booking.artist_material_ids && booking.artist_material_ids.length > 0
          )
          .map((booking) => ({
            id: `artist-${booking.id}`,
            name: `${booking.first_name} ${booking.last_name}`,
            type: 'artist' as const,
            badgeContent: booking.artist_material_ids?.length || 0,
            badgeIcon: <HandymanIcon color="action" />,
            children: (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Materials being brought:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {booking.artist_material_ids?.map((materialId: number) => {
                    const material = artistFormContent.artist_materials.find(
                      (m) => m.id === materialId
                    );
                    return material ? (
                      <Chip
                        key={materialId}
                        label={material.title}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ) : null;
                  })}
                </Box>
              </Box>
            ),
          }))
      : [];

  return [...regularPeople, ...artistPeople].sort((a, b) => {
    if (sortBy === 'materials') {
      const compare = a.badgeContent - b.badgeContent;
      return sortOrder === 'asc' ? compare : -compare;
    } else {
      const compare = a.name.localeCompare(b.name);
      return sortOrder === 'asc' ? compare : -compare;
    }
  });
};
