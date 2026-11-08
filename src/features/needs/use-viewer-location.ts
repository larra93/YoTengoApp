import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';

import { queryKeys } from '@/lib/query-keys';

import { setMyLocation } from './api';

export interface ViewerLocation {
  latitude: number;
  longitude: number;
}

async function readViewerLocation(): Promise<ViewerLocation | null> {
  try {
    const permission = await Location.getForegroundPermissionsAsync();

    if (!permission.granted) {
      return null;
    }

    const lastKnown = await Location.getLastKnownPositionAsync({
      maxAge: 5 * 60 * 1000,
      requiredAccuracy: 5000,
    });
    const position =
      lastKnown ??
      (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch {
    return null;
  }
}

export function useViewerLocation() {
  const queryClient = useQueryClient();
  const locationQuery = useQuery({
    queryKey: queryKeys.location,
    queryFn: readViewerLocation,
    staleTime: 5 * 60 * 1000,
    retry: 0,
  });

  const requestLocation = useMutation({
    mutationFn: async (): Promise<ViewerLocation | null> => {
      const currentPermission = await Location.getForegroundPermissionsAsync();
      const permission = currentPermission.granted
        ? currentPermission
        : await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        return null;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      await setMyLocation(coordinates.latitude, coordinates.longitude).catch(() => null);

      return coordinates;
    },
    onSuccess: (coordinates) => {
      queryClient.setQueryData(queryKeys.location, coordinates);
    },
  });

  return {
    location: locationQuery.data ?? null,
    isLoading: locationQuery.isLoading,
    requestLocation: requestLocation.mutateAsync,
    isRequesting: requestLocation.isPending,
  };
}
