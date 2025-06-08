import React, { useState } from 'react';
import {
  Box, Typography, Chip
} from '@mui/material';
import {
    Work,
    People,
    School
} from '@mui/icons-material';
import { useFetchData } from './useFetchData';
import TabSwitcher from './components/TabSwitcher';
import OptionsGrid from './components/OptionsGrid';
import PeopleList, { Person } from './components/PeopleList';
import FilterControls from './components/FilterControls';
import FormCard from '../../components/core/display/FormCard';
import { ViewFilterType } from './utils/optionsUtils';

const ProfessionsPage: React.FC = () => {
  const { regularBookings, artistBookings, formContent, artistFormContent } = useFetchData();

  // State
  const [activeTab, setActiveTab] = useState('professions');
  const [peopleSortOrder, setPeopleSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewType, setViewType] = useState<ViewFilterType>('all');
  const [viewTypeAnchorEl, setViewTypeAnchorEl] = useState<null | HTMLElement>(null);


  // Get users for a specific profession
  const getUsersForProfession = (professionId: number, professionType: 'regular' | 'artist') => {
    if (professionType === 'regular') {
      return regularBookings
        .filter(booking => booking.profession_ids?.includes(professionId))
        .map(booking => ({
          first_name: booking.first_name,
          last_name: booking.last_name,
          email: booking.email,
          is_artist: false
        }));
    } else {
      return artistBookings
        .filter(booking => booking.profession_ids?.includes(professionId))
        .map(booking => ({
          first_name: booking.first_name,
          last_name: booking.last_name,
          email: booking.email,
          is_artist: true
        }));
    }
  };

  // Count professions
  const getProfessionCount = (professionId: number, professionType: 'regular' | 'artist') => {
    if (professionType === 'regular') {
      return regularBookings.reduce((count, booking) => {
        return count + (booking.profession_ids?.includes(professionId) ? 1 : 0);
      }, 0);
    } else {
      return artistBookings.reduce((count, booking) => {
        return count + (booking.profession_ids?.includes(professionId) ? 1 : 0);
      }, 0);
    }
  };

  // Get profession options for OptionsGrid
  const getProfessionOptions = () => {
    const regularOptions = viewType === 'all' || viewType === 'regular'
      ? formContent.professions.map(profession => {
          const count = getProfessionCount(profession.id, 'regular');
          return {
            id: profession.id,
            title: profession.title,
            count,
            isArtist: false
          };
        })
      : [];

    const artistOptions = viewType === 'all' || viewType === 'artist'
      ? artistFormContent.professions.map(profession => {
          const count = getProfessionCount(profession.id, 'artist');
          return {
            id: profession.id,
            title: profession.title,
            count,
            isArtist: true
          };
        })
      : [];

    return [...regularOptions, ...artistOptions];
  };

  // Convert people with professions to list items
  const peopleToPeopleItems = (): Person[] => {
    const regularPeople = viewType === 'all' || viewType === 'regular'
      ? regularBookings
          .filter(booking => booking.profession_ids && booking.profession_ids.length > 0)
          .map(booking => ({
            id: `regular-${booking.id}`,
            name: `${booking.first_name} ${booking.last_name}`,
            subtitle: `${booking.profession_ids?.length || 0} qualification(s)`,
            type: 'regular' as const,
            badgeContent: booking.profession_ids?.length || 0,
            badgeIcon: <Work color="action" />,
            children: (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Professional qualifications:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {booking.profession_ids?.map((professionId: number) => {
                    const profession = formContent.professions.find(p => p.id === professionId);
                    return profession ? (
                      <Chip
                        key={professionId}
                        label={profession.title}
                        variant="outlined"
                        size="small"
                        icon={<School />}
                      />
                    ) : null;
                  })}
                </Box>
              </Box>
            )
          }))
      : [];

    const artistPeople = viewType === 'all' || viewType === 'artist'
      ? artistBookings
          .filter(booking => booking.profession_ids && booking.profession_ids.length > 0)
          .map(booking => ({
            id: `artist-${booking.id}`,
            name: `${booking.first_name} ${booking.last_name}`,
            subtitle: `${booking.profession_ids?.length || 0} qualification(s)`,
            type: 'artist' as const,
            badgeContent: booking.profession_ids?.length || 0,
            badgeIcon: <Work color="action" />,
            children: (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Professional qualifications:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {booking.profession_ids?.map((professionId: number) => {
                    const profession = artistFormContent.professions.find(p => p.id === professionId);
                    return profession ? (
                      <Chip
                        key={professionId}
                        label={profession.title}
                        color="primary"
                        variant="outlined"
                        size="small"
                        icon={<School />}
                      />
                    ) : null;
                  })}
                </Box>
              </Box>
            )
          }))
      : [];

    const allPeople = [...regularPeople, ...artistPeople];

    return allPeople.sort((a, b) => {
      const compare = a.name.localeCompare(b.name);
      return peopleSortOrder === 'asc' ? compare : -compare;
    });
  };

  // Create combined bookings for OptionsGrid
  const allBookings = [
    ...regularBookings.map(b => ({ ...b, bookingType: 'regular' as const })),
    ...artistBookings.map(b => ({ ...b, bookingType: 'artist' as const }))
  ];


  const professionOptions = getProfessionOptions();

  return (
    <Box sx={{ p: 2 }}>
      {/* Header with title */}
      <Typography variant="h5" gutterBottom>
        Professional Qualifications Overview
      </Typography>

      {/* Main tabs (Professions vs People view) */}
      <TabSwitcher
        tabs={[
          { value: 'professions', label: 'Profession Overview', icon: <Work /> },
          { value: 'people', label: 'People Overview', icon: <People /> }
        ]}
        currentTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Profession Overview Tab */}
      {activeTab === 'professions' && (
        <>
          {/* Filter Controls */}
          <FilterControls
            viewType={viewType}
            setViewType={setViewType}
            anchorEl={viewTypeAnchorEl}
            setAnchorEl={setViewTypeAnchorEl}
          />

          {/* Professions Grid */}
          <FormCard>
            <Box sx={{ p: 2 }}>
              <OptionsGrid
                options={professionOptions}
                bookings={allBookings}
                optionType="professions"
                icon={<School/>}
              />
            </Box>
          </FormCard>
        </>
      )}

      {/* People Overview Tab */}
      {activeTab === 'people' && (
        <>
          {/* Filter Controls */}
          <FilterControls
            viewType={viewType}
            setViewType={setViewType}
            anchorEl={viewTypeAnchorEl}
            setAnchorEl={setViewTypeAnchorEl}
          />

          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">
              Showing {peopleToPeopleItems().length} people with professional qualifications
            </Typography>
          </Box>

          <PeopleList
            people={peopleToPeopleItems()}
          />
        </>
      )}
    </Box>
  );
};

export default ProfessionsPage;