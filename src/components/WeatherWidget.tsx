import React, { useEffect, useState } from 'react';

type WeatherResponse = {
  location: {
    name: string;
    region: string;
    country: string;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: { text: string; icon: string };
    wind_kph: number;
    humidity: number;
    pressure_mb: number;
    precip_mm: number;
    cloud: number;
    feelslike_c: number;
    uv: number;
  };
};

interface WeatherWidgetProps {
  query?: string; // city or lat,lon supported by API
  aqi?: 'yes' | 'no';
  className?: string;
}

const DEFAULT_URL = '/api/weather/v1/current.json?key=9fee085e44764516b9c72127250510&q=London&aqi=yes';

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ query, aqi = 'yes', className }) => {
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    // Try to get browser geolocation if no explicit query was provided
    if (!query && typeof window !== 'undefined' && 'navigator' in window && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!mounted) return;
          setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        () => {
          // Ignore errors and fallback to default city
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    }

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = query
          ? `/api/weather/v1/current.json?key=9fee085e44764516b9c72127250510&q=${encodeURIComponent(query)}&aqi=${aqi}`
          : coords
          ? `/api/weather/v1/current.json?key=9fee085e44764516b9c72127250510&q=${coords.lat},${coords.lon}&aqi=${aqi}`
          : DEFAULT_URL;
        const timeoutId = window.setTimeout(() => controller.abort(), 8000);
        const res = await fetch(url, { signal: controller.signal });
        window.clearTimeout(timeoutId);
        if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);
        const json = (await res.json()) as WeatherResponse;
        if (mounted) setData(json);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load weather');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchWeather();
    const intervalId = window.setInterval(fetchWeather, 5 * 60 * 1000); // refresh every 5 min
    return () => {
      mounted = false;
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, [query, aqi, coords]);

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 border border-gray-100 ${className || ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-3">
            {data?.current?.condition?.icon && (
              <img
                src={(() => {
                  const icon = data.current.condition.icon;
                  if (!icon) return '';
                  const absolute = icon.startsWith('http') ? icon : `https:${icon}`;
                  try {
                    const u = new URL(absolute);
                    return `/api/weather-icon${u.pathname}`;
                  } catch {
                    return absolute;
                  }
                })()}
                alt={data.current.condition.text}
                className="w-10 h-10"
              />
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">{data?.location?.name || 'Weather'}</p>
            <p className="text-lg font-semibold text-gray-900">
              {loading ? 'Loading…' : error ? 'Unavailable' : `${data?.current?.temp_c ?? '--'}°C`}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-700">{data?.current?.condition?.text}</p>
          <p className="text-xs text-gray-500">Feels like {data?.current?.feelslike_c ?? '--'}°C</p>
        </div>
      </div>
      {error && (
        <div className="mt-3 text-xs text-red-600">
          {error.includes('AbortError') ? 'Weather request timed out.' : error}
          <button
            className="ml-2 px-2 py-1 bg-blue-600 text-white rounded"
            onClick={() => {
              setError(null);
              setData(null);
              setLoading(true);
              // Trigger immediate refresh by toggling coords slightly or calling fetch via state change
              // Use a micro task to call the same effect-bound fetch
              setTimeout(() => setCoords((c) => (c ? { ...c } : c)), 0);
            }}
          >
            Retry
          </button>
        </div>
      )}
      <div className="grid grid-cols-3 gap-4 mt-4 text-xs text-gray-600">
        <div>
          <p className="text-gray-500">Wind</p>
          <p className="font-medium">{data?.current?.wind_kph ?? '--'} kph</p>
        </div>
        <div>
          <p className="text-gray-500">Humidity</p>
          <p className="font-medium">{data?.current?.humidity ?? '--'}%</p>
        </div>
        <div>
          <p className="text-gray-500">Pressure</p>
          <p className="font-medium">{data?.current?.pressure_mb ?? '--'} mb</p>
        </div>
      </div>
      <div className="mt-3 text-[10px] text-gray-400">Updated: {data?.location?.localtime || '-'}</div>
      <div className="mt-2 text-[10px] text-gray-400">
        Source: WeatherAPI — http://api.weatherapi.com/v1/current.json
      </div>
    </div>
  );
};

export default WeatherWidget;


