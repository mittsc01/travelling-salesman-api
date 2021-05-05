const express = require('express')
const ScheduleService = require('./schedule-service')
const { requireAuth } = require('../middleware/jwt-auth')
const jsonParser = express.json()


const scheduleRouter = express.Router()
scheduleRouter
    .route('/')
    .all(jsonParser, requireAuth)
    .get((req, res, next) => {
        
        ScheduleService.getSchedule(req.app.get('db'), req.user.id)
            .then(runs => {
                
                res.json(runs.map(ScheduleService.serializeScheduleItem))
            })
            .catch(next)
    })
    .post((req, res, next) => {
        
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
    .all(jsonParser, requireAuth, (req,res,next) => {
        ScheduleService.getScheduleItemById(
            req.app.get('db'),
            req.params.runId
        )
        .then(route => {
            if (!route){
                return res.sendStatus(404)
            
            }
            else if (route.created_by !== req.user.id){
                return res.status(401).json({error: 'Unauthorized request'})
            }
            next()
        })
    })
    
    .delete((req, res, next) => {
        
        ScheduleService.deleteRun(
            req.app.get('db'),
            req.params.runId
        )
            .then(() => res.status(204).end())
            .catch(next)

    })

    module.exports = scheduleRouter