export default class ChatConsole {
  constructor(component) {
    this.component = component;
  }
  log(message) {
    this.component.setState((state) => {
      return {
        messages: state.messages.concat({
          type: 'log',
          text: message
        })
      };
    });
  }
}
