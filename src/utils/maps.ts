export type TravelMode = 'driving' | 'walking' | 'bicycling' | 'transit';

export function openGoogleMapsDirections(
  destination: [number, number],
  options?: { travelMode?: TravelMode; openInNewTab?: boolean }
) {
  const [lat, lng] = destination;
  const travelMode = options?.travelMode ?? 'driving';
  const buildUrl = (origin: string) => `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(`${lat},${lng}`)}&travelmode=${encodeURIComponent(travelMode)}&dir_action=navigate`;

  const navigateTo = (url: string) => {
    if (options?.openInNewTab) {
      const win = window.open(url, '_blank');
      if (!win) window.location.href = url;
    } else {
      window.location.href = url;
    }
  };

  try {
    if (!navigator || !navigator.geolocation) {
      navigateTo(buildUrl('Current Location'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const origin = `${pos.coords.latitude},${pos.coords.longitude}`;
        navigateTo(buildUrl(origin));
      },
      () => navigateTo(buildUrl('Current Location')),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
  } catch {
    navigateTo(buildUrl('Current Location'));
  }
}



