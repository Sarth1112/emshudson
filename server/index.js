//Api Codes
const express = require("express");
const mongoose = require('mongoose');
const cors = require("cors");
const EmployeesModel = require('./models/EmployeesSchema')
const scheduleModel = require('./models/ScheduleSchema')


const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/Employees', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  const getAvailabilityModel = (termYear) => {
    const modelName = `${termYear}Availability`;
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

app.delete('/schedules/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // First find the schedule to get its term and year
        const schedule = await scheduleModel.findById(id);
        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        // Get the collection name for availability data
        const collectionName = `${schedule.term}${schedule.year}`;
        
        try {
            // Try to get the availability model for this schedule
            const AvailabilityModel = getAvailabilityModel(collectionName);
            
            // Delete all availability entries for this schedule
            await AvailabilityModel.deleteMany({ scheduleId: id });
        } catch (error) {
            console.log('No availability data found for this schedule');
            // Continue with schedule deletion even if availability cleanup fails
        }

        // Delete the schedule
        await scheduleModel.findByIdAndDelete(id);

        res.status(200).json({ message: 'Schedule deleted successfully' });
    } catch (error) {
        console.error('Error deleting schedule:', error);
        res.status(500).json({ error: 'Failed to delete schedule' });
    }
});

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
      
      const availabilityEntry = new AvailabilityModel({
        employeeId,
        scheduleId,
        availability
      });
  
      const saved = await availabilityEntry.save();
      console.log('Saved entry:', saved);
      
      res.status(201).json(saved);
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post('/schedules', async (req, res) => {
    try {
      const schedule = new scheduleModel(req.body);
      await schedule.save();
      res.status(201).json(schedule);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get('/schedules', async (req, res) => {
    try {
      const schedules = await scheduleModel.find({});
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

//Backend register end point
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

app.get('/employees',(req,res) => {
    EmployeesModel.find({})
        .then(employees => res.json(employees))
        .catch(err => res.status(500).json({error: 'Error fetching employees'}));
});

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
