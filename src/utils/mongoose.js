const mongoose = require('mongoose')
const validator = require('validator')

const connectMongoDB = () => { mongoose.connect('mongodb+srv://kushagrapaypal1:xLrTk1hVSACABnkH@finoshackathon.6tc7q.mongodb.net/?retryWrites=true&w=majority&appName=finosHackathon') }

const Task = mongoose.model('Tasks',{
    description:{
        type: String,
        trim: true,
        required: true
    },
    completed: {
        type: Boolean,
        optional: true,
        default: false
    }
})

const tasksData = new Task({
    description: 'Test the code'
})

tasksData.save().then((result)=>{
    console.log(result)
}).catch((error)=>{
    console.log(error)
})

module.exports = { connectMongoDB, tasksData } 