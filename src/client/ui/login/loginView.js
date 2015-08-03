import React from 'react';

export default class LoginView extends React.Component {
  constructor(props) {
    super(props);
    this.value = '';
    this.state = {
      value: '',
      valid: 'required'
    };
  }
  handleSubmit(event) {
    event.preventDefault();
    if (this.state.valid === 'valid') {
      this.props.onSubmit(React.findDOMNode(this.refs.nickname).value);
    }
  }
  handleChange(event) {
    this.value = event.target.value;
    this.setState({
      value: this.value,
      valid: 'pending'
    });
    this.props.app.transport.validateNickname(this.value)
    .then((valid) => {
      this.setState({
        value: this.value,
        valid: valid ? 'valid' : 'invalid'
      });
    });
  }
  render() {
    return <div className='view login'>
      <form onSubmit={this.handleSubmit.bind(this)}>
        <p>
          Please type your nickname.
        </p>
        <p>
          <input type='text' ref='nickname' placeholder='Nickname'
            value={this.state.value} onChange={this.handleChange.bind(this)}
            className={this.state.valid} />
          <input type='submit' value='OK' />
        </p>
      </form>
    </div>;
  }
}
