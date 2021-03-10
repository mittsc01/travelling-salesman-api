const express = require('express')
const PointsService = require('./points-service')
const RoutesService = require('../routes/routes-service')
const { requireAuth } = require('../middleware/jwt-auth')
const jsonParser = express.json()
require('body-parser')

const pointsRouter = express.Router()



pointsRouter
    .route('/:routeId')
    .all(jsonParser, requireAuth, (req, res, next) => {
        RoutesService.getRouteById(
            req.app.get('db'),
            req.params.routeId
        )
            .then(route => {
                if (!route) {
                    return res.sendStatus(404)

                }
                else if (route.created_by !== req.user.id) {
                    return res.status(401).json({ error: 'Unauthorized request' })
                }
                next()
            })
    })
    .get((req, res, next) => {
        //console.log(req.headers)
        PointsService.getPointsByRouteId(req.app.get('db'), req.params.routeId)
            .then(points => {
                //console.log(points)
                res.json(points.map(PointsService.serializePoint))
            })
            .catch(next)
    })
    .post((req, res, next) => {


        const points = req.body.map(point => {
            point.route_id = req.params.routeId
            point.date_modified = new Date()
            return point
        })


        
            PointsService.insertPoint(
                req.app.get('db'),
                points,

            )
                .then(point => {
                    console.log(point)
                    res
                        .location(`/api/points/${point.route_id}`)
                        .status(201)
                        .json(point)
                })
                .catch(next)
        

    })
    .delete((req, res, next) => {
        PointsService.deletePoints(
            req.app.get('db'),
            req.params.routeId
        )
            .then(() => res.status(204).end())
            .catch(next)
    })
    .put((req, res, next) => {


        const points = req.body.map(point => {
            point.route_id = req.params.routeId
            
            return point
        })

        PointsService.deletePoints(
            req.app.get('db'),
            req.params.routeId
        )
        .then(() => PointsService.insertPoint(
            req.app.get('db'),
            points,

        ))
        .then(() =>{
            console.log(points)
            return res
                .status(204)
                .end()
            })
        .catch(next)


        
        
        
        
        
    })

module.exports = pointsRouter