const mongoose = require('mongoose')
const validator = require('validator')

const connectMongoDB = () => { mongoose.connect('mongodb+srv://kushagrapaypal1:xLrTk1hVSACABnkH@finoshackathon.6tc7q.mongodb.net/?retryWrites=true&w=majority&appName=finosHackathon') }

// const Task = mongoose.model('Tasks',{
//     description:{
//         type: String,
//         trim: true,
//         required: true
//     },
//     completed: {
//         type: Boolean,
//         optional: true,
//         default: false
//     }
// })

// const tasksData = new Task({
//     description: 'Test the code'
// })

// tasksData.save().then((result)=>{
//     console.log(result)
// }).catch((error)=>{
//     console.log(error)
// })

const User = mongoose.model('User',{
    name: {
        type: String,
        trim: true
    },
    email:{
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate(value){
          if(!validator.isEmail(value)){
              throw new Error('Invalid Email')
          }
      }
    },
    password:{
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password should not contain the text password')
            }
        }
    },
    age: {
        type: Number,
        default: 0
    }
})

const me = new User({
    name: 'Kushagra Asthana',
    email: 'kushagra.paypal1@gmail.com',
    password: 'Test@1234',
    age: 26
})

me.save().then((result)=>{
    console.log(result)
}).catch((error)=>{
    console.log(error)
})

module.exports = { connectMongoDB, me } 