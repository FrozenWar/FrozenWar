import React from 'react';

export default class CanvasView extends React.Component {
  componentDidMount() {
    this.props.onLoad(React.findDOMNode(this));
  }
  shouldComponentUpdate() {
    return false;
  }
  render() {
    return <canvas />;
  }
}
