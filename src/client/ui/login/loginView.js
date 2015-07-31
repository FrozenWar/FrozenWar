import React from 'react';

export default class LoginView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ''
    };
  }
  handleSubmit(event) {
    alert(React.findDOMNode(this.refs.nickname).value);
    event.preventDefault();
  }
  handleChange(event) {
    // TODO check conflicts
    this.setState({value: event.target.value});
  }
  render() {
    return <div className='view loginView'>
      <form onSubmit={this.handleSubmit.bind(this)}>
        <p>
          Please type your nickname.
        </p>
        <p>
          <input type='text' ref='nickname' placeholder='Nickname'
            value={this.state.value} onChange={this.handleChange.bind(this)}/>
          <input type='submit' value='OK' />
        </p>
      </form>
    </div>;
  }
}
