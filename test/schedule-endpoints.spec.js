const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const supertest = require('supertest')
const { expect } = require('chai')

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

    describe(`GET /api/schedule`, () => {
        context(`Given no routes`, () => {
            it(`responds with 200 and an empty list`, () => {
                const testUser = helpers.makeUsersArray()[1]
                helpers.seedUsers(db, [testUser])
                
                return supertest(app)
                    .get('/api/schedule')
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
                const expectedRuns = testRuns
                    .filter(run => run.created_by === testUser.id)
                    .map(route => {
                        route.date_created = route.date_created.toISOString()
                        route.date_modified = route.date_modified.toISOString()
                        return route
                    })
                return supertest(app)
                    .get('/api/schedule')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, expectedRuns)
            })
        })

    })
    describe(`POST /api/schedule`, () => {
        beforeEach('insert runs', () =>
            helpers.seedTables(
                db,
                testUsers,
                testRoutes,
                testPoints,
                testRuns
            )
        )

        it(`creates a run, responding with 201 and the new comment`, function () {
            this.retries(3)
            const testRun = {
                title: 'test',
                route_id: 1,
                created_by: 1,
                date: "2021-03-13"
            }
            const testUser = testUsers[0]

            return supertest(app)
                .post('/api/schedule')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(testRun)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.body.title).to.eql(testRun.title)
                    expect(res.body.route_id).to.eql(testRun.route_id)
                    expect(res.body.date).to.eql(testRun.date)
                    expect(res.headers.location).to.eql(`/api/schedule/${testRun.route_id}/${res.body.id}`)
                    const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                    const actualDate = new Date(res.body.date_created).toLocaleString()
                    expect(actualDate).to.eql(expectedDate)
                })
                .expect(res =>
                    db
                        .from('ts_runs')
                        .select('*')
                        .where({ id: res.body.id })
                        .first()
                        .then(row => {
                            expect(row.title).to.eql(testRun.title)
                            expect(row.route_id).to.eql(testRun.route_id)
                            expect(row.date).to.eql(testRun.date)
                            const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                            const actualDate = new Date(row.date_created).toLocaleString()
                            expect(actualDate).to.eql(expectedDate)
                        })
                )
        })


    })
    describe(`DELETE api/schedule/:run_id`, () => {
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

            it('responds with 204 and removes the run', () => {
                const user = testUsers[0]
                const idToRemove = testRuns[0].id
                const routeId = testRuns[0].route_id
                const expectedRoutes = testRuns.filter(run => run.id !== idToRemove && run.route_id === routeId)
                    .map(run => {
                        
                        run.date_created = run.date_created.toISOString()
                        run.date_modified = run.date_modified.toISOString()
                        return run
                    })
                
                return supertest(app)
                    .delete(`/api/schedule/${idToRemove}`)
                    .set('Authorization', helpers.makeAuthHeader(user))
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/schedule`)
                            .set('Authorization', helpers.makeAuthHeader(user))
                            .expect(expectedRoutes)
                    )
            })
        })
        context(`Given no matching routes`, () => {
            it(`responds with 401 and unauthorized`, () => {
                const user = testUsers[0]
                const runId = 2
                return supertest(app)
                    .delete(`/api/schedule/${runId}`)
                    .set('Authorization', helpers.makeAuthHeader(user))
                    .expect(401, { error: "Unauthorized request" })
            })
        })
    })


})