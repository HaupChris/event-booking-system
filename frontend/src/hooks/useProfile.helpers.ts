import type { NewsItem, ProfileData } from '../services/profileService';
import { BookingDB, ProfileDB } from '../utils/indexedDB';

export const mapCachedNews = (
  cachedNews: Array<{
    id: string;
    title: string;
    content: string;
    timestamp: string;
    read?: boolean;
  }>,
  profileUuid: string
): NewsItem[] =>
  cachedNews
    .filter((item) => item.id.startsWith(profileUuid))
    .map((item) => ({
      id: parseInt(item.id.split('-')[1], 10) || 0,
      title: item.title,
      content: item.content,
      category: null,
      published_date: item.timestamp,
      is_read: item.read || false,
      read_date: item.read ? item.timestamp : null,
      author: null,
    }));

export const persistProfileCache = async (
  profileUuid: string,
  data: ProfileData
): Promise<void> => {
  await ProfileDB.save({
    userId: profileUuid,
    email: data.user.email,
    name: `${data.user.first_name} ${data.user.last_name}`,
    role: data.user.is_artist ? 'artist' : 'user',
    profileData: data,
    lastSync: new Date().toISOString(),
  });
  await BookingDB.save({
    userId: profileUuid,
    tickets: data.booking.ticket ? [data.booking.ticket] : [],
    food: data.booking.food ? [data.booking.food] : [],
    beverages: data.booking.beverage ? [data.booking.beverage] : [],
    workShifts: data.shifts,
    materials: data.materials,
    lastSync: new Date().toISOString(),
  });
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const extractProfileDataFromCache = (cached: unknown): ProfileData | null => {
  if (!isObject(cached)) {
    return null;
  }

  const candidate = cached.profileData;
  if (!isObject(candidate)) {
    return null;
  }

  if (!isObject(candidate.user) || !isObject(candidate.booking)) {
    return null;
  }

  return candidate as unknown as ProfileData;
};
