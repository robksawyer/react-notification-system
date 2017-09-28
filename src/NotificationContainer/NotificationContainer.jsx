/**
 * NotificationContainer
 *
 * This holds all of the notifications.
 */
import React, { Component } from 'react';
import { observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';

import NotificationItem from '../NotificationItem';
import Constants from '../constants';

@inject('store')
@observer
class NotificationContainer extends Component {
  constructor(props) {
    super(props);
    this.style = {};
  }

  componentWillMount() {
    // Fix position if width is overrided
    this.style = this.props.getStyles.container(this.props.position);
    if (this.props.getStyles.overrideWidth &&
      (this.props.position === Constants.positions.tc ||
         this.props.position === Constants.positions.bc)) {
      this.style.marginLeft = -(this.props.getStyles.overrideWidth / 2);
    }
  }

  /**
   * getNotificationItem
   * Handles getting a notification item.
   */
  getNotificationItem() {
    const self = this;
    return this.props.notifications.map(
      (notification) => {
        <NotificationItem
          ref={notification}
          key={notification.uid}
          notification={notification}
          getStyles={self.props.getStyles}
          onRemove={self.props.onRemove}
          noAnimation={self.props.noAnimation}
          allowHTML={self.props.allowHTML}
        >
          {self.props.children}
        </NotificationItem>
      }
    );
  }

  @observable style;

  render() {

    if ([
      Constants.positions.bl,
      Constants.positions.br,
      Constants.positions.bc,
    ].indexOf(this.props.position) > -1) {
      this.props.notifications.reverse();
    }

    console.log(this.props.notifications);

    return (
      <div
        className={`notifications notifications-${this.props.position}`}
        style={this.style}
      >
        {this.getNotificationItem()}
      </div>
    );
  }
}

// NotificationContainer.propTypes = {
//   position: PropTypes.string.isRequired,
//   notifications: PropTypes.array.isRequired,
//   getStyles: PropTypes.object
// };

export default NotificationContainer;
