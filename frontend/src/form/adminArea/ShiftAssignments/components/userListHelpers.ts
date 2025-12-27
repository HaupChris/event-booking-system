import type {ShiftAssignment, UserWithAssignments, UserListFilters} from '../types';

// Helper functions for acceptance filter
export const isAccepted = (sa: ShiftAssignment) => sa.status === 'accepted';
export const isPending = (sa: ShiftAssignment) => sa.status === 'pending' || !sa.status;
export const isDeclined = (sa: ShiftAssignment) => sa.status === 'declined';

// Check if user matches search filter
export const matchesSearch = (user: UserWithAssignments, searchTerm: string): boolean => {
    if (searchTerm === '') return true;
    const term = searchTerm.toLowerCase();
    return (
        user.first_name.toLowerCase().includes(term) ||
        user.last_name.toLowerCase().includes(term) ||
        user.supporter_buddy.toLowerCase().includes(term)
    );
};

// Check if user matches assignment filter
export const matchesAssignment = (
    user: UserWithAssignments,
    filter: UserListFilters['assignmentFilter']
): boolean => {
    if (filter === 'all') return true;
    if (filter === 'completed') return user.is_fully_assigned;
    if (filter === 'incomplete') return !user.is_fully_assigned;
    if (filter === 'unassigned') return user.assigned_count === 0;
    return true;
};

// Check if user matches acceptance filter
export const matchesAcceptanceFilter = (
    user: UserWithAssignments,
    filter: UserListFilters['acceptanceFilter']
): boolean => {
    if (filter === 'all') return true;

    const userAssignments = user.assigned_shifts;
    if (userAssignments.length === 0) return false;

    switch (filter) {
        case 'all_accepted':
            return userAssignments.every(isAccepted);
        case 'has_pending':
            return userAssignments.some(isPending);
        case 'has_declined':
            return userAssignments.some(isDeclined);
        default:
            return true;
    }
};