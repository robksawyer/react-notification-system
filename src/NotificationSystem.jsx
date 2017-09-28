/**
 * NotificationSystem
 */
import React, { Component } from 'react';
import { observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import merge from 'object-assign';
// Used the create short ids for React components
import shortid from 'shortid';

// Components
import NotificationContainer from './NotificationContainer';

// Constants
import Constants from './constants';

// Styles
import styles from './styles';

@inject('store')
@observer
class NotificationSystem extends Component {
  constructor(props) {
    super(props);
    this.store = this.props.store.notificationStore;
    this.uid = 3400;
    this.isMounted = false;
  }

  componentDidMount() {
    this.getStyles.setOverrideStyle(styles);
    this.isMounted = true;
    if (NotificationSystem.instance) {
      console.warn('NotificationSystem', 'Attempting to mount a second system into the DOM.');
    }
    NotificationSystem.instance = this;
  }

  componentWillUnmount() {
    this.isMounted = false;
    if (NotificationSystem.instance === this) {
      NotificationSystem.instance = null;
    }
  }

  /**
   * getStyles
   */
  getStyles = {
    overrideStyle: {},

    overrideWidth: null,

    setOverrideStyle: (style) => {
      this.overrideStyle = style;
    },

    wrapper: () => {
      if (!this.overrideStyle) return {};
      return merge({}, styles.Wrapper, this.overrideStyle.Wrapper);
    },

    /**
     * container
     */
    container: (position) => {
      const override = this.overrideStyle.Containers || {};
      if (!this.overrideStyle) return {};

      this.overrideWidth = styles.Containers.DefaultStyle.width;

      if (override.DefaultStyle && override.DefaultStyle.width) {
        this.overrideWidth = override.DefaultStyle.width;
      }

      if (override[position] && override[position].width) {
        this.overrideWidth = override[position].width;
      }

      return merge(
        {},
        styles.Containers.DefaultStyle,
        styles.Containers[position],
        override.DefaultStyle,
        override[position],
      );
    },

    elements: {
      notification: 'NotificationItem',
      title: 'Title',
      messageWrapper: 'MessageWrapper',
      dismiss: 'Dismiss',
      action: 'Action',
      actionWrapper: 'ActionWrapper',
    },

    byElement: (element) => {
      console.log('------ byElement ------');
      const self = this;
      return (level) => {
        try {
          const tElement = self.elements[element];
          console.log(tElement);
        } catch (err) {
          console.error(err);
        }
        try {
          const override = self.overrideStyle[element] || {};
          console.log(override);
        } catch (err) {
          console.error(err);
        }
        if (!self.overrideStyle) return {};
        return merge(
          {},
          styles[element].DefaultStyle,
          styles[element][level],
          override.DefaultStyle,
          override[level]
        );
      };
    },
  };

  @observable uid;
  @observable isMounted;

  /**
   * didNotificationRemoved
   */
  didNotificationRemoved(uid) {
    let notification;
    const notifications = this.store.notifications.filter(
      (toCheck) => {
        if (toCheck.uid === uid) {
          notification = toCheck;
          return false;
        }
        return true;
      },
    );

    if (this.isMounted) {
      this.store.notifications.replace(notifications);
    }

    if (notification && notification.onRemove) {
      notification.onRemove(notification);
    }
  }

  render() {
    const self = this;
    let containers = null;
    const notifications = this.store.notifications;

    if (notifications.length) {
      containers = Object.keys(Constants.positions).map(
        (position) => {
          const tNotifications = notifications.filter(
            notification => position === notification.position,
          );

          if (!tNotifications.length) {
            return null;
          }

          return (
            <NotificationContainer
              ref={`container-${position}`}
              key={position}
              // key={ shortid.generate() }
              position={position}
              notifications={tNotifications}
              getStyles={self.getStyles}
              onRemove={self.didNotificationRemoved}
              noAnimation={self.props.noAnimation}
              allowHTML={self.props.allowHTML}
            />
          );
        },
      );
    }


    return (
      <div
        className="notifications-wrapper"
        style={this.getStyles.wrapper()}
      >
        { containers }
      </div>
    );
  }

  // These just proxy the current actively mounted instance.
  // statics: {
  //   addNotification: (notification) => {
  //     if (NotificationSystem.instance) {
  //       return NotificationSystem.instance.addNotification(notification);
  //     }
  //     console.warn('NotificationSystem', 'No instance to add notification.', notification);
  //     // return notification to prevent null pointer errors.
  //     return notification;
  //   },
  //   removeNotification: (notification) => {
  //     if (NotificationSystem.instance) {
  //       return NotificationSystem.instance.remoteNotification(notification);
  //     }
  //     console.warn('NotificationSystem', 'No instance to remote notification.', notification);
  //     return notification;
  //   },
  //   editNotification: (notification) => {
  //     if (NotificationSystem.instance) {
  //       return NotificationSystem.instance.editNotification(notification);
  //     }
  //     console.warn('NotificationSystem', 'No instance to edit notification.', notification);
  //     return notification;
  //   },
  //   clearNotifications: () => {
  //     if (NotificationSystem.instance) {
  //       return NotificationSystem.instance.clearNotifications();
  //     }
  //     console.warn('NotificationSystem', 'No instance to clear notifications.');
  //     return null;
  //   }
  // }
}

// NotificationSystem.propTypes = {
//   style: PropTypes.oneOfType([
//     PropTypes.bool,
//     PropTypes.object
//   ]),
//   noAnimation: PropTypes.bool,
//   allowHTML: PropTypes.bool
// };

export default NotificationSystem;
