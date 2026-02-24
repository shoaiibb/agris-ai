/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import axios from 'axios';

const WEATHER_API_KEY = process.env.VITE_WEATHER_API_KEY;
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

export interface WeatherData {
  humidity: number;
  rain: boolean;
  description: string;
}

export async function getWeatherData(city: string): Promise<WeatherData | null> {
  if (!WEATHER_API_KEY || WEATHER_API_KEY === 'MY_WEATHER_API_KEY') {
    console.warn('Weather API key not configured. Skipping weather-aware features.');
    return null;
  }

  try {
    const response = await axios.get(WEATHER_API_URL, {
      params: {
        q: city,
        appid: WEATHER_API_KEY,
        units: 'metric',
      },
    });

    const data = response.data;
    return {
      humidity: data.main.humidity,
      rain: data.weather.some((w: any) => w.main === 'Rain'),
      description: data.weather[0].description,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}
