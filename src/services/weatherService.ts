
export const weatherCity = async (city: string) => {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41";
    try {
        const response_city = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`)
        const data_city = await response_city.json();
        const latitude = data_city.results[0].latitude;
        const longitude = data_city.results[0].longitude;

        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        const data = await response.json();
        return data;
    } catch (error) {
    }
};

export const getWeatherCode = async (code: string) => {
    const url = ""
    try {
        const response = await fetch(url);
        const data = await response.text();
        return data;
    } catch (error) {
    }
};