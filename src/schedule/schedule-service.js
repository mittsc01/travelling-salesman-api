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


  getScheduleItemById(db,id){
    return db
      .from('ts_runs')
      .where({id})
      .first()
  },
  

  serializeScheduleItem(run) {
    
    return {
      id: run.id,
      title: xss(run.title),
      route_id: run.route_id,
      created_by: run.created_by,
      date: run.date,
      date_created: new Date(run.date_created),
      date_modified: new Date(run.date_modified),
      


    }
  },
  
}

module.exports = ScheduleService