/**
*
* Modal
*
*/

import React from 'react';
import PropTypes from 'prop-types';
// import styled from 'styled-components';

class Modal extends React.PureComponent {
  static propTypes = {
    children: PropTypes.any,
    active: PropTypes.bool,
    onDismiss: PropTypes.func,
  };

  componentDidMount() {
    document.addEventListener('keydown', this.dismissOnEsc, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.dismissOnEsc, false);
  }

  dismissOnEsc = (event) => {
    if (event.keyCode === 27) {
      this.props.onDismiss();
    }
  };

  render() {
    const { children, active, onDismiss } = this.props;

    let classes = 'modal';
    if (active) {
      classes += ' is-active';
    }

    return (
      <div className={classes}>
        <div className="modal-background"></div>
        <div className="modal-content">
          { children }
        </div>
        <button className="modal-close is-large" aria-label="close" onClick={onDismiss}></button>
      </div>
    );
  }
}

export default Modal;
