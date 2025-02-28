//Api Codes
const express = require("express");
const mongoose = require('mongoose');
const cors = require("cors");
const { spawn } = require('child_process');
const path = require('path');
const EmployeesModel = require('./models/EmployeesSchema')
const scheduleModel = require('./models/ScheduleSchema')


const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/Employees', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  //Schema for the Employee Availability.
  const getAvailabilityModel = (termYear) => {
    const modelName = `${termYear}`;
    try {
        return mongoose.model(modelName);
    } catch {
        const AvailabilitySchema = new mongoose.Schema({
            employeeId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Employee',
                required: true
            },
            scheduleId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Schedule',
                required: true
            },
            availability: {
                monday: { from: String, to: String },
                tuesday: { from: String, to: String },
                wednesday: { from: String, to: String },
                thursday: { from: String, to: String },
                friday: { from: String, to: String },
                saturday: { from: String, to: String },
                sunday: { from: String, to: String }
            }
        });
        return mongoose.model(modelName, AvailabilitySchema);
    }
};

//Schedule Assignments code:

const scheduleAssignmentSchema = new mongoose.Schema({
    scheduleId: { type: String, required: true },
    assignments: {
      type: Map,
      of: {
        hours: {
          monday: { hours: Number, from: String, to: String },
          tuesday: { hours: Number, from: String, to: String },
          wednesday: { hours: Number, from: String, to: String },
          thursday: { hours: Number, from: String, to: String },
          friday: { hours: Number, from: String, to: String },
          saturday: { hours: Number, from: String, to: String },
          sunday: { hours: Number, from: String, to: String }
        },
        totalHours: Number
      }
    }
  });
  
  const ScheduleAssignmentModel = mongoose.model('ScheduleAssignment', scheduleAssignmentSchema);
  
//Fetch schedule assignments
app.get('/schedules/:id/assignments', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Find existing assignments
      const assignment = await ScheduleAssignmentModel.findOne({ scheduleId: id });
      
      if (!assignment) {
        return res.json({}); // Return empty object if no assignments exist
      }
      
      // Convert Map to regular object for response
      const assignmentsObject = {};
      assignment.assignments.forEach((value, key) => {
        assignmentsObject[key] = value;
      });
      
      res.json(assignmentsObject);
    } catch (error) {
      console.error('Error fetching schedule assignments:', error);
      res.status(500).json({ error: 'Failed to fetch schedule assignments' });
    }
  });

// Save schedule assignments
app.post('/schedules/:id/assignments', async (req, res) => {
    try {
      const { id } = req.params;
      const assignments = req.body;
      
      // Validate total hours for each employee
      for (const [employeeId, schedule] of Object.entries(assignments)) {
        if (schedule.totalHours > 24) {
          return res.status(400).json({ 
            error: `Employee ${employeeId} exceeds maximum weekly hours (24)`
          });
        }
        
        // Validate daily hours
        for (const day of Object.values(schedule.hours)) {
          if (day.hours > 8) {
            return res.status(400).json({ 
              error: `Employee ${employeeId} exceeds maximum daily hours (8)`
            });
          }
        }
      }
      
      // Convert assignments object to Map for storage
      const assignmentsMap = new Map(Object.entries(assignments));
      
      // Update or create assignment document
      const updatedAssignment = await ScheduleAssignmentModel.findOneAndUpdate(
        { scheduleId: id },
        { 
          scheduleId: id,
          assignments: assignmentsMap
        },
        { 
          new: true,
          upsert: true,
          runValidators: true
        }
      );
      
      // Convert Map back to regular object for response
      const responseObject = {};
      updatedAssignment.assignments.forEach((value, key) => {
        responseObject[key] = value;
      });
      
      res.json(responseObject);
    } catch (error) {
      console.error('Error saving schedule assignments:', error);
      res.status(500).json({ error: 'Failed to save schedule assignments' });
    }
  });




