import React from 'react';

export default class MessageForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ''
    };
  }
  handleSubmit(event) {
    event.preventDefault();
    if (this.state.value.length > 0) {
      this.props.onSubmit(React.findDOMNode(this.refs.message).value);
      this.setState({
        value: ''
      });
    }
  }
  handleChange(event) {
    this.setState({
      value: event.target.value
    });
  }
  render() {
    return <div className='chat form'>
      <form onSubmit={this.handleSubmit.bind(this)}>
        <p>
          <input type='text' ref='message' placeholder='Message'
            value={this.state.value} onChange={this.handleChange.bind(this)} />
          <input type='submit' value='Send' />
        </p>
      </form>
    </div>;
  }
}
