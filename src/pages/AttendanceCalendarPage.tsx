import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Plus } from 'lucide-react';
import './AttendanceCalendar.css';
import { attendanceAPI } from '@/lib/api';
import { Drawer } from '@/components/ui/Drawer';
import { DailyEntryForm } from '@/components/attendance/DailyEntryForm';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import type { AttendanceEntry } from '@/types';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: AttendanceEntry;
}

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export const AttendanceCalendarPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const { data: attendanceEntries = [], refetch: refetchMonth } = useQuery({
    queryKey: ['attendance', selectedMonth],
    queryFn: () => attendanceAPI.getAll(selectedMonth),
  });

  const { data: dailyEntries = [], refetch: refetchDaily } = useQuery({
    queryKey: ['attendance-daily', selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''],
    queryFn: () =>
      selectedDate ? attendanceAPI.getByDate(format(selectedDate, 'yyyy-MM-dd')) : Promise.resolve([]),
    enabled: !!selectedDate,
  });

  // Ensure arrays for safety
  const entriesList = Array.isArray(attendanceEntries) ? attendanceEntries : [];
  const dailyEntriesList = Array.isArray(dailyEntries) ? dailyEntries : [];

  // Transform entries for calendar
  const calendarEvents: CalendarEvent[] = entriesList.map((entry) => {
    const porterName = typeof entry.porter === 'object' ? (entry.porter as unknown as {name: string}).name : 'Unknown';
    const carrierName = typeof entry.carrier === 'object' ? ((entry.carrier as unknown as {name: string}).name || 'unknown').replace(/-/g, ' ') : 'unknown';
    
    // Date is already stored in local timezone, just parse it directly
    const entryDate = new Date(entry.date);
    
    return {
      id: entry.id,
      title: `${porterName} - ${carrierName}`,
      start: entryDate,
      end: entryDate,
      resource: entry,
    };
  });

  const handleSelectSlot = (slotInfo: { start: Date }) => {
    setSelectedDate(slotInfo.start);
    setIsDrawerOpen(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedDate(event.start);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedDate(null);
  };

  const handleEntryAdded = () => {
    // Refetch both the monthly calendar and the daily entries
    refetchMonth();
    if (selectedDate) {
      refetchDaily();
    }
  };

  const onNavigate = (date: Date) => {
    const newMonth = format(date, 'yyyy-MM');
    if (newMonth !== selectedMonth) {
      setSelectedMonth(newMonth);
    }
  };

  const handleNewEntry = () => {
    setSelectedDate(new Date());
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Calendar</h1>
          <p className="text-gray-600 mt-1">Track and manage daily porter commutes</p>
        </div>
        <Button onClick={handleNewEntry}>
          <Plus className="w-4 h-4 mr-2" />
          New Entry
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6" style={{ height: '700px' }}>
        <BigCalendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          onNavigate={onNavigate}
          selectable
          views={['month']}
          defaultView="month"
          dayPropGetter={(date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const hasEntries = calendarEvents.some(
              (event) => format(event.start, 'yyyy-MM-dd') === dateStr
            );
            return hasEntries
              ? {
                  className: 'has-entries',
                  style: {
                    position: 'relative' as const,
                  },
                }
              : {};
          }}
          eventPropGetter={(event) => {
            const carrierName = typeof event.resource.carrier === 'object' 
              ? (event.resource.carrier as unknown as {name: string}).name
              : event.resource.carrier;
            const carrierColors: Record<string, string> = {
              'porter': '#3b82f6',
              'small-donkey': '#10b981',
              'pickup-truck': '#f59e0b',
            };
            return {
              style: {
                backgroundColor: carrierColors[carrierName] || '#6b7280',
                borderRadius: '4px',
                border: 'none',
                fontSize: '12px',
              },
            };
          }}
        />
      </div>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Daily Entries'}
        width="xl"
      >
        <div className="space-y-6">
          {/* Daily Entries List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Entries for this day ({dailyEntriesList.length})
            </h3>
            {dailyEntriesList.length > 0 ? (
              <div className="space-y-3">
                {dailyEntriesList.map((entry) => {
                  const porterName = typeof entry.porter === 'object' ? (entry.porter as unknown as {name: string}).name : 'Unknown';
                  const carrierName = typeof entry.carrier === 'object' 
                    ? ((entry.carrier as unknown as {name: string}).name || 'unknown').replace(/-/g, ' ') 
                    : 'unknown';
                  
                  return (
                    <div
                      key={entry.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{porterName}</p>
                          <p className="text-sm text-gray-600 capitalize">{carrierName}</p>
                        </div>
                        <span className="text-lg font-semibold text-blue-600">
                          {formatCurrency(entry.computedCost || 0)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-2">{entry.task || 'No description'}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No entries for this day</p>
            )}
          </div>

          {/* Add New Entry Form */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Entry</h3>
            <DailyEntryForm
              defaultDate={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined}
              onSuccess={handleEntryAdded}
            />
          </div>
        </div>
      </Drawer>
    </div>
  );
};

