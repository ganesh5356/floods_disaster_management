import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// Ensures user.location is populated post-login by requesting geolocation if absent
export default function useEnsureLocation() {
  const { user, login } = useAuth();

  useEffect(() => {
    if (!user) return;
    const hasLocation = Array.isArray(user.location) && user.location.length === 2;
    if (hasLocation) return;
    if (!navigator || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        login({
          ...user,
          permissions: { ...user.permissions, location: true },
          location: [position.coords.latitude, position.coords.longitude],
        });
      },
      () => {
        login({
          ...user,
          permissions: { ...user.permissions, location: false },
        });
      }
    );
  }, [user, login]);
}


