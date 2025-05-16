import React, { useState } from 'react';
import {
  Box, Typography, Modal, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip
} from '@mui/material';
import {
  Handyman as HandymanIcon,
  Person as PersonIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useFetchData } from './useFetchData';
import TabSwitcher from './components/TabSwitcher';
import ProgressList, { ProgressItem } from './components/ProgressList';
import PeopleList, { Person } from './components/PeopleList';
import FilterSortBar from './components/FilterSortBar';
import FormCard from '../../components/core/display/FormCard';
import { ViewFilterType } from './utils/optionsUtils';

const MaterialsPage: React.FC = () => {
  const { regularBookings, artistBookings, formContent, artistFormContent } = useFetchData();

  // State
  const [activeTab, setActiveTab] = useState('materials');
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null);
  const [selectedMaterialType, setSelectedMaterialType] = useState<'regular' | 'artist' | null>(null);
  const [openMaterialModal, setOpenMaterialModal] = useState(false);
  const [materialSortOrder, setMaterialSortOrder] = useState<'asc' | 'desc'>('asc');
  const [peopleSortOrder, setPeopleSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewType, setViewType] = useState<ViewFilterType>('all');

  // Modal handlers
  const handleOpenMaterialModal = (material: any, materialType: 'regular' | 'artist') => {
    setSelectedMaterial(material);
    setSelectedMaterialType(materialType);
    setOpenMaterialModal(true);
  };

  const handleCloseMaterialModal = () => {
    setOpenMaterialModal(false);
    setSelectedMaterial(null);
    setSelectedMaterialType(null);
  };

  // Toggle sort orders
  const handleToggleMaterialSort = () => {
    setMaterialSortOrder(materialSortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleTogglePeopleSort = () => {
    setPeopleSortOrder(peopleSortOrder === 'asc' ? 'desc' : 'asc');
  };

  // Helper functions

  // Convert materials to progress items
  const materialsToProgressItems = (): ProgressItem[] => {
    const regularMaterials = viewType === 'all' || viewType === 'regular'
      ? formContent.materials.map(material => ({
          id: `regular-${material.id}`,
          title: material.title,
          currentCount: getMaterialCount(material.id, 'regular'),
          totalNeeded: material.num_needed,
          badgeContent: getUsersForMaterial(material.id, 'regular').length,
          badgeIcon: <PersonIcon color="action" />,
          isRegular: true,
          material
        }))
      : [];

    const artistMaterials = viewType === 'all' || viewType === 'artist'
      ? artistFormContent.artist_materials.map(material => ({
          id: `artist-${material.id}`,
          title: material.title,
          currentCount: getMaterialCount(material.id, 'artist'),
          totalNeeded: material.num_needed,
          badgeContent: getUsersForMaterial(material.id, 'artist').length,
          badgeIcon: <PersonIcon color="action" />,
          isRegular: false,
          material
        }))
      : [];

    return [...regularMaterials, ...artistMaterials].map(item => ({
      ...item,
      children: (
        <Box>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {item.isRegular ?
              "Regular material needed for the festival setup." :
              "Special material needed for artist performances."}
          </Typography>

          <Box sx={{ textAlign: 'center' }}>
            <Chip
              label="View People"
              color="primary"
              onClick={() => handleOpenMaterialModal(
                item.material,
                item.isRegular ? 'regular' : 'artist'
              )}
              icon={<PersonIcon />}
            />
          </Box>
        </Box>
      )
    }));
  };

  // Get users for a specific material
  const getUsersForMaterial = (materialId: number, materialType: 'regular' | 'artist') => {
    if (materialType === 'regular') {
      return regularBookings
        .filter(booking => booking.material_ids?.includes(materialId))
        .map(booking => ({
          first_name: booking.first_name,
          last_name: booking.last_name,
          is_artist: false
        }));
    } else {
      return artistBookings
        .filter(booking => booking.artist_material_ids?.includes(materialId))
        .map(booking => ({
          first_name: booking.first_name,
          last_name: booking.last_name,
          is_artist: true
        }));
    }
  };

  // Count materials
  const getMaterialCount = (materialId: number, materialType: 'regular' | 'artist') => {
    if (materialType === 'regular') {
      return regularBookings.reduce((count, booking) => {
        return count + (booking.material_ids?.includes(materialId) ? 1 : 0);
      }, 0);
    } else {
      return artistBookings.reduce((count, booking) => {
        return count + (booking.artist_material_ids?.includes(materialId) ? 1 : 0);
      }, 0);
    }
  };

  // Convert people with materials to list items
  const peopleToPeopleItems = (): Person[] => {
    const regularPeople = viewType === 'all' || viewType === 'regular'
      ? regularBookings
          .filter(booking => booking.material_ids && booking.material_ids.length > 0)
          .map(booking => ({
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
                    const material = formContent.materials.find(m => m.id === materialId);
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
            )
          }))
      : [];

    const artistPeople = viewType === 'all' || viewType === 'artist'
      ? artistBookings
          .filter(booking => booking.artist_material_ids && booking.artist_material_ids.length > 0)
          .map(booking => ({
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
                    const material = artistFormContent.artist_materials.find(m => m.id === materialId);
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
            )
          }))
      : [];

    return [...regularPeople, ...artistPeople];
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header with title */}
      <Typography variant="h5" gutterBottom>
        Materials Overview
      </Typography>

      {/* Main tabs (Materials vs People view) */}
      <TabSwitcher
        tabs={[
          { value: 'materials', label: 'Material Overview', icon: <HandymanIcon /> },
          { value: 'people', label: 'People Overview', icon: <PersonIcon /> }
        ]}
        currentTab={activeTab}
        onChange={setActiveTab}
      />

      {/* View Type Controls */}
      <FormCard sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <TabSwitcher
            tabs={[
              { value: 'all', label: 'All Materials' },
              { value: 'regular', label: 'Regular Materials' },
              { value: 'artist', label: 'Artist Materials' }
            ]}
            currentTab={viewType}
            onChange={setViewType as any}
          />
        </Box>
      </FormCard>

      {/* Material Overview Tab */}
      {activeTab === 'materials' && (
        <>
          <FilterSortBar
            sortOptions={[
              { value: 'progress', label: 'Progress' },
              { value: 'name', label: 'Name' }
            ]}
            sortBy="progress"
            sortOrder={materialSortOrder}
            onSortByChange={() => {}} // Not implemented in this example
            onSortOrderToggle={handleToggleMaterialSort}
          >
            <Typography variant="body2">
              Showing {materialsToProgressItems().length} materials sorted by progress
            </Typography>
          </FilterSortBar>

          <ProgressList
            items={materialsToProgressItems()}
            sortOrder={materialSortOrder}
          />
        </>
      )}

      {/* People Overview Tab */}
      {activeTab === 'people' && (
        <>
          <FilterSortBar
            sortOptions={[
              { value: 'name', label: 'Name' },
              { value: 'materials', label: 'Materials Count' }
            ]}
            sortBy="name"
            sortOrder={peopleSortOrder}
            onSortByChange={() => {}} // Not implemented in this example
            onSortOrderToggle={handleTogglePeopleSort}
          >
            <Typography variant="body2">
              Showing {peopleToPeopleItems().length} people bringing materials
            </Typography>
          </FilterSortBar>

          <PeopleList
            people={peopleToPeopleItems()}
            sortOrder={peopleSortOrder}
          />
        </>
      )}

      {/* Material Details Modal */}
      <Modal open={openMaterialModal} onClose={handleCloseMaterialModal}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90vw',
          maxWidth: 500,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 2
        }}>
          <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
            <Chip
              icon={<CloseIcon />}
              label="Close"
              onClick={handleCloseMaterialModal}
              variant="outlined"
            />
          </Box>

          {selectedMaterial && selectedMaterialType && (
            <Box>
              <Box sx={{ mb: 3, pr: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">
                    {selectedMaterial.title}
                  </Typography>
                  {selectedMaterialType === 'artist' && (
                    <Chip label="Artist Material" color="primary" size="small" sx={{ ml: 1 }} />
                  )}
                </Box>

                <Typography variant="body2" color="text.secondary">
                  {getUsersForMaterial(selectedMaterial.id, selectedMaterialType).length} people
                  are bringing this item (needed: {selectedMaterial.num_needed})
                </Typography>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getUsersForMaterial(selectedMaterial.id, selectedMaterialType)
                      .map((user, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {user.first_name} {user.last_name}
                          </TableCell>
                          <TableCell>
                            {user.is_artist ? (
                              <Chip label="Artist" color="primary" size="small" />
                            ) : (
                              <Chip label="Regular" size="small" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default MaterialsPage;