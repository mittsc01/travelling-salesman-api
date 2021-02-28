const express = require('express')
const ScheduleService = require('./schedule-service')
const { requireAuth } = require('../middleware/jwt-auth')
const jsonParser = express.json()


const scheduleRouter = express.Router()
scheduleRouter
    .route('/')
    .all(jsonParser, requireAuth)
    .get((req, res, next) => {
        //console.log('hello')
        ScheduleService.getSchedule(req.app.get('db'), req.user.id)
            .then(runs => {
                //console.log(routes)
                res.json(runs.map(ScheduleService.serializeScheduleItem))
            })
            .catch(next)
    })
    .post((req, res, next) => {
        //console.log('hello')
        const { title, route_id, date} = req.body
        const newRun = { title, route_id, date, created_by: req.user.id }


        for (const [key, value] of Object.entries(newRun)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing ${key} in request.` }
                })
            }
        }
        


        ScheduleService.insertScheduleItem(
            req.app.get('db'),
            newRun

        )
            .then(run=> {
                res
                    .status(201)
                    .location(`/api/schedule/${route_id}/${run.id}`)
                    .json(run)
            })
            .catch(next)
    })
scheduleRouter
    .route('/:runId')
    .all(jsonParser, requireAuth)
    .delete((req, res, next) => {
        console.log('hi')
        ScheduleService.deleteRun(
            req.app.get('db'),
            req.params.runId
        )
            .then(() => res.status(204).end())
            .catch(next)

    })
    .patch((req, res, next) => {
        const { title } = req.body
        const updatedRoute = { title }
        const numberOfValues = Object.values(updatedRoute).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain one of the following: 'title'`
                }
            })
        }

        updatedRoute.date_modified = new Date()
        ScheduleService.updateRoute(
            req.app.get('db'),
            updatedRoute,
            req.params.routeId

        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })
    module.exports = scheduleRouter