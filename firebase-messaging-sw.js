importScripts("https://www.gstatic.com/firebasejs/8.1.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.1.1/firebase-messaging.js");

firebase.initializeApp({
  apiKey: "AIzaSyACTFNoZYQYj8VedJVioBvt33UN2VKRndk",
  authDomain: "fsm79-1f2b0.firebaseapp.com",
  databaseURL: "https://fsm79-1f2b0.firebaseio.com",
  projectId: "fsm79-1f2b0",
  storageBucket: "fsm79-1f2b0.appspot.com",
  messagingSenderId: "555364408004",
  appId: "1:555364408004:web:6d1aa94e339ac4f456c791",
  measurementId: "G-YCK29MXYXF"
});

const messaging = firebase.messaging();

messaging.usePublicVapidKey(
  "BGBOCWXTfY8B2WhoWVUuNhnZmDr0JLKunlxsat9sPLCVpEimY9JIVbThZL6fCnO6E7Bi_ZTrYVTWQr1vjpfAYD0"
);

messaging.onBackgroundMessage(function(payload) {
  // self.window.localStorage.setItem("newNotification", "true")
  openDb(true,'')
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };
  return self.registration.showNotification(notificationTitle,notificationOptions);
});

//Code for adding event on click of notification
self.addEventListener('notificationclick', function(event) {
  var body = event.notification.body.split(" - ")
  var ticketNo = body[0].split('#')
  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true})
      .then((tabs) => {
        const appTab = tabs.find((tab) => {
          if (tab.url.includes(`${self.origin}/`)){
            return tab
          }
        });

        if (appTab) {
          appTab.focus();
          openDb(false,ticketNo[1])
          return appTab;
        } else {
          openDb(false,ticketNo[1])
          return clients.openWindow(`${self.origin}/#/ticketing-list`);
        }
      })
      .then((tab) => {
      /*
      * Send the incoming call info to the app page
      * */
        // tab.postMessage({message: message});
      })
  );
  event.notification.close();
});

const openDb = (newNotification,noTicket) => {
  if (self.indexedDB) {
    const firebaseDB = self.indexedDB.open('firebaseDB', 10)
    firebaseDB.onsuccess = () => {
      const db = firebaseDB.result
      const tx = db.transaction(['dataNotif'], 'readwrite')
      let store = tx.objectStore('dataNotif')
      store.put({'id': 1, 'newNotification': newNotification, 'noTicket': noTicket})
    }
  }
}
