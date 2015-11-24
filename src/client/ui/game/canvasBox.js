import React from 'react';
import { findDOMNode } from 'react-dom';

export default class CanvasBox extends React.Component {
  componentDidMount() {
    this.props.onLoad(findDOMNode(this));
  }
  shouldComponentUpdate() {
    return false;
  }
  render() {
    return <canvas />;
  }
}
