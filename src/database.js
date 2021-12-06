import Dexie from 'dexie'

const myDb = new Dexie('firebaseDB')
myDb.version(1).stores({
  dataNotif: 'id, newNotification, noTicket'
})

const getNotif = async () => await myDb.dataNotif.toArray().then( res => {
  return res
})

const updateData = async (data) => {
  await myDb.dataNotif.put({id: data.id, newNotification: data.newNotification, noTicket: data.noTicket})
}

getNotif().then(res  => {
  if (res.length === 0) {
    myDb.dataNotif.add({id: 1, newNotification: false, noTicket:''})
  }
})

export {
  getNotif,
  updateData
}
