import React, {useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Modal, IconButton
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';
import {useFetchData} from "./useFetchData";

function FoodPage() {
const { bookings, formContent } = useFetchData();
  const [selectedFood, setSelectedFood] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = (foodId: number) => {
    setSelectedFood(foodId);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedFood(null);
  };

  const getOptionTitle = (id: number, options: { id: number; title: string }[]) => {
    const option = options.find(option => option.id === id);
    return option ? option.title : 'Unknown';
  };

  const getUsersForFood = (foodId: number) => {
    return bookings.filter(booking => booking.food_id === foodId).map(booking => ({
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
              <TableCell>Food Option</TableCell>
              <TableCell>Number of Bookings</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formContent.food_options.map((food) => {
              const users = getUsersForFood(food.id);
              return (
                <TableRow key={food.id}>
                  <TableCell>{food.title}</TableCell>
                  <TableCell>{users.length}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenModal(food.id)}>
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
          width: '90vw', maxWidth: 400, bgcolor: 'white', borderRadius: 2, boxShadow: 24, p: 2
        }}>
          <IconButton onClick={handleCloseModal} sx={{ position: 'absolute', top: 8, right: 8 }}>
            <CloseIcon />
          </IconButton>
          {selectedFood !== null && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {getOptionTitle(selectedFood, formContent.food_options)}
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>First Name</TableCell>
                    <TableCell>Last Name</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getUsersForFood(selectedFood).map((user, index) => (
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

export default FoodPage;
