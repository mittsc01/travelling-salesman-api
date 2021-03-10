const xss = require('xss')

const RoutesService = {
  getAllRoutes(db,userId) {
    return db
      .from('ts_routes AS route')
      .select('*')
      .where('route.created_by',userId)

  },

insertRoute(db,route){
    return db
        .insert(route)
        .into('ts_routes')
        .returning('*')
        .then(rows=>rows[0])
},
deleteRoute(db,id){
    return db
        .from('ts_routes')
        .where({id})
        .delete()

},
updateRoute(db,routeFields,id){
    return db
        .from('ts_routes')
        .where({id})
        .update(routeFields)
},

getRouteById(db,routeId){
  return db
    .from('ts_routes')
    .where('id',routeId)
    .first()
},
  serializeRoute(route) {
    
    return {
      id: route.id,
      title: xss(route.title),
      date_created: new Date(route.date_created),
      date_modified: new Date(route.date_modified),
      created_by: route.created_by


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

module.exports = RoutesService