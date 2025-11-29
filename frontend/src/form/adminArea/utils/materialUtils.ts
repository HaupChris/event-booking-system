/**
 * Utility functions for material-related operations
 */

/**
 * Gets all users who selected a particular material
 */
export const getUsersForMaterial = (
    materialId: number,
    materialType: 'regular' | 'artist',
    regularBookings: any[],
    artistBookings: any[]
) => {
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

/**
 * Calculates how many people are bringing a specific material
 */
export const getMaterialCount = (
    materialId: number,
    materialType: 'regular' | 'artist',
    regularBookings: any[],
    artistBookings: any[]
): number => {
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

/**
 * Gets all materials assigned to a specific user
 */
export const getMaterialsForUser = (
    booking: any,
    bookingType: 'regular' | 'artist',
    formContent: any,
    artistFormContent: any
) => {
    if (bookingType === 'regular') {
        return booking.material_ids?.map((materialId: number) => {
            return formContent.materials.find((m: any) => m.id === materialId);
        }).filter(Boolean) || [];
    } else {
        return booking.artist_material_ids?.map((materialId: number) => {
            return artistFormContent.artist_materials.find((m: any) => m.id === materialId);
        }).filter(Boolean) || [];
    }
};