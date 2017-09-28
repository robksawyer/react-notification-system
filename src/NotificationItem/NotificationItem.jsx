/**
 * NotificationItem.jsx
 *
 * Component that manages a single component.
 *
 */
import React, { Component } from 'react';
import { observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import Constants from '../constants';
import Helpers from '../helpers';
import merge from 'object-assign';
// Used the create short ids for React components
import shortid from 'shortid';

/* From Modernizr */
const whichTransitionEvent = () => {
  const el = document.createElement('fakeelement');
  let transition;
  const transitions = {
    transition: 'transitionend',
    OTransition: 'oTransitionEnd',
    MozTransition: 'transitionend',
    WebkitTransition: 'webkitTransitionEnd',
  };

  Object.keys(transitions).forEach(
    (transitionKey) => {
      if (el.style[transitionKey] !== undefined) {
        transition = transitions[transitionKey];
      }
    },
  );

  return transition;
};

@inject('store')
@observer
class NotificationItem extends Component {
  constructor(props) {
    super(props);
    this.styles = {};
    this.notificationTimer = null;
    this.height = 0;
    this.noAnimation = null;
    this.isMounted = false;
    this.removeCount = 0;

    this.store = this.props.store.notificationStore;
  }

  componentWillMount() {
    const getStyles = this.props.getStyles;
    const level = this.props.notification.level;

    this.noAnimation = this.props.noAnimation;

    this.styles = {
      notification: getStyles.byElement('notification')(level),
      title: getStyles.byElement('title')(level),
      dismiss: getStyles.byElement('dismiss')(level),
      messageWrapper: getStyles.byElement('messageWrapper')(level),
      actionWrapper: getStyles.byElement('actionWrapper')(level),
      action: getStyles.byElement('action')(level),
    };

    if (!this.props.notification.dismissible) {
      this.styles.notification.cursor = 'default';
    }
  }

  componentDidMount() {
    const self = this;
    const transitionEvent = whichTransitionEvent();

    console.log('----- transitionEvent -----');
    console.log(transitionEvent);
    const notification = this.props.notification;
    const element = this.store.notifications[notification.uid];

    if (!element) {
      console.log('There was an issue finding `element`.');
      return false;
    }

    this.height = element.offsetHeight;

    this.isMounted = true;

    // Watch for transition end
    if (!this.noAnimation) {
      if (transitionEvent) {
        element.addEventListener(transitionEvent, this.onTransitionEnd);
      } else {
        this.noAnimation = true;
      }
    }


    if (notification.autoDismiss) {
      this.notificationTimer = new Helpers.Timer(() => {
        self.hideNotification();
      }, notification.autoDismiss * 1000);
    }

    this.store.showNotification();
  }

  componentWillUnmount() {
    const element = this.item;
    const transitionEvent = whichTransitionEvent();
    element.removeEventListener(transitionEvent, this.onTransitionEnd);
    this.isMounted = false;
  }

  onTransitionEnd() {
    if (this.removeCount > 0) return;
    if (this.state.removed) {
      this.removeCount += 1;
      this.removeNotification();
    }
  }

  @observable styles;
  @observable notificationTimer;
  @observable height;
  @observable noAnimation;
  @observable isMounted;
  @observable removeCount;

  /**
   * getCssPropertyByPosition
   */
  getCssPropertyByPosition() {
    const position = this.props.notification.position;
    let css = {};

    switch (position) {
      case Constants.positions.tl:
      case Constants.positions.bl:
        css = {
          property: 'left',
          value: -200,
        };
        break;

      case Constants.positions.tr:
      case Constants.positions.br:
        css = {
          property: 'right',
          value: -200,
        };
        break;

      case Constants.positions.tc:
        css = {
          property: 'top',
          value: -100,
        };
        break;

      case Constants.positions.bc:
        css = {
          property: 'bottom',
          value: -100,
        };
        break;

      default:
        break;
    }

    return css;
  }

  defaultAction(event) {
    const notification = this.props.notification;

    event.preventDefault();
    this.hideNotification();
    if (typeof notification.action.callback === 'function') {
      notification.action.callback();
    }
  }

  hideNotification() {
    const notification = this.props.notification;
    if (this.notificationTimer) {
      this.notificationTimer.clear();
    }

    if (this.isMounted) {
      // TODO: Update the notification inside of store
      this.setState({
        visible: false,
        removed: true,
      });
    }

    if (this.noAnimation) {
      this.removeNotification();
    }
  }

  removeNotification() {
    this.props.onRemove(this.props.notification.uid);
  }

  dismiss() {
    if (!this.props.notification.dismissible) {
      return;
    }

    this.hideNotification();
  }

  showNotification() {
    let self = this;
    setTimeout(() => {
      if (self.isMounted) {
        // TODO: Update the notification inside of store
        self.setState({
          visible: true,
        });
      }
    }, 50);
  }

  handleMouseEnter() {
    let notification = this.props.notification;
    if (notification.autoDismiss) {
      this.notificationTimer.pause();
    }
  }

  handleMouseLeave() {
    let notification = this.props.notification;
    if (notification.autoDismiss) {
      this.notificationTimer.resume();
    }
  }

  allowHTML(string) {
    return { __html: string };
  }

  render() {
    const notification = this.props.notification;
    let className = `notification notification-${notification.level}`;
    const notificationStyle = merge({}, this.styles.notification);
    const cssByPos = this.getCssPropertyByPosition();
    let dismiss = null;
    let actionButton = null;
    let title = null;
    let message = null;

    if (this.state.visible) {
      className += ' notification-visible';
    } else if (this.state.visible === false) {
      className += ' notification-hidden';
    }

    if (!notification.dismissible) {
      className += ' notification-not-dismissible';
    }

    if (this.props.getStyles.overrideStyle) {
      if (!this.state.visible && !this.state.removed) {
        notificationStyle[cssByPos.property] = cssByPos.value;
      }

      if (this.state.visible && !this.state.removed) {
        notificationStyle.height = this.height;
        notificationStyle[cssByPos.property] = 0;
      }

      if (this.state.removed) {
        notificationStyle.overlay = 'hidden';
        notificationStyle.height = 0;
        notificationStyle.marginTop = 0;
        notificationStyle.paddingTop = 0;
        notificationStyle.paddingBottom = 0;
      }
      notificationStyle.opacity = this.state.visible ? this.styles.notification.isVisible.opacity : this.styles.notification.isHidden.opacity;
    }

    if (notification.title) {
      title = (<h4
        className="notification-title"
        style={this.styles.title}>{notification.title}</h4>);
    }

    if (notification.message) {
      if (this.props.allowHTML) {
        message = (
          <div
            className="notification-message"
            style={this.styles.messageWrapper}
            dangerouslySetInnerHTML={this.allowHTML(notification.message)}
          />
        );
      } else {
        message = (
          <div
            className="notification-message"
            style={this.styles.messageWrapper}>{notification.message}</div>
        );
      }
    }

    if (notification.dismissible) {
      dismiss = (
        <span
          className="notification-dismiss"
          style={this.styles.dismiss}
        >&times;</span>
      );
    }

    if (notification.action) {
      actionButton = (
        <div
          className="notification-action-wrapper"
          style={this.styles.actionWrapper}>
          <button
            className="notification-action-button"
            onClick={this.defaultAction}
            style={this.styles.action}>
              {notification.action.label}
          </button>
        </div>
      );
    }

    if (notification.children) {
      actionButton = notification.children;
    }

    return (
      <div
        role='alertdialog'
        className={className}
        // key={shortid.generate()}
        onClick={this.dismiss}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        style={notificationStyle}
      >
        {title}
        {message}
        {dismiss}
        {actionButton}
      </div>
    );
  }
}

// NotificationItem.propTypes = {
//   notification: PropTypes.object,
//   getStyles: PropTypes.object,
//   onRemove: PropTypes.func,
//   allowHTML: PropTypes.bool,
//   noAnimation: PropTypes.bool,
//   children: PropTypes.oneOfType([
//     PropTypes.string,
//     PropTypes.element
//   ])
// };

export default NotificationItem;
