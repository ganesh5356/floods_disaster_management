import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { WeatherData } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Sun, Sunset, LoaderCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const WeatherWidget: React.FC = () => {
    const { t } = useTranslation();
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { user } = useAuth();
    const apiKey = ((import.meta as any).env?.VITE_OPENWEATHER_API_KEY) || '157f8f75e7ae0a43b112c56f6cb5fd81';

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                let url: string;
                if (user?.location && user.location.length === 2) {
                    const [lat, lon] = user.location;
                    url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
                } else {
                    // Fallback to Ballari if location not available
                    url = `https://api.openweathermap.org/data/2.5/weather?q=ballari&appid=${apiKey}&units=metric`;
                }
                const { data } = await axios.get(url);
                setWeather({
                    temp: data.main.temp,
                    feels_like: data.main.feels_like,
                    humidity: data.main.humidity,
                    description: data.weather?.[0]?.description || 'n/a',
                    icon: `https://openweathermap.org/img/wn/${data.weather?.[0]?.icon || '01d'}@2x.png`,
                    wind_speed: data.wind.speed,
                    sunrise: data.sys.sunrise * 1000,
                    sunset: data.sys.sunset * 1000,
                    name: data.name,
                    country: data.sys.country,
                });
                setLoading(false);
            } catch (err: any) {
                console.error('Error fetching weather data:', err);
                setError('Could not fetch weather data.');
                setLoading(false);
            }
        };

        fetchWeather();
    }, [t, user, apiKey]);

    if (loading) {
        return (
            <div className="p-4 bg-blue-50 rounded-lg text-center text-blue-700">
                <LoaderCircle className="animate-spin w-6 h-6 mx-auto mb-2" />
                <p className="text-sm font-medium">{t('weather_loading')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 rounded-lg text-center text-red-700">
                <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm font-medium">{error}</p>
            </div>
        );
    }

    if (!weather) return null;

    return (
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4 rounded-lg shadow-lg">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-lg font-bold">{weather.name}{weather.country ? `, ${weather.country}` : ''}</p>
                    <p className="text-sm capitalize opacity-80">{weather.description}</p>
                </div>
                <img src={weather.icon} alt={weather.description} className="w-14 h-14 -mt-2 -mr-2" />
            </div>
            <div className="flex items-end justify-between mt-2">
                <p className="text-5xl font-bold">{Math.round(weather.temp)}°C</p>
                <div className="text-right text-xs space-y-1 opacity-90">
                    <p>{t('weather_feels_like')}: {Math.round(weather.feels_like)}°</p>
                    <p>{t('weather_humidity')}: {weather.humidity}%</p>
                    <p>{t('weather_wind')}: {weather.wind_speed.toFixed(1)} m/s</p>
                </div>
            </div>
            <div className="flex justify-between text-xs mt-4 pt-3 border-t border-white/20">
                <div className="flex items-center space-x-1">
                    <Sun className="w-4 h-4" />
                    <span>{t('weather_sunrise')}: {format(weather.sunrise, 'p')}</span>
                </div>
                <div className="flex items-center space-x-1">
                    <Sunset className="w-4 h-4" />
                    <span>{t('weather_sunset')}: {format(weather.sunset, 'p')}</span>
                </div>
            </div>
        </div>
    );
};

export default WeatherWidget;
