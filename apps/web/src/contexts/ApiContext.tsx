import React, { createContext, useContext, ReactNode } from 'react';
import axios from 'axios';
import { Plant, Room, CareEvent, WeatherData, CalendarEvent, PlantWithRoom } from '@plantcare/types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// API service interface
interface ApiService {
  // Plants
  getPlants: () => Promise<PlantWithRoom[]>;
  getPlantsSortedByWatering: () => Promise<PlantWithRoom[]>;
  getPlant: (id: string) => Promise<Plant>;
  createPlant: (plant: Omit<Plant, 'id'>) => Promise<Plant>;
  updatePlant: (id: string, plant: Partial<Plant>) => Promise<Plant>;
  deletePlant: (id: string) => Promise<void>;
  waterPlant: (id: string) => Promise<Plant>;
  getPlantTips: (id: string) => Promise<{ plantId: string; plantName: string; tip: string; condition: string }>;

  // Rooms
  getRooms: () => Promise<Room[]>;
  getRoom: (id: string) => Promise<Room>;
  createRoom: (room: Omit<Room, 'id'>) => Promise<Room>;
  updateRoom: (id: string, room: Partial<Room>) => Promise<Room>;
  deleteRoom: (id: string) => Promise<void>;

  // Events
  getEvents: (completed?: boolean) => Promise<CareEvent[]>;
  getCalendarEvents: (start: string, end: string) => Promise<CalendarEvent[]>;
  completeEvent: (id: string) => Promise<CareEvent>;
  createEvent: (event: Omit<CareEvent, 'id'>) => Promise<CareEvent>;
  getPlantEvents: (plantId: string, limit?: number) => Promise<CareEvent[]>;
  getUpcomingEvents: () => Promise<CareEvent[]>;

  // Weather
  getWeather: (lat: number, lon: number) => Promise<WeatherData>;
  getWeatherRecommendations: (lat?: number, lon?: number) => Promise<{
    weather: WeatherData;
    recommendations: Array<{ type: string; message: string; icon: string }>;
  }>;
}

// Create the service implementation
const apiService: ApiService = {
  // Plants
  getPlants: async () => {
    const response = await api.get<PlantWithRoom[]>('/plants');
    return response.data;
  },

  getPlantsSortedByWatering: async () => {
    const response = await api.get<PlantWithRoom[]>('/plants/sorted/watering');
    return response.data;
  },

  getPlant: async (id: string) => {
    const response = await api.get<Plant>(`/plants/${id}`);
    return response.data;
  },

  createPlant: async (plant: Omit<Plant, 'id'>) => {
    const response = await api.post<Plant>('/plants', plant);
    return response.data;
  },

  updatePlant: async (id: string, plant: Partial<Plant>) => {
    const response = await api.put<Plant>(`/plants/${id}`, plant);
    return response.data;
  },

  deletePlant: async (id: string) => {
    await api.delete(`/plants/${id}`);
  },

  waterPlant: async (id: string) => {
    const response = await api.post<Plant>(`/plants/${id}/water`);
    return response.data;
  },

  getPlantTips: async (id: string) => {
    const response = await api.get(`/plants/${id}/tips`);
    return response.data;
  },

  // Rooms
  getRooms: async () => {
    const response = await api.get<Room[]>('/rooms');
    return response.data;
  },

  getRoom: async (id: string) => {
    const response = await api.get<Room>(`/rooms/${id}`);
    return response.data;
  },

  createRoom: async (room: Omit<Room, 'id'>) => {
    const response = await api.post<Room>('/rooms', room);
    return response.data;
  },

  updateRoom: async (id: string, room: Partial<Room>) => {
    const response = await api.put<Room>(`/rooms/${id}`, room);
    return response.data;
  },

  deleteRoom: async (id: string) => {
    await api.delete(`/rooms/${id}`);
  },

  // Events
  getEvents: async (completed?: boolean) => {
    const response = await api.get<CareEvent[]>('/events', {
      params: { completed },
    });
    return response.data;
  },

  getCalendarEvents: async (start: string, end: string) => {
    const response = await api.get<CalendarEvent[]>('/calendar', {
      params: { start, end },
    });
    return response.data;
  },

  completeEvent: async (id: string) => {
    const response = await api.post<CareEvent>(`/events/${id}/complete`);
    return response.data;
  },

  createEvent: async (event: Omit<CareEvent, 'id'>) => {
    const response = await api.post<CareEvent>('/events', event);
    return response.data;
  },

  getPlantEvents: async (plantId: string, limit?: number) => {
    const response = await api.get<CareEvent[]>(`/events/plant/${plantId}`, {
      params: { limit },
    });
    return response.data;
  },

  getUpcomingEvents: async () => {
    const response = await api.get<CareEvent[]>('/calendar/upcoming');
    return response.data;
  },

  // Weather
  getWeather: async (lat: number, lon: number) => {
    const response = await api.get<WeatherData>('/weather', {
      params: { lat, lon },
    });
    return response.data;
  },

  getWeatherRecommendations: async (lat?: number, lon?: number) => {
    const response = await api.get('/weather/recommendations', {
      params: { lat, lon },
    });
    return response.data;
  },
};

// Create context
const ApiContext = createContext<ApiService | null>(null);

// Provider component
interface ApiProviderProps {
  children: ReactNode;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  return <ApiContext.Provider value={apiService}>{children}</ApiContext.Provider>;
};

// Custom hook to use the API
export const useApi = (): ApiService => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

export default apiService;