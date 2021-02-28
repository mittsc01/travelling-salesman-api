const xss = require('xss')

const ScheduleService = {
  getSchedule(db,userId) {
    return db
      .from('ts_runs AS run')
      .where('run.created_by',userId)

  },

insertScheduleItem(db,run){
    return db
        .insert(run)
        .into('ts_runs')
        .returning('*')
        .then(rows=>rows[0])
},
deleteRun(db,id){
    return db
        .from('ts_runs')
        .where({id})
        .delete()

},
updateRoute(db,routeFields,id){
    return db
        .from('ts_routes')
        .where({id})
        .update(routeFields)
},

  getById(db, id) {
    return ScheduleService.getAllRaces(db)
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

  serializeScheduleItem(run) {
    
    return {
      id: run.id,
      title: xss(run.title),
      route_id: run.route_id,
      date_created: new Date(run.date_created),
      date_modified: new Date(run.date_modified),
      


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

module.exports = ScheduleService