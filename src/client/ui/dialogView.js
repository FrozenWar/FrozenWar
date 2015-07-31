import React from 'react';
import classNames from 'classnames';

export default class DialogView extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let classes = classNames('view', 'dialog', {
      'error': this.props.type === 'error',
      'progress': this.props.type === 'progress',
      'message': this.props.type === 'message'
    });
    return <div className={classes}>
      <h1>{this.props.name}</h1>
      <p>
        {this.props.data}
      </p>
    </div>;
  }
}
