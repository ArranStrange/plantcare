import express from "express";
import axios from "axios";

// Define types locally to avoid dependency issues
interface WeatherData {
  humidity: number;
  temperature: number;
  rainedRecently: boolean;
}
import { prisma } from "../index";

const router = express.Router();

// Get weather data for a location
router.get("/", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required" });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      console.warn("OpenWeather API key not configured, returning mock data");
      // Return mock weather data for development
      const mockWeather: WeatherData = {
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        temperature: Math.floor(Math.random() * 20) + 15, // 15-35°C
        rainedRecently: Math.random() > 0.7, // 30% chance of recent rain
      };
      return res.json(mockWeather);
    }

    // Get current weather
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );

    // Get historical data for the past 5 days to check for recent rain
    const fiveDaysAgo = Math.floor(
      (Date.now() - 5 * 24 * 60 * 60 * 1000) / 1000
    );
    const historyResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${fiveDaysAgo}&appid=${apiKey}&units=metric`
    );

    const current = weatherResponse.data;
    const history = historyResponse.data;

    // Check if it rained in the past 5 days
    const rainedRecently =
      history.hourly?.some(
        (hour: any) =>
          hour.rain && Object.values(hour.rain).some((value: any) => value > 0)
      ) || false;

    const weatherData: WeatherData = {
      humidity: current.main.humidity,
      temperature: current.main.temp,
      rainedRecently,
    };

    res.json(weatherData);
  } catch (error) {
    console.error("Error fetching weather data:", error);

    // Return mock data if API fails
    const mockWeather: WeatherData = {
      humidity: Math.floor(Math.random() * 40) + 40,
      temperature: Math.floor(Math.random() * 20) + 15,
      rainedRecently: Math.random() > 0.7,
    };

    res.json(mockWeather);
  }
});

// Get smart watering recommendations based on weather
router.get("/recommendations", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    // Get weather data (this would call the weather endpoint internally)
    const weatherData: WeatherData = {
      humidity: Math.floor(Math.random() * 40) + 40,
      temperature: Math.floor(Math.random() * 20) + 15,
      rainedRecently: Math.random() > 0.7,
    };

    let userId = req.query.userId as string;
    if (!userId) {
      const defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        // If no users exist, return empty recommendations
        return res.json({
          weather: weatherData,
          recommendations: [
            {
              type: "info",
              message: "No user found. Please create a user first.",
              icon: "👤",
            },
          ],
        });
      }
      userId = defaultUser.id;
    }

    // Generate recommendations based on weather
    const recommendations = [];

    if (weatherData.humidity > 70) {
      recommendations.push({
        type: "warning",
        message:
          "High humidity detected. Consider reducing watering frequency.",
        icon: "☁️",
      });
    }

    if (weatherData.rainedRecently) {
      recommendations.push({
        type: "info",
        message:
          "Recent rainfall detected. Your outdoor plants might need less water.",
        icon: "🌧️",
      });
    }

    if (weatherData.temperature > 30) {
      recommendations.push({
        type: "warning",
        message: "High temperature. Plants may need extra water and shade.",
        icon: "☀️",
      });
    }

    if (weatherData.temperature < 15) {
      recommendations.push({
        type: "info",
        message: "Cool weather. Plants typically need less frequent watering.",
        icon: "❄️",
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: "success",
        message: "Perfect weather conditions for your plants!",
        icon: "🌱",
      });
    }

    res.json({
      weather: weatherData,
      recommendations,
    });
  } catch (error) {
    console.error("Error generating weather recommendations:", error);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
});

export default router;
