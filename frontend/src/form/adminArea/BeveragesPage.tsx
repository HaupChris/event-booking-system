import React, {useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Modal, IconButton
} from '@mui/material';

import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';
import {useFetchData} from "./useFetchData";


function BeveragesPage() {
  const {bookings, formContent} = useFetchData();
  const [selectedBeverage, setSelectedBeverage] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = (beverageId: number) => {
    setSelectedBeverage(beverageId);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedBeverage(null);
  };

  const getOptionTitle = (id: number, options: { id: number; title: string }[]) => {
    const option = options.find(option => option.id === id);
    return option ? option.title : 'Unknown';
  };

  const getUsersForBeverage = (beverageId: number) => {
    return bookings.filter(booking => booking.beverage_id === beverageId).map(booking => ({
      first_name: booking.first_name,
      last_name: booking.last_name
    }));
  };

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Bierflat</TableCell>
              <TableCell>Anzahl gebucht</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formContent.beverage_options.map((beverage) => {
              const users = getUsersForBeverage(beverage.id);
              return (
                <TableRow key={beverage.id}>
                  <TableCell>{beverage.title}</TableCell>
                  <TableCell>{users.length}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenModal(beverage.id)}>
                      <MoreHorizIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '90vw', maxWidth: 400, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 2
        }}>
          <IconButton onClick={handleCloseModal} sx={{ position: 'absolute', top: 8, right: 8 }}>
            <CloseIcon />
          </IconButton>
          {selectedBeverage !== null && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Users for {getOptionTitle(selectedBeverage, formContent.beverage_options)}
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>First Name</TableCell>
                    <TableCell>Last Name</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getUsersForBeverage(selectedBeverage).map((user, index) => (
                    <TableRow key={index}>
                      <TableCell>{user.first_name}</TableCell>
                      <TableCell>{user.last_name}</TableCell>
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
}

export default BeveragesPage;
