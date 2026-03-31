import React from 'react';
import type { TicketOption } from '../../../form/userArea/interface';
import { useThemeMode } from '../../styles/theme';
import TicketOptionCircus from './TicketOptionCircus';
import TicketOptionDefault from './TicketOptionDefault';

export interface TicketOptionComponentProps {
  currentBooking: { ticket_id: number };
  option: TicketOption;
  soldOut: boolean;
  remaining?: number;
  isLowStock?: boolean;
  maxCapacity?: number;
}

function TicketOptionComponent(props: TicketOptionComponentProps) {
  const { mode } = useThemeMode();

  if (mode === 'circus') {
    return <TicketOptionCircus {...props} />;
  }

  return <TicketOptionDefault {...props} />;
}

export default TicketOptionComponent;
