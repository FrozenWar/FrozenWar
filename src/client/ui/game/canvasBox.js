import React from 'react';

export default class CanvasBox extends React.Component {
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
