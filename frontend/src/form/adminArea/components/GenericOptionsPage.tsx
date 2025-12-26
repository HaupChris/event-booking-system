/**
 * Generic options page component for displaying and filtering options (tickets, beverages, food).
 * Consolidates the common pattern found in BeveragesPage, FoodPage, and TicketsPage.
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { useFetchData } from '../useFetchData';
import OptionsTable from './OptionsTable';
import FilterControls from './FilterControls';
import type { CombinedBooking } from '../interface';
import { useAdminPageFilters } from '../../../hooks/useAdminPageFilters';

interface OptionItem {
    id: number;
    title: string;
    price?: number;
    description?: string;
}

interface OptionsPageConfig {
    title: string;
    optionType: 'ticket' | 'beverage' | 'food' | 'professions';
    icon: React.ReactNode;
    /**
     * Function to extract options from form content
     */
    getRegularOptions: (formContent: any) => OptionItem[];
    getArtistOptions: (artistFormContent: any) => OptionItem[];
    /**
     * Field name in the booking object (e.g., 'ticket_id', 'beverage_id', 'food_id')
     */
    bookingFieldName: string;
    /**
     * Optional additional content to display above the options grid (e.g., progress bars for tickets)
     */
    additionalContent?: React.ReactNode;
}

interface GenericOptionsPageProps {
    config: OptionsPageConfig;
}

const GenericOptionsPage: React.FC<GenericOptionsPageProps> = ({ config }) => {
    const {
        bookings,
        regularBookings,
        artistBookings,
        formContent,
        artistFormContent
    } = useFetchData();

    const { viewType, setViewType, anchorEl, setAnchorEl } = useAdminPageFilters();

    // Convert to proper type
    const regularBookingsWithType: CombinedBooking[] = regularBookings.map(b => ({
        ...b,
        bookingType: 'regular' as const
    }));

    const artistBookingsWithType: CombinedBooking[] = artistBookings.map(b => ({
        ...b,
        bookingType: 'artist' as const
    }));

    // Calculate option counts and stats
    const getOptions = () => {
        const regularOptions = viewType === 'all' || viewType === 'regular'
            ? config.getRegularOptions(formContent).map(option => {
                const count = regularBookingsWithType.filter(
                    b => (b as any)[config.bookingFieldName] === option.id
                ).length;
                return {
                    id: option.id,
                    title: option.title,
                    price: option.price,
                    description: option.description,
                    count,
                    isArtist: false
                };
            })
            : [];

        const artistOptions = viewType === 'all' || viewType === 'artist'
            ? config.getArtistOptions(artistFormContent).map(option => {
                const count = artistBookingsWithType.filter(
                    b => (b as any)[config.bookingFieldName] === option.id
                ).length;
                return {
                    id: option.id,
                    title: option.title,
                    price: option.price,
                    description: option.description,
                    count,
                    isArtist: true
                };
            })
            : [];

        return [...regularOptions, ...artistOptions];
    };

    const options = getOptions();

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
                {config.title}
            </Typography>

            {/* Filter Controls */}
            <FilterControls
                viewType={viewType}
                setViewType={setViewType}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
            />

            {/* Additional Content (e.g., progress bars) */}
            {config.additionalContent}

            {/* Options Table */}
            <Box sx={{ mt: 2 }}>
                <OptionsTable
                    options={options}
                    bookings={bookings}
                    optionType={config.optionType}
                    showPrice={config.optionType !== "professions"}
                    showDescription={config.optionType === 'food' || config.optionType === 'beverage'}
                />
            </Box>
        </Box>
    );
};

export default GenericOptionsPage;