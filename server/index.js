//Api Codes
const express = require("express");
const mongoose = require('mongoose');
const cors = require("cors");
const EmployeesModel = require('./models/EmployeesSchema')

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://localhost:27017/Employees");
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

    //otherwise, look up the employee in the database
    try{
        const employee = await EmployeesModel.findOne({email,password});
        if(employee) {
            res.status(200).json({role: 'employee'});

        }else{
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