//ManagerDashboard.jsx: /Employee Availabilities/ :- Get Employees Availabilities from database
app.get('/all-availabilities', async (req, res) => {
    try {
        // First get all schedules to know which collections to check
        const schedules = await scheduleModel.find({});
        const allAvailabilities = [];

        // Get all employees for joining with availability data
        const employees = await EmployeesModel.find({});
        const employeeMap = new Map(employees.map(emp => [emp._id.toString(), emp]));

        // For each schedule, get its availabilities
        for (const schedule of schedules) {
            const collectionName = `${schedule.term}${schedule.year}`;
            try {
                const AvailabilityModel = getAvailabilityModel(collectionName);
                const availabilities = await AvailabilityModel.find({});
                
                // Enhance availability data with schedule and employee info
                const enhancedAvailabilities = availabilities.map(avail => ({
                    scheduleTerm: schedule.term,
                    scheduleYear: schedule.year,
                    employeeName: employeeMap.get(avail.employeeId.toString())?.name || 'Unknown',
                    employeeId: employeeMap.get(avail.employeeId.toString())?.id || 'Unknown',
                    availability: avail.availability
                }));

                allAvailabilities.push(...enhancedAvailabilities);
            } catch (error) {
                console.log(`No availabilities found for ${collectionName}`);
            }
        }

        res.json(allAvailabilities);
    } catch (error) {
        console.error('Error fetching all availabilities:', error);
        res.status(500).json({ error: error.message });
    }
});

// EmployeeDashboard: /Provide Availability/ :- Fetching availability hours using scheduleId and employeeId. Presenting Cards. 
app.get('/availability/:scheduleId/:employeeId', async (req, res) => {
    try {
      const { scheduleId, employeeId } = req.params;
      
      // First get the schedule to determine which collection to query
      const schedule = await scheduleModel.findById(scheduleId);
      if (!schedule) {
        return res.status(404).json({ error: 'Schedule not found' });
      }
  
      // Get the collection name based on term and year
      const collectionName = `${schedule.term}${schedule.year}`;
      
      // Get the availability model for this schedule
      const AvailabilityModel = getAvailabilityModel(collectionName);
      
      // Find the availability entry for this employee and schedule
      const availability = await AvailabilityModel.findOne({
        employeeId: employeeId,
        scheduleId: scheduleId
      });
  
      // If no availability found, return null (frontend will show "Not Submitted")
      if (!availability) {
        return res.json(null);
      }
  
      res.json(availability);
    } catch (error) {
      console.error('Error fetching availability:', error);
      res.status(500).json({ error: error.message });
    }
  });

  
//ManagerDashboard:- /Shedule Building/ :- Deleting the Schedule using ScheduleId, Also drops the collection of stored employee availability.
  app.delete('/schedules/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await ScheduleAssignmentModel.deleteOne({ scheduleId: id });
        // First find the schedule to get its term and year
        const schedule = await scheduleModel.findById(id);
        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        // Match the exact collection name format
        const collectionName = `${schedule.term.toLowerCase()}${schedule.year}`;

        
        try {
            // Get reference to the Employees database
            const db = mongoose.connection.useDb('Employees');
            
            // Check if collection exists in the Employees database
            const collections = await db.db.listCollections().toArray();
            const collectionExists = collections.some(col => col.name === collectionName);

            if (collectionExists) {
                // Drop the collection from the Employees database
                await db.db.dropCollection(collectionName);
                console.log(`Successfully dropped collection: ${collectionName} from Employees database`);
            } else {
                console.log(`Collection ${collectionName} does not exist in Employees database`);
            }

            // Debug logging
            console.log('Current collections in Employees database:');
            const remainingCollections = await db.db.listCollections().toArray();
            console.log(remainingCollections.map(col => col.name));

        } catch (error) {
            console.error('Error handling collection drop:', error);
            console.log(`Failed to drop collection ${collectionName} from Employees database:`, error);
        }

        // Delete the schedule
        await scheduleModel.findByIdAndDelete(id);

        res.status(200).json({ 
            message: 'Schedule and associated availability collection deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting schedule:', error);
        res.status(500).json({ error: 'Failed to delete schedule' });
    }
});


//EmployeeDashboard:- /Provide Availability/ :- Creating or Updating Availability Data in mongodb. Using ScheduleId and employeeId.
app.post('/availability/:scheduleId', async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const { employeeId, availability } = req.body;
        
        console.log('Received data:', { scheduleId, employeeId, availability });
    
        const schedule = await scheduleModel.findById(scheduleId);
        console.log('Found schedule:', schedule);
    
        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }
    
        const collectionName = `${schedule.term}${schedule.year}`;
        console.log('Collection name:', collectionName);
    
        const AvailabilityModel = getAvailabilityModel(collectionName);
        
        // Find and update existing availability or create new one if doesn't exist
        const updatedAvailability = await AvailabilityModel.findOneAndUpdate(
            { 
                employeeId,
                scheduleId
            },
            {
                employeeId,
                scheduleId,
                availability
            },
            {
                new: true, // Return the updated document
                upsert: true, // Create a new document if one doesn't exist
                runValidators: true // Run Schema validations on update
            }
        );
    
        console.log('Updated/Created availability:', updatedAvailability);
        
        res.status(200).json(updatedAvailability);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: error.message });
    }
});
  

