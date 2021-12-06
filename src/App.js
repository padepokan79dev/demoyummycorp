import React from "react";
// import { HashRouter, BrowserRouter } from 'react-router-dom';
import 'antd/dist/antd.css';
import './app/css/global.css';
import { Layout } from "antd";
import Routes from "./Routes";
import { messaging } from './firebase';
import {getNotif, updateData} from './database'
import Cookies from 'js-cookie'

class App extends React.Component {
  async componentDidMount() {
      messaging.requestPermission()
        .then(async function() {
    			const token = await messaging.getToken();
          // console.log(token);
          localStorage.setItem("fcmToken", token)
        })
        .catch(function(err) {
          // console.log("Unable to get permission to notify.", err);
        });

      messaging.onMessage(function(payload) {
          if (Cookies.get('LoginSession')) {
            localStorage.setItem("newNotification", "true")
          }
          const notificationTitle = payload.notification.title;
          const notificationOptions = {
              body: payload.notification.body
          };

          if (!("Notification" in window)) {
              // console.log("This browser does not support system notifications.");
          } else if (Notification.permission === "granted") {
              // If it's okay let's create a notification
              var notification = new Notification(notificationTitle,notificationOptions);
              notification.onclick = function(event) {
                  event.preventDefault();
                  if (Cookies.get('LoginSession')) {
                    var body = notificationOptions.body.split(" - ")
                    var ticketNo = body[0].split('#')
                    localStorage.setItem("notification", ticketNo[1] )

                    if (window.location.hash.includes("ticketing-list")){
                      window.location.reload()
                    } else {
                      window.location.replace('/#/ticketing-list')
                    }
                  }

                  notification.close();
              }
          }
      });
      this.handleDataIDB()
    }

  updateData = (data) => {
    const tempData = {
      id: data.id,
      newNotification: data.newNotification,
      noTicket: data.noTicket
    }
    updateData(tempData)
  }

  handleDataIDB = () => {
    setInterval(() => {
      getNotif().then( res => {
        if (res[0].newNotification) {
          if (Cookies.get('LoginSession')) {
            localStorage.setItem("newNotification", "true")
          }
          res[0].newNotification = false
          this.updateData(res[0])
        }

        if (res[0].noTicket != ''){
          if (Cookies.get('LoginSession')) {
            localStorage.setItem("notification", res[0].noTicket )
            if (window.location.hash.includes("ticketing-list")){
              window.location.reload()
            } else {
              window.location.replace('/#/ticketing-list')
            }
          }

          res[0].noTicket = ''
          this.updateData(res[0])
        }
      })
    }, 1000)
  }

  render() {
    return (
        <Layout className="app-layout">
          <Routes />
        </Layout>
    );
  }
}

export default App;
