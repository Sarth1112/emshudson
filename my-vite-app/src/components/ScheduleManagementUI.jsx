import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ScheduleManagement = ({ schedule = {}, onGenerateSchedule, onUpdateSchedule }) => {
  const [editMode, setEditMode] = useState({});
  const [editValue, setEditValue] = useState("");
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  // Guard against null/undefined schedule
  if (!schedule || Object.keys(schedule).length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Generated Schedule</span>
            <Button 
              onClick={onGenerateSchedule}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Generate New Schedule
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No schedule generated yet. Click the button above to generate a new schedule.
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleEdit = (employeeId, day) => {
    setEditMode({ employeeId, day });
    const currentHours = schedule[employeeId]?.schedule?.[day]?.hours ?? 0;
    setEditValue(currentHours.toString());
  };

  const handleSave = (employeeId, day) => {
    if (onUpdateSchedule && !isNaN(parseFloat(editValue))) {
      onUpdateSchedule(employeeId, day, parseFloat(editValue));
    }
    setEditMode({});
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Generated Schedule</span>
          <Button 
            onClick={onGenerateSchedule}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Generate New Schedule
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-2 border-b">Employee</th>
                {days.map(day => (
                  <th key={day} className="p-2 border-b capitalize">
                    {day}
                  </th>
                ))}
                <th className="p-2 border-b">Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(schedule).map(([employeeId, data]) => {
                if (!data?.schedule) return null;
                
                const totalHours = Object.values(data.schedule)
                  .reduce((sum, day) => sum + (day?.hours ?? 0), 0);
                
                return (
                  <tr key={employeeId} className="hover:bg-gray-50">
                    <td className="p-2 border-b font-medium">
                      {data.employeeName || 'Unknown Employee'}
                    </td>
                    {days.map(day => {
                      const hours = data.schedule[day]?.hours ?? 0;
                      const isEditing = editMode.employeeId === employeeId && editMode.day === day;
                      
                      return (
                        <td key={day} className="p-2 border-b text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-2">
                              <Input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-20 text-center"
                                min="0"
                                max="24"
                                step="0.5"
                              />
                              <Button 
                                size="sm"
                                className="bg-green-500 hover:bg-green-600 text-white"
                                onClick={() => handleSave(employeeId, day)}
                              >
                                Save
                              </Button>
                            </div>
                          ) : (
                            <div 
                              className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                              onClick={() => handleEdit(employeeId, day)}
                            >
                              {hours.toFixed(1)}h
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-2 border-b text-center font-medium">
                      {totalHours.toFixed(1)}h
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleManagement;




