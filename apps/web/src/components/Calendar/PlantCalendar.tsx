import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar';
import moment from 'moment';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import { CalendarEvent } from '@plantcare/types';
import { useApi } from '../../contexts/ApiContext';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface PlantCalendarProps {
  onEventClick?: (event: CalendarEvent) => void;
}

const PlantCalendar: React.FC<PlantCalendarProps> = ({ onEventClick }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>(Views.MONTH);
  const api = useApi();
  const theme = useTheme();

  useEffect(() => {
    fetchEvents();
  }, [currentDate, view]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date range based on current view
      const start = moment(currentDate).startOf(view === Views.MONTH ? 'month' : 'week').format('YYYY-MM-DD');
      const end = moment(currentDate).endOf(view === Views.MONTH ? 'month' : 'week').format('YYYY-MM-DD');

      const calendarEvents = await api.getCalendarEvents(start, end);
      
      // Transform events for react-big-calendar
      const transformedEvents = calendarEvents.map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));

      setEvents(transformedEvents);
    } catch (err) {
      console.error('Failed to fetch calendar events:', err);
      setError('Failed to load calendar events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (date: Date) => {
    setCurrentDate(date);
  };

  const handleView = (newView: View) => {
    setView(newView);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = theme.palette.primary.main;
    
    if (event.completed) {
      backgroundColor = theme.palette.info.main;
    } else {
      const eventDate = new Date(event.start);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (eventDate < today) {
        backgroundColor = theme.palette.error.main; // Overdue
      } else if (eventDate.toDateString() === today.toDateString()) {
        backgroundColor = theme.palette.warning.main; // Due today
      }
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: event.completed ? 0.7 : 1,
        color: 'white',
        border: 'none',
        fontSize: '0.875rem',
        fontWeight: 500,
      },
    };
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 3, height: 600 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Plant Care Calendar
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ height: 500 }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            onNavigate={handleNavigate}
            onView={handleView}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            view={view}
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            step={60}
            showMultiDayTimes
            components={{
              toolbar: (props) => (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 2,
                  flexWrap: 'wrap',
                  gap: 1,
                }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <button
                      onClick={() => props.onNavigate('PREV')}
                      style={{
                        padding: '8px 16px',
                        border: `1px solid ${theme.palette.primary.main}`,
                        backgroundColor: 'transparent',
                        color: theme.palette.primary.main,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => props.onNavigate('TODAY')}
                      style={{
                        padding: '8px 16px',
                        border: `1px solid ${theme.palette.primary.main}`,
                        backgroundColor: theme.palette.primary.main,
                        color: 'white',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => props.onNavigate('NEXT')}
                      style={{
                        padding: '8px 16px',
                        border: `1px solid ${theme.palette.primary.main}`,
                        backgroundColor: 'transparent',
                        color: theme.palette.primary.main,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      Next
                    </button>
                  </Box>
                  
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {props.label}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {[Views.MONTH, Views.WEEK, Views.DAY].map((viewName) => (
                      <button
                        key={viewName}
                        onClick={() => props.onView(viewName)}
                        style={{
                          padding: '8px 16px',
                          border: `1px solid ${theme.palette.primary.main}`,
                          backgroundColor: props.view === viewName ? theme.palette.primary.main : 'transparent',
                          color: props.view === viewName ? 'white' : theme.palette.primary.main,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 500,
                          textTransform: 'capitalize',
                        }}
                      >
                        {viewName}
                      </button>
                    ))}
                  </Box>
                </Box>
              ),
            }}
            tooltipAccessor={(event) => `${event.title} - ${event.plantName}`}
            popup
            popupOffset={30}
          />
        </Box>
      )}
    </Paper>
  );
};

export default PlantCalendar;