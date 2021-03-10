const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const supertest = require('supertest')

describe('Routes Endpoints', function () {
    let db

    const {
        testUsers,
        testRoutes,
        testPoints,
        testRuns
    } = helpers.makeFixtures()

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('cleanup', () => helpers.cleanTables(db))

    afterEach('cleanup', () => helpers.cleanTables(db))

    describe(`GET /api/routes`, () => {
        context(`Given no routes`, () => {
            it(`responds with 200 and an empty list`, () => {
                const testUser = helpers.makeUsersArray()[1]
                helpers.seedUsers(db, [testUser])
                
                return supertest(app)
                    .get('/api/routes')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, [])
            })
        })

        context('Given there are routes in the database', () => {
            beforeEach('insert routes', () =>
                helpers.seedTables(
                    db,
                    testUsers,
                    testRoutes,
                    testPoints,
                    testRuns
                )
            )

            it('responds with 200 and all of the routes', () => {
                const testUser = helpers.makeUsersArray()[1]
                const expectedRoutes = testRoutes
                    .filter(route => route.created_by === testUser.id)
                    .map(route => {
                        route.date_created = route.date_created.toISOString()
                        route.date_modified = route.date_modified.toISOString()
                        return route
                    })
                return supertest(app)
                    .get('/api/routes')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, expectedRoutes)
            })
        })

    })
    describe(`POST /api/routes`, () => {
        beforeEach('insert routes', () =>
            helpers.seedTables(
                db,
                testUsers,
                testRoutes,
                testPoints,
                testRuns
            )
        )

        it(`creates a route, responding with 201 and the new comment`, function () {
            this.retries(3)
            const testRoute = {
                title: 'test',
            }
            const testUser = testUsers[0]

            return supertest(app)
                .post('/api/routes')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(testRoute)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.body.title).to.eql(testRoute.title)
                    expect(res.body.created_by).to.eql(testUser.id)
                    expect(res.headers.location).to.eql(`/api/routes/${res.body.id}`)
                    const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                    const actualDate = new Date(res.body.date_created).toLocaleString()
                    expect(actualDate).to.eql(expectedDate)
                })
                .expect(res =>
                    db
                        .from('ts_routes')
                        .select('*')
                        .where({ id: res.body.id })
                        .first()
                        .then(row => {
                            expect(row.title).to.eql(testRoute.title)
                            expect(row.user_id).to.eql(testUser.id)
                            const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                            const actualDate = new Date(row.date_created).toLocaleString()
                            expect(actualDate).to.eql(expectedDate)
                        })
                )
        })


    })
    describe(`DELETE api/routes/:route_id`, () => {
        context('Given there are articles in the database', () => {
            beforeEach('insert routes', () =>
                helpers.seedTables(
                    db,
                    testUsers,
                    testRoutes,
                    testPoints,
                    testRuns
                )
            )

            it('responds with 204 and removes the article', () => {

                const idToRemove = testRoutes[1].id
                const user = testUsers[1]
                const expectedRoutes = testRoutes.filter(route => route.id !== idToRemove && route.created_by === user.id)
                    .map(route => {
                        route.date_created = route.date_created.toISOString()
                        route.date_modified = route.date_modified.toISOString()
                        return route
                    })
                //console.log(expectedRoutes)
                return supertest(app)
                    .delete(`/api/routes/${idToRemove}`)
                    .set('Authorization', helpers.makeAuthHeader(user))
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/routes`)
                            .set('Authorization', helpers.makeAuthHeader(user))
                            .expect(expectedRoutes)
                    )
            })
        })
        context(`Given no matching routes`, () => {
            it(`responds with 401 and unauthorized`, () => {
                const user = testUsers[0]
                const routeId = 2
                return supertest(app)
                    .delete(`/api/routes/${routeId}`)
                    .set('Authorization', helpers.makeAuthHeader(user))
                    .expect(401, { error: "Unauthorized request" })
            })
        })
    })

    describe(`PATCH /api/routes/:route_id`, () => {
        context(`Given no matching routes`, () => {
            it(`responds with 404`, () => {
                const routeId = 123456
                const user = testUsers[0]
                return supertest(app)
                    .patch(`/api/routes/${routeId}`)
                    .set('Authorization', helpers.makeAuthHeader(user))
                    .expect(401, { error: "Unauthorized request" })
            })
        })
        context('Given a matching route', () => {
            beforeEach('insert routes', () =>
                helpers.seedTables(
                    db,
                    testUsers,
                    testRoutes,
                    testPoints,
                    testRuns
                )
            )
            it('responds with 204 and updates the route', () => {
                const idToUpdate = 3
                const user = testUsers[0]
                const updateRoute = {
                    title: 'updated route title'
                }
                return supertest(app)
                    .patch(`/api/routes/${idToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(user))
                    .send(updateRoute)
                    .expect(204)
            })
        })
        context('Given a matching route, but incorrect user', () => {
            beforeEach('insert routes', () =>
                helpers.seedTables(
                    db,
                    testUsers,
                    testRoutes,
                    testPoints,
                    testRuns
                )
            )
            it('responds with 401 and unauthorized', () => {
                const idToUpdate = 2
                const user = testUsers[0]
                const updateRoute = {
                    title: 'updated route title'
                }
                return supertest(app)
                    .patch(`/api/routes/${idToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(user))
                    .send(updateRoute)
                    .expect(401, { error: "Unauthorized request" })
            })
        })
    })

})