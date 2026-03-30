/**
 * Utility functions for material-related operations
 */

import type { FormContent, Material } from '../../userArea/interface';
import type { ArtistFormContent, ArtistMaterial } from '../../artistArea/interface';

interface MaterialBooking {
    first_name: string;
    last_name: string;
    material_ids?: number[];
    artist_material_ids?: number[];
}

interface MaterialUser {
    first_name: string;
    last_name: string;
    is_artist: boolean;
}

/**
 * Gets all users who selected a particular material
 */
export const getUsersForMaterial = (
    materialId: number,
    materialType: 'regular' | 'artist',
    regularBookings: MaterialBooking[],
    artistBookings: MaterialBooking[]
): MaterialUser[] => {
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
    regularBookings: MaterialBooking[],
    artistBookings: MaterialBooking[]
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
    booking: MaterialBooking,
    bookingType: 'regular' | 'artist',
    formContent: FormContent,
    artistFormContent: ArtistFormContent
): Array<Material | ArtistMaterial> => {
    if (bookingType === 'regular') {
        return (booking.material_ids?.map((materialId: number) => {
            return formContent.materials.find((m) => m.id === materialId);
        }).filter((material): material is Material => material !== undefined) || []);
    } else {
        return (booking.artist_material_ids?.map((materialId: number) => {
            return artistFormContent.artist_materials.find((m) => m.id === materialId);
        }).filter((material): material is ArtistMaterial => material !== undefined) || []);
    }
};
