const express = require('express')
const RoutesService = require('./routes-service')
const { requireAuth } = require('../middleware/jwt-auth')
const jsonParser = express.json()


const routesRouter = express.Router()
routesRouter
    .route('/')
    .all(jsonParser, requireAuth)
    .get((req, res, next) => {
        //console.log('hello')
        RoutesService.getAllRoutes(req.app.get('db'), req.user.id)
            .then(routes => {
                //console.log(routes)
                res.json(routes.map(RoutesService.serializeRoute))
            })
            .catch(next)
    })
    .post((req, res, next) => {
        //console.log('hello')
        const { title } = req.body
        const newRoute = { title }


        for (const [key, value] of Object.entries(newRoute)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing ${key} in request.` }
                })
            }
        }
        newRoute.created_by = req.user.id


        RoutesService.insertRoute(
            req.app.get('db'),
            newRoute

        )
            .then(route => {
                res
                    .status(201)
                    .location(`/api/routes/${route.id}`)
                    .json(route)
            })
            .catch(next)
    })
routesRouter
    .route('/:routeId')
    .all(jsonParser, requireAuth)
    .delete((req, res, next) => {
        console.log('hi')
        RoutesService.deleteRoute(
            req.app.get('db'),
            req.params.routeId
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
        RoutesService.updateRoute(
            req.app.get('db'),
            updatedRoute,
            req.params.routeId

        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })


module.exports = routesRouter