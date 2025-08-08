export interface Plant {
  id: string;
  name: string;
  species: string;
  photoUrl?: string;
  waterFrequency: number;
  lastWatered?: string;
  nextWaterDate?: string;
  careNotes?: string;
  roomId?: string;
  userId: string;
}

export interface Room {
  id: string;
  name: string;
  userId: string;
}

export interface CareEvent {
  id: string;
  plantId: string;
  userId: string;
  type: 'watering' | 'fertilising' | 'repotting';
  date: string;
  completed: boolean;
}

export interface WeatherData {
  humidity: number;
  temperature: number;
  rainedRecently: boolean;
}

export interface User {
  id: string;
  email: string;
}

export interface PlantWithRoom extends Plant {
  room?: Room;
}

export interface CareEventWithPlant extends CareEvent {
  plant: Plant;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  plantId: string;
  plantName: string;
  type: 'watering' | 'fertilising' | 'repotting';
  completed: boolean;
} 