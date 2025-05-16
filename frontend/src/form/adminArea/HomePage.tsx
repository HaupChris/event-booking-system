import React from 'react';
import { 
  Box, Typography, Grid,
  List, ListItem, ListItemText, Divider, alpha
} from '@mui/material';
import {
  People as PeopleIcon,
  MusicNote as MusicNoteIcon,
  Restaurant as RestaurantIcon,
  SportsBar as SportsBarIcon,
  LocalActivity as LocalActivityIcon,
  Paid as PaidIcon
} from '@mui/icons-material';
import { useFetchData } from './useFetchData';
import StatsCard from './components/StatsCard';
import FormCard from '../../components/core/display/FormCard';
import { TicketOption, BeverageOption, FoodOption } from '../userArea/interface';

// Interface for option info with counts
interface OptionWithCounts {
  title: string;
  regularCount: number;
  artistCount: number;
  totalCount: number;
}

function HomePage() {
  const { bookings, formContent, artistFormContent } = useFetchData();

  const artistCount = bookings.filter(b => b.bookingType === 'artist').length;
  const regularCount = bookings.filter(b => b.bookingType === 'regular').length;
  const totalCount = artistCount + regularCount;

  // Calculate payment stats
  const paidCount = bookings.filter(b => b.is_paid).length;
  const unpaidCount = bookings.filter(b => !b.is_paid).length;
  const totalRevenue = bookings.reduce((sum, b) => sum + b.total_price, 0);
  const paidRevenue = bookings.reduce((sum, b) => sum + (b.paid_amount || 0), 0);
  const paymentProgress = totalRevenue > 0 ? (paidRevenue / totalRevenue) * 100 : 0;

  // Format option counts with proper typing
  const formatTicketCounts = (
    options: TicketOption[],
    regularBookings: boolean = true,
    artistBookings: boolean = true
  ): OptionWithCounts[] => {
    return options.map(option => {
      const regularCount = regularBookings ? option.num_booked || 0 : 0;

      // Fix the type issue by first finding the exact type
      let artistCount = 0;
      if (artistBookings) {
        const matchingOption = artistFormContent.ticket_options.find(
          (o: TicketOption) => o.title === option.title
        );
        artistCount = matchingOption?.num_booked || 0;
      }

      return {
        title: option.title,
        regularCount,
        artistCount,
        totalCount: regularCount + artistCount
      };
    });
  };

  // Similar function for beverage options
  const formatBeverageCounts = (
    options: BeverageOption[],
    regularBookings: boolean = true,
    artistBookings: boolean = true
  ): OptionWithCounts[] => {
    return options.map(option => {
      const regularCount = regularBookings ? option.num_booked || 0 : 0;

      let artistCount = 0;
      if (artistBookings) {
        const matchingOption = artistFormContent.beverage_options.find(
          (o: BeverageOption) => o.title === option.title
        );
        artistCount = matchingOption?.num_booked || 0;
      }

      return {
        title: option.title,
        regularCount,
        artistCount,
        totalCount: regularCount + artistCount
      };
    });
  };

  // Similar function for food options
  const formatFoodCounts = (
    options: FoodOption[],
    regularBookings: boolean = true,
    artistBookings: boolean = true
  ): OptionWithCounts[] => {
    return options.map(option => {
      const regularCount = regularBookings ? option.num_booked || 0 : 0;

      let artistCount = 0;
      if (artistBookings) {
        const matchingOption = artistFormContent.food_options.find(
          (o: FoodOption) => o.title === option.title
        );
        artistCount = matchingOption?.num_booked || 0;
      }

      return {
        title: option.title,
        regularCount,
        artistCount,
        totalCount: regularCount + artistCount
      };
    });
  };

  const ticketStats = formatTicketCounts(formContent.ticket_options);
  const beverageStats = formatBeverageCounts(formContent.beverage_options);
  const foodStats = formatFoodCounts(formContent.food_options);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Festival Dashboard
      </Typography>

      {/* Rest of component remains the same */}
      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Regular Participants"
            value={regularCount}
            icon={<PeopleIcon fontSize="large" />}
            color="primary"
            subtitle={`${Math.round((regularCount / totalCount) * 100)}% of total participants`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Artists"
            value={artistCount}
            icon={<MusicNoteIcon fontSize="large" />}
            color="info"
            subtitle={`${Math.round((artistCount / totalCount) * 100)}% of total participants`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Payment Status"
            value={`${paidCount}/${totalCount}`}
            icon={<PaidIcon fontSize="large" />}
            color={paidCount === totalCount ? "success" : "warning"}
            progress={(paidCount / totalCount) * 100}
            subtitle={`${unpaidCount} unpaid registrations`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Revenue"
            value={`€${totalRevenue.toFixed(2)}`}
            icon={<PaidIcon fontSize="large" />}
            color="success"
            progress={paymentProgress}
            subtitle={`€${paidRevenue.toFixed(2)} received (${Math.round(paymentProgress)}%)`}
          />
        </Grid>
      </Grid>

      {/* Main content grid */}
      <Grid container spacing={3}>
        {/* Tickets */}
        <Grid item xs={12} md={4}>
          <FormCard
            title="Ticket Bookings"
            icon={<LocalActivityIcon />}
            description="Regular / Artists"
          >
            <List>
              {ticketStats.map((stat, index) => (
                <React.Fragment key={index}>
                  <ListItem sx={{
                    bgcolor: index % 2 === 0 ? alpha('#000', 0.03) : 'transparent',
                    py: 1
                  }}>
                    <ListItemText
                      primary={stat.title}
                      primaryTypographyProps={{
                        variant: 'body2',
                        sx: { fontWeight: 'medium' }
                      }}
                    />
                    <Typography variant="body2">
                      {stat.regularCount} / {stat.artistCount}
                    </Typography>
                  </ListItem>
                  {index < ticketStats.length - 1 && (
                    <Divider component="li" sx={{ borderColor: alpha('#fff', 0.1) }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          </FormCard>
        </Grid>

        {/* Beverages */}
        <Grid item xs={12} md={4}>
          <FormCard
            title="Beer Bookings"
            icon={<SportsBarIcon />}
            description="Regular / Artists"
          >
            <List>
              {beverageStats.map((stat, index) => (
                <React.Fragment key={index}>
                  <ListItem sx={{
                    bgcolor: index % 2 === 0 ? alpha('#000', 0.03) : 'transparent',
                    py: 1
                  }}>
                    <ListItemText
                      primary={stat.title}
                      primaryTypographyProps={{
                        variant: 'body2',
                        sx: { fontWeight: 'medium' }
                      }}
                    />
                    <Typography variant="body2">
                      {stat.regularCount} / {stat.artistCount}
                    </Typography>
                  </ListItem>
                  {index < beverageStats.length - 1 && (
                    <Divider component="li" sx={{ borderColor: alpha('#fff', 0.1) }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          </FormCard>
        </Grid>

        {/* Food */}
        <Grid item xs={12} md={4}>
          <FormCard
            title="Food Bookings"
            icon={<RestaurantIcon />}
            description="Regular / Artists"
          >
            <List>
              {foodStats.map((stat, index) => (
                <React.Fragment key={index}>
                  <ListItem sx={{
                    bgcolor: index % 2 === 0 ? alpha('#000', 0.03) : 'transparent',
                    py: 1
                  }}>
                    <ListItemText
                      primary={stat.title}
                      primaryTypographyProps={{
                        variant: 'body2',
                        sx: { fontWeight: 'medium' }
                      }}
                    />
                    <Typography variant="body2">
                      {stat.regularCount} / {stat.artistCount}
                    </Typography>
                  </ListItem>
                  {index < foodStats.length - 1 && (
                    <Divider component="li" sx={{ borderColor: alpha('#fff', 0.1) }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          </FormCard>
        </Grid>
      </Grid>
    </Box>
  );
}

export default HomePage;