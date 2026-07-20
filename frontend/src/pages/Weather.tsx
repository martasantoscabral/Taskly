import { useState, useEffect, useCallback } from 'react';

interface WeatherData {
  city: string;
  latitude: number;
  longitude: number;
  temperature: number;
}

export const Weather = () => {

    const [weather, setWeather] = useState<WeatherData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWeather = useCallback(() => {
        setLoading(true);
        //setError(null);

        fetch('http://localhost:3000/api/weather/:city')
        .then(res => { if (!res.ok) throw new Error(`Erro ${res.status}`); return res.json(); })
        .then((data: WeatherData[]) => {setWeather(data); setLoading(false); })

        }, []);

    useEffect(() => { fetchWeather(); }, [fetchWeather]);

    if (loading) return <div className="text-center animate-pulse py-20">A carregar
    clima...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weather.map(w => (
                <div>
                    <h3 className="text-base font-bold text-slate-800">{w.city}</h3>
                    <h3 className="text-xs text-gray-400 mt-1 font-mono">Cº: {w.temperature}</h3>
                </div>
            ))}
        </div>
        );
    };

export default Weather;