import React from 'react';
import { Box, Button, Typography } from '@mui/material';

interface BookingBulkActionsBarProps {
  isMobile: boolean;
  selectedCount: number;
  onClearSelection: () => void;
  onOpenCustomMail: () => void;
}

const BookingBulkActionsBar: React.FC<BookingBulkActionsBarProps> = ({
  isMobile,
  selectedCount,
  onClearSelection,
  onOpenCustomMail,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: 1,
        mb: 2,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Selected bookings: {selectedCount}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button disabled={selectedCount === 0} onClick={onClearSelection}>
          Clear Selection
        </Button>
        <Button variant="contained" disabled={selectedCount === 0} onClick={onOpenCustomMail}>
          Send Custom Mail
        </Button>
      </Box>
    </Box>
  );
};

export default BookingBulkActionsBar;
