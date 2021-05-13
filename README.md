# Travelling Salesman API

To access the live API endpoint, use the following URL: 
https://ts-s.herokuapp.com/api
## Getting Started

1. Clone this repository and run `npm i`
2. Create local Postgresql databases (NOTE: you will need Postgresql installed locally): `ts` and `ts-test`
3. Run `mv example.env .env` and provide the local database locations within your `.env` file
4. Run npm run migrate and npm run migrate:test to update each database with appropriate tables
5. Run npm run dev to start server locally


## Description
*all endpoints in this section require a JWT token.  All otherwise valid requests missing the token will receive a 401 unauthorized response.

## Summary
The Travelling Salesman app allows the user to create an account and then create routes using an interactive map.  The user is then able to add routes to their schedule.


### Routes*
* GET /routes
    * responds with 200 and array of all route matching the user id
* POST /routes
    * responds with 201 and the new route. Request body field options include:
        * title (required)

* DELETE /routes/:route_id
    * responds with 204 and deletes route with requested id if it matches
    * responds with 404 if no matching route

* PATCH /routes/:route_id
    * responds with 204 and updates the route with requested id if it matches
    * responds with 404 if no matching route

### Schedule*
* GET /schedule
    * responds with 200 and array of all schedule items matching the user id
* POST /schedule
    * responds with 201 and the new schedule item. Request body field options include:
        * title (required)
        * route_id (required) 
        * date (required)
        * created_by (required)

* DELETE /schedule/:run_id
    * responds with 204 and deletes item with requested id if it matches
    * responds with 404 if no matching item


### Points*
* GET /points/:route_id
    * responds with 200 and array of all points matching the with the correct route_id
* POST /points/:route_id
    * responds with 201 and the first point in the list. Request body field options include:
        * points (required)
* DELETE /points/:route_id
    * responds with 204 and deletes points with requested id if it matches
    * responds with 404 if no matching route
* PUT /points/:route_id
    * responds with 204 and deletes points with requested id if it matches
    * posts new points




## Technologies
* NodeJS
* Express
* PostgreSQL

# Screenshots
![Landing page view screenshot](/ts-screenshots/Landing.png)
![Add Route view screenshot](/ts-screenshots/AddRoute.png)
![Route List view screenshot](/ts-screenshots/RouteList.png)
![Schedule Item detail view screenshot](/ts-screenshots/ScheduleItem.png)

