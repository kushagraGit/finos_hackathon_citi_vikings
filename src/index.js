const express = require('express')
const test = require('./utils/Test')
const connectMongoDB = require('./utils/mongoose')
const app = express()

const port = process.env.PORT || '8080'

app.get('/v1/test', (req,res) => {
    console.log(req)
    const response = test()
    connectMongoDB.connectMongoDB()
    res.send({
        success: 'Your api is running',
        fromComp: response
    })
})

app.listen(port, () => {
    console.log('server is up')
})