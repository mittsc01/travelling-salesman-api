const express = require('express')
const PointsService = require('./points-service')
const { requireAuth } = require('../middleware/jwt-auth')
const jsonParser = express.json()
require('body-parser')

const pointsRouter = express.Router()



pointsRouter
    .route('/:routeId')
    .all(jsonParser, requireAuth)
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
            return point
        })


        for (let i = 0; i < points.length; i++) {
            PointsService.insertPoint(
                req.app.get('db'),
                points[i],

            )
                .then(route => {
                    res
                        .status(201)
                        .location(`/api/points/${route.id}`)
                        .json(route)
                })
                .catch(next)
        }

    })
    .delete((req,res,next) => {
        PointsService.deletePoints(
            req.app.get('db'),
            req.params.routeId
        )
        .then(() => res.status(204).end())
        .catch(next)
    })
    .put(async (req, res, next) => {


        const points = req.body.map(point => {
            point.route_id = req.params.routeId
            return point
        })

        await PointsService.deletePoints(
            req.app.get('db'),
            req.params.routeId
        )


        for (let i = 0; i < points.length; i++) {
             await PointsService.insertPoint(
                req.app.get('db'),
                points[i],

            )
                
        }
        res
        .status(201)
        .json(points)
    })

module.exports = pointsRouter