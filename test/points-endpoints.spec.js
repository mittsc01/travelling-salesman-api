const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const supertest = require('supertest')

describe('Points Endpoints', function () {
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

    describe(`GET /api/points/:routeId`, () => {
        beforeEach('insert routes', () =>
                helpers.seedTables(
                    db,
                    testUsers,
                    testRoutes,
                    testPoints,
                    testRuns
                )
            )
        

        context('Given there are no points for the route', () => {
            
            it(`responds with 200 and an empty list`, () => {
                const testUser = testUsers[0]
                const testRoute = testRoutes[2]
                
                return supertest(app)
                    .get(`/api/points/${testRoute.id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, [])
            })
            

            
        })
        context('Given there are points for the route', () => {
            
            it(`responds with 200 and an empty list`, () => {
                const testUser = testUsers[0]
                const testRoute = testRoutes[0]
                const expectedPoints = testPoints
                    .filter(point => point.route_id === testRoute.id)
                    .map(point => {
                        point.date_created = point.date_created.toISOString()
                        point.date_modified = point.date_modified.toISOString()
                        return point
                    })
            return supertest(app)
                .get(`/api/points/${testRoute.id}`)
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .expect(200, expectedPoints)
            })
            

            
        })
        

    })
    describe(`POST /api/points/:routeId`, () => {
        beforeEach('insert routes', () =>
            helpers.seedTables(
                db,
                testUsers,
                testRoutes,
                testPoints,
                testRuns
            )
        )

        it(`inserts points into database, responding with 201 and the new comment`, function () {
            this.retries(3)
            const testPoints = [
                {
                    index: 1,
                    route_id: 3,
                    lat: "43.31458733397931",
                    lng: "-91.74280015928164"
                },
                {
                    index: 2,
                    route_id: 3,
                    lat: "44.31458733397931",
                    lng: "-91.74280015928164"
                },
                {
                    index: 3,
                    route_id: 3,
                    lat: "43.31458733397931",
                    lng: "-90.74280015928164"
                }

            ]
            const testUser = testUsers[0]

            return supertest(app)
                .post('/api/points/3')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(testPoints)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/points/${res.body.route_id}`)
                    const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                    const actualDate = new Date(res.body.date_created).toLocaleString()
                    expect(actualDate).to.eql(expectedDate)
                })
                .expect(res =>
                    db
                        .from('ts_points')
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
    describe(`DELETE api/points/:route_id`, () => {
        context('Given there are points with the route id', () => {
            beforeEach('insert routes', () =>
                helpers.seedTables(
                    db,
                    testUsers,
                    testRoutes,
                    testPoints,
                    testRuns
                )
            )

            it('responds with 204 and removes the points', () => {

                const idToRemove = testRoutes[1].id
                const user = testUsers[1]
                
                
                return supertest(app)
                    .delete(`/api/points/${idToRemove}`)
                    .set('Authorization', helpers.makeAuthHeader(user))
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/points/${idToRemove}`)
                            .set('Authorization', helpers.makeAuthHeader(user))
                            .expect([])
                    )
            })
        })
        context(`Given no matching routes`, () => {
            it(`responds with 401 and unauthorized`, () => {
                const user = testUsers[0]
                const routeId = 2
                return supertest(app)
                    .delete(`/api/points/${routeId}`)
                    .set('Authorization', helpers.makeAuthHeader(user))
                    .expect(401, { error: "Unauthorized request" })
            })
        })
    })

    describe(`PUT /api/points/:route_id`, () => {
        context(`Given no matching routes`, () => {
            it(`responds with 404`, () => {
                const routeId = 123456
                const user = testUsers[0]
                return supertest(app)
                    .patch(`/api/points/${routeId}`)
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
            it('responds with 204 and updates the points', () => {
                const idToUpdate = 3
                const user = testUsers[0]
                const updatePoints = [{
                    index: 1,
                    route_id: 3,
                    lat: "43.31458733397931",
                    lng: "-91.74280015928164"
                },
                {
                    index: 2,
                    route_id: 3,
                    lat: "44.31458733397931",
                    lng: "-91.74280015928164"
                },
                {
                    index: 3,
                    route_id: 3,
                    lat: "43.31458733397931",
                    lng: "-90.74280015928164"
                }]
                return supertest(app)
                    .put(`/api/points/${idToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(user))
                    .send(updatePoints)
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