import React, { useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Modal, IconButton, LinearProgress
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';
import { useFetchData } from './useFetchData';

const ArtistMaterialsPage: React.FC = () => {
  const { artistBookings, artistFormContent } = useFetchData();
  const [selectedMaterial, setSelectedMaterial] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = (materialId: number) => {
    setSelectedMaterial(materialId);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedMaterial(null);
  };

  const getArtistsForMaterial = (materialId: number) => {
    return artistBookings
      .filter(booking => booking.artist_material_ids?.includes(materialId))
      .map(booking => ({
first_name: booking.first_name,
        last_name: booking.last_name,
        email: booking.email
      }));
  };

  const getMaterialCount = (materialId: number) => {
    return artistBookings.reduce((count, booking) => {
      return count + (booking.artist_material_ids?.includes(materialId) ? 1 : 0);
    }, 0);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>Artist Materials</Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Material</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Count</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {artistFormContent.artist_materials.map((material) => {
              const count = getMaterialCount(material.id);
              const progress = (count / material.num_needed) * 100;

              return (
                <TableRow key={material.id}>
                  <TableCell>{material.title}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress variant="determinate" value={Math.min(progress, 100)} />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary">
                          {Math.round(progress)}%
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{count}/{material.num_needed}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenModal(material.id)}>
                      <MoreHorizIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Artists Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90vw',
          maxWidth: 400,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 2
        }}>
          <IconButton onClick={handleCloseModal} sx={{ position: 'absolute', top: 8, right: 8 }}>
            <CloseIcon />
          </IconButton>
          {selectedMaterial !== null && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Artists bringing {artistFormContent.artist_materials.find(m => m.id === selectedMaterial)?.title}
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getArtistsForMaterial(selectedMaterial).map((artist, index) => (
                    <TableRow key={index}>
                      <TableCell>{artist.first_name} {artist.last_name}</TableCell>
                      <TableCell>{artist.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default ArtistMaterialsPage;