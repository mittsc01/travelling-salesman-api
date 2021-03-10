const xss = require('xss')

const PointsService = {
  getPointsByRouteId(db, routeId) {
    console.log(routeId)
    return db
      .from('ts_points AS point')
      .select('*')
      .where('point.route_id', routeId)

  },

  insertPoint(db, point) {
    return db
      .insert(point)
      .into('ts_points')
      .returning('*')
      .then(rows => rows[0])
  },
  deletePoints(db, route_id) {
    return db
      .from('ts_points')
      .where({ route_id })
      .delete()

  },

  serializePoint(point) {

    return {
      id: point.id,
      lat: point.lat,
      lng: point.lng,
      index: point.index,
      date_created: new Date(point.date_created),
      date_modified: new Date(point.date_modified),
      route_id: point.route_id


    }
  },



}

module.exports = PointsService