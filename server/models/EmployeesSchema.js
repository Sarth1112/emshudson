const mongoose = require('mongoose');

const employeesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        requried: true,
        unique: true,
        validate: {
            validator: function(v){
                return /@live.hccc.edu$/.test(v);
            },
            message: props => `${props.value} is not a valid email! It must end with live.hccc.edu.`
        }
    },
    password: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    id: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^\d{7}$/.test(v);
            },
            message: props => `${props.value} is not a valid ID! It must be a 7-digit number.`
        }
    } 
    
});
module.exports = mongoose.model('Employee', employeesSchema);