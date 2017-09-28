/**
 * DEPRECATED
 * NotificationStore.js
 * Handles notifications throughout the app.
 *
 * TODO: I'd really like this to work with react-notification-system, but I just
 * can't figure it out.
 *
 * @see https://github.com/igorprado/react-notification-system
 */

import { observable, action, toJS } from "mobx";
import merge from 'object-assign';

// Constants
import Constants from './constants';

export default class NotificationStore {

  @observable uid;
  @observable initialized = false;
  @observable notifications = [];

  constructor() {
    this.uid = 3400;
  }

  /**
   * addNotification
   * Handles adding notifications to the queue.
   * @see https://github.com/igorprado/react-notification-system#creating-a-notification
   * @param {Object} settings Contains the notification settings.
   * @return {void}
   */
  // @action('ADD_NOTIFICATION')
  // addNotification(settings){
  //   const text = settings.message;
  //   const type = settings.level;
  //   const notification = { text, type }
  //
	// 	this.notifications.push(notification);
  //   const newNotificationIndex = this.notifications.length-1;
	// 	setTimeout(() => {
	// 		this.deleteNotification(this.notifications[newNotificationIndex]);
	// 	}, 5000);
  // }

  /**
   * deleteNotification
   * Handles deleting a notification.
   * @param {Object} notification
   * @return
   */
  // @action('DELETE_NOTIFICATION')
  // deleteNotification (notification) {
  //   if(this.notifications.length < 2){
  //     const filteredArray = this.notifications.filter(
  //       (not) => {
  //         return not !== notification;
  //       }
  //     );
  //     this.notifications.replace(filteredArray);
  //   } else {
  //     // Clear the array if there's only one notification
  //     this.notifications.clear();
  //   }
  // }
  //

  /**
   * addNotification
   */
  @action('ADD_NOTIFICATION')
  addNotification(notification) {
    const tNotification = merge({}, Constants.notification, notification);
    // let notifications = this.notifications;

    console.log('------- ADD NOTIFICATION -------');
    console.log(tNotification);

    if (!tNotification.level) {
      throw new Error('notification level is required.');
    }

    if (Object.keys(Constants.levels).indexOf(tNotification.level) === -1) {
      throw new Error(`'${tNotification.level}' is not a valid level.`);
    }

    if (isNaN(tNotification.autoDismiss)) {
      throw new Error('\'autoDismiss\' must be a number.');
    }

    if (Object.keys(Constants.positions).indexOf(tNotification.position) === -1) {
      throw new Error(`'${tNotification.position}' is not a valid position.`);
    }

    // Some preparations
    tNotification.position = tNotification.position.toLowerCase();
    tNotification.level = tNotification.level.toLowerCase();
    tNotification.autoDismiss = parseInt(tNotification.autoDismiss, 10);

    tNotification.uid = tNotification.uid || this.uid;
    // TODO: Figure out a better way to handle this.
    tNotification.ref = `notification${tNotification.uid}`;
    this.uid += 1;

    // do not add if the notification already exists based on supplied uid
    for (let i = 0; i < this.notifications.length; i += 1) {
      if (this.notifications[i].uid === tNotification.uid) {
        return false;
      }
    }

    // Add the new notification to the stack
    this.notifications.push(tNotification);

    console.log(tNotification.onAdd);

    if (typeof tNotification.onAdd === 'function') {
      console.log('onAdd');
      // notification.onAdd(tNotification);
      this.notifications.onAdd(tNotification);
    }

    // this.notifications.replace(notifications);

    return tNotification;
  }

  /**
   * getNotificationRef
   */
  @action('GET_NOTIFICATION')
  getNotificationRef(notification) {
    let self = this;
    let foundNotification = null;

    Object.keys(this.refs).forEach(
      (container) => {
        if (container.indexOf('container') > -1) {
          Object.keys(self.refs[container].refs).forEach(
            (_notification) => {
              let uid = notification.uid ? notification.uid : notification;
              if (_notification === 'notification-' + uid) {
                // NOTE: Stop iterating further and return the found notification.
                // Since UIDs are uniques and there won't be another notification found.
                foundNotification = self.refs[container].refs[_notification];

                console.log('------ FOUND NOTIFICATION ------');
                console.log(foundNotification);
                return;
              }
            }
          );
        }
      }
    );

    return foundNotification;
  }

  /**
   * removeNotification
   */
  @action('DELETE_NOTIFICATION')
  removeNotification(notification) {
    let foundNotification = this.getNotificationRef(notification);
    return foundNotification && foundNotification._hideNotification();
  }

  /**
   * editNotification
   */
  @action('EDIT_NOTIFICATION')
  editNotification(notification, newNotification) {
    let foundNotification = null;
    // NOTE: Find state notification to update by using
    // `setState` and forcing React to re-render the component.
    let uid = notification.uid ? notification.uid : notification;

    let newNotifications = this.notifications.filter(
      (stateNotification) => {
        if (uid === stateNotification.uid) {
          foundNotification = stateNotification;
          return false;
        }
        return true;
      }
    );


    if (!foundNotification) {
      return;
    }

    newNotifications.push(
      merge(
        {},
        foundNotification,
        newNotification
      )
    );

    this.notifications.replace(newNotifications);
  }

  /**
   * clearNotifications
   */
  @action('CLEAR_NOTIFICATIONS')
  clearNotifications() {
    const self = this;
    Object.keys(this.refs).forEach(
      (container) => {
        if (container.indexOf('container') > -1) {
          Object.keys(self.refs[container].refs).forEach(
            (_notification) => {
              self.refs[container].refs[_notification]._hideNotification();
            }
          );
        }
      }
    );
  }


  /**
   * addSimpleNotification
   * Handles adding notifications to the queue.
   * @param {string} message Message of the notification
   * @param {string} level Level of the notification. Available: success, error, warning and info
   */
  @action addSimpleNotification(message, level){
    this.addNotification({
      message: message,
      level: level
    });
  }

  /**
   * addErrorNotification
   * Handles adding an error notification to the queue.
   * @param {string} message Message of the notification
   */
  @action addErrorNotification(message){
    this.addNotification({
      message: message,
      level: 'error'
    });
  }

  /**
   * addSuccessNotification
   * Handles adding an success notification to the queue.
   * @param {string} message Message of the notification
   */
  @action addSuccessNotification(message){
    this.addNotification({
      message: message,
      level: 'success'
    });
  }

  /**
   * addWarningNotification
   * Handles adding an warning notification to the queue.
   * @param {string} message Message of the notification
   */
  @action addWarningNotification(message){
    this.addNotification({
      message: message,
      level: 'warning'
    });
  }

  /**
   * addInfoNotification
   * Handles adding an info notification to the queue.
   * @param {string} message Message of the notification
   */
  @action addInfoNotification(message){
    this.addNotification({
      message: message,
      level: 'info'
    });
  }

  /**
   * Handles clearing all of the notifications
   * @see https://mobx.js.org/refguide/array.html
   * @param {void}
   */
  @action clearNotifications(){
    this.notifications.clear();
  }
}
