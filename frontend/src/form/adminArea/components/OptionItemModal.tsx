import React from 'react';
import {
  Box, Typography, Modal, IconButton, Table, TableHead,
  TableRow, TableCell, TableBody, Chip, Paper
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { CombinedBooking } from "../interface";
import { alpha } from '@mui/material/styles';
import { spacePalette } from '../../../components/styles/theme';

interface OptionItemModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  price?: number;
  users: CombinedBooking[];
  isArtist?: boolean;
  isMobile: boolean;
}

const OptionItemModal: React.FC<OptionItemModalProps> = ({
  open,
  onClose,
  title,
  description,
  price,
  users,
  isArtist,
  isMobile
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90vw',
        maxWidth: 600,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        p: 3,
        border: `1px solid ${alpha(spacePalette.primary.main, 0.3)}`,
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ mb: 3, pr: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" component="h2">
              {title}
            </Typography>
            {isArtist && (
              <Chip
                label="Artist"
                color="primary"
                size="small"
                sx={{ ml: 1 }}
              />
            )}
            {price !== undefined && (
              <Chip
                label={`€${price.toFixed(2)}`}
                color="default"
                size="small"
                sx={{ ml: 1 }}
              />
            )}
          </Box>

          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>

        <Typography variant="subtitle2" gutterBottom>
          {users.length} participants selected this option
        </Typography>

        <Paper variant="outlined" sx={{ mb: 2 }}>
          <Table size={isMobile ? "small" : "medium"}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                {!isMobile && <TableCell>Email</TableCell>}
                <TableCell>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={index} sx={{
                  bgcolor: user.bookingType === 'artist'
                    ? alpha(spacePalette.primary.main, 0.05)
                    : 'transparent'
                }}>
                  <TableCell>
                    {user.first_name} {user.last_name}
                  </TableCell>
                  {!isMobile && <TableCell>{user.email}</TableCell>}
                  <TableCell>
                    <Chip
                      label={user.bookingType === 'artist' ? 'Artist' : 'Regular'}
                      color={user.bookingType === 'artist' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Modal>
  );
};

export default OptionItemModal;