//ManagerDashboard:- /Schedule Building/ :- Validation Hours submitted from frontend, Storing data into Database using Schema model.
app.post('/schedules', async (req, res) => {
    try {
      const schedule = new scheduleModel(req.body);
      await schedule.save();
      res.status(201).json(schedule);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
// Update schedule (NEW ENDPOINT)
app.put('/schedules/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const updatedData = req.body;
      const existingSchedule = await scheduleModel.findById(id);
      if (!existingSchedule) {
          return res.status(404).json({ error: 'Schedule not found' });
      }
      const updatedSchedule = await scheduleModel.findByIdAndUpdate(
          id,
          {
              term: updatedData.term,
              year: updatedData.year,
              shiftHours: updatedData.shiftHours,
              kitchenClasses: updatedData.kitchenClasses,
              itvClasses: updatedData.itvClasses,
              employeeAvailability: updatedData.employeeAvailability || []
          },
          { new: true, runValidators: true }
      );
      console.log('Updated schedule:', updatedSchedule);
      res.status(200).json(updatedSchedule);
  } catch (error) {
      console.error('Error updating schedule:', error);
      res.status(500).json({ error: error.message });
  }
});

//ManagerDashboard:- /Schedule Building/ :- Fetch all the validation Schedule to see on default Schedule Building.
  app.get('/schedules', async (req, res) => {
    try {
      const schedules = await scheduleModel.find({});
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

//Register Page:- Storing user data to database
app.post('/register', async (req, res) => {
    try {
        // Check if the ID already exists
        const existingEmployeeById = await EmployeesModel.findOne({ id: req.body.id });
        if (existingEmployeeById) {
            return res.status(409).json({ error: 'ID already exists' });
        }

        // If ID is unique, attempt to create the new employee
        const newEmployee = await EmployeesModel.create(req.body);
        res.status(201).json(newEmployee);
    } catch (err) {
        // Check for duplicate email error
        if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        // General server error
        console.error('Server Error:', err); // Log for debugging
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//Login Page: Allowing registerd user to login with credentials.
app.post('/login', async (req,res) => {
    const { email, password } = req.body;

    if (email === 'admin@hccc.edu' && password === 'admin123') {
        return res.status(200).json({role:'admin'});
    }

    try {
        const employee = await EmployeesModel.findOne({email, password});
        if(employee) {
            res.status(200).json({
                role: 'employee',
                employeeId: employee._id // Send employee ID
            });
        } else {
            res.status(401).json({error: 'Invalid email or password'});
        }
    } catch (err) {
        res.status(500).json({error: 'server error'});
    }
});


//Reset pass Page: Allowing users to reset the password.
app.post('/reset-password', (req, res) => {
    const { email, id, dateOfBirth } = req.body;
    const isoDateOfBirth = new Date(dateOfBirth).toISOString();

    EmployeesModel.findOne({ email,id,dateOfBirth: isoDateOfBirth})
        .then(employee => {
            if (employee){
                res.status(200).json({message: 'User Verified'});

            } else {
                res.status(404).json({ error: 'User not found. Please check your Credentials'});

            }
        })

        .catch(err=> {
            console.error('Error:', err);
            res.status(500).json({ error: 'Internal Server Error'});
        });


});
app.post('/set-new-password',(req,res) => {

    const { email, newPassword } = req.body;
    EmployeesModel.findOneAndUpdate({ email }, { password: newPassword })
    .then(() => res.status(200).json({ message: "Password reset successfully" }))
    .catch(err => res.status(500).json({ error: err.message }));
})      

//ManagerDashboard: Fetching Employees details from the database.
app.get('/employees',(req,res) => {
    EmployeesModel.find({})
        .then(employees => res.json(employees))
        .catch(err => res.status(500).json({error: 'Error fetching employees'}));
});

//ManagerDashbaoard:- giving access to manager to delete the employee
app.delete('/employees/:id', (req, res) => {
    const { id } = req.params;

    EmployeesModel.findByIdAndDelete(id)
        .then((employee) => {
            if (!employee) {
                return res.status(404).json({ error: 'Employee not found' });
            }
            res.status(200).json({ message: 'Employee Deleted Successfully' });
        })
        .catch(error => {
            console.error('Error deleting employee:', error);
            res.status(500).json({ error: 'Failed to delete employee' });
        });
});





app.listen(3001, () => {
    console.log("Server is running on port 3001");
});
