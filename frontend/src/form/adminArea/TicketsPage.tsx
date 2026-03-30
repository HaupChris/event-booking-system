import React from 'react';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import { useFetchData } from './useFetchData';
import FormCard from '../../components/core/display/FormCard';
import GenericOptionsPage from './components/GenericOptionsPage';
import { useAdminPageFilters } from '../../hooks/useAdminPageFilters';
import { LinearProgressWithLabel } from '../../components/core/feedback/LinearProgressWithLabel';
import {
  calculateDayVisitors,
  getMaxCapacityPerDay,
} from '../../components/core/utils/CalculateNumberOfVisitors';

const TicketsPage: React.FC = () => {
  const { formContent, artistFormContent } = useFetchData();
  const { viewType } = useAdminPageFilters();

  // Calculate capacity metrics
  const maxVisitorsPerDay = getMaxCapacityPerDay(formContent);
  const maxArtistsPerDay = getMaxCapacityPerDay(artistFormContent);

  const { visitorsThursday, visitorsFriday, visitorsSaturday } = calculateDayVisitors(formContent);

  const {
    visitorsThursday: artistsThursday,
    visitorsFriday: artistsFriday,
    visitorsSaturday: artistsSaturday,
  } = calculateDayVisitors(artistFormContent);

  // Additional content showing day capacity
  const capacityContent = (
    <FormCard
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
    >
      {(viewType === 'all' || viewType === 'regular') && (
        <FormCard title={'Visitors'}>
          <LinearProgressWithLabel
            label={`Donnerstag ${visitorsThursday}/${maxVisitorsPerDay}`}
            value={(visitorsThursday * 100) / maxVisitorsPerDay}
          />
          <LinearProgressWithLabel
            label={`Freitag ${visitorsFriday}/${maxVisitorsPerDay}`}
            value={(visitorsFriday * 100) / maxVisitorsPerDay}
          />
          <LinearProgressWithLabel
            label={`Samstag ${visitorsSaturday}/${maxVisitorsPerDay}`}
            value={(visitorsSaturday * 100) / maxVisitorsPerDay}
          />
        </FormCard>
      )}
      {(viewType === 'all' || viewType === 'artist') && (
        <FormCard title={'Artists'}>
          <LinearProgressWithLabel
            label={`Donnerstag ${artistsThursday}/${maxArtistsPerDay}`}
            value={(artistsThursday * 100) / maxArtistsPerDay}
          />
          <LinearProgressWithLabel
            label={`Freitag ${artistsFriday}/${maxArtistsPerDay}`}
            value={(artistsFriday * 100) / maxArtistsPerDay}
          />
          <LinearProgressWithLabel
            label={`Samstag ${artistsSaturday}/${maxArtistsPerDay}`}
            value={(artistsSaturday * 100) / maxArtistsPerDay}
          />
        </FormCard>
      )}
    </FormCard>
  );

  return (
    <GenericOptionsPage
      config={{
        title: 'Tickets Overview',
        optionType: 'ticket',
        icon: <LocalActivityIcon />,
        getRegularOptions: (formContent) => formContent.ticket_options,
        getArtistOptions: (artistFormContent) => artistFormContent.ticket_options,
        bookingFieldName: 'ticket_id',
        additionalContent: capacityContent,
      }}
    />
  );
};

export default TicketsPage;
