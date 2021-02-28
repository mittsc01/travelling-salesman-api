const xss = require('xss')

const PointsService = {
  getPointsByRouteId(db,routeId) {
      console.log(routeId)
    return db
      .from('ts_points AS point')
      .select('*')
      .where('point.route_id',routeId)

  },

insertPoint(db,point){
    return db
        .insert(point)
        .into('ts_points')
        .returning('*')
        .then(rows=>rows[0])
},
deletePoints(db,route_id){
    return db
        .from('ts_points')
        .where({route_id})
        .delete()

},
deleteRoute(db,id){
    return db
        .from('ts_routes')
        .where({id})
        .delete()

},
updateRace(db,raceFields,id){
    return db
        .from('racedirector_races')
        .where({id})
        .update(raceFields)
},

  getById(db, id) {
    return RoutesService.getAllRaces(db)
      .from('racedirector_races AS race')
      .where('race.id', id)
      .first()
  },

  getFinishersByRace(db, race_id) {
    return db
      .from('racedirector_finishers AS finisher')
      .select('*')
      .where('finisher.race_id', race_id)
  },

  serializePoint(point) {
    
    return {
      id: point.id,
      lat: point.lat,
      lng: point.lng,
      index: point.index,
      date_created: new Date(point.date_created),
      date_modified: new Date(point.date_modified),
      routeId: point.routeId


    }
  },
  insertFinisher(db,finisher){
    return db
    .insert(finisher)
    .into('racedirector_finishers')
    .returning('*')
    .then(rows=>rows[0])
  },
  
  serializeFinisher(finisher){
      return {
          id: finisher.id,
          race_id: finisher.race_id,
          place: finisher.place,
          name: finisher.name,
          time: finisher.time,
          status: finisher.status,
          gender: finisher.gender,
          age: finisher.age,
          date_created: finisher.date_created,
      }
  },
  deleteFinisher(db,id){
    return db
    .from('racedirector_finishers')
    .where({id})
    .delete()
  }
}

module.exports = PointsService