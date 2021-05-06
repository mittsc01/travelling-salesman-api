require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const authRouter = require('../src/auth/auth-router')
const { NODE_ENV } = require('./config')
const usersRouter = require('./users/users-router')
const routesRouter = require('./routes/routes-router')
const pointsRouter = require('./points/points-router')
const scheduleRouter = require('./schedule/schedule-router')
const app = express()

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

app.use('/api/auth', authRouter)
app.use('/api/users',usersRouter)
app.use('/api/routes',routesRouter)
app.use('/api/points',pointsRouter)
app.use('/api/schedule',scheduleRouter)



app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})

module.exports = app