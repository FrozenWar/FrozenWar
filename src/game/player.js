import {Component} from 'ecstasy';

export class PlayerComponent extends Component {
  constructor(options) {
    super();
    this.name = options.name;
  }

  static get key() {
    return 'player';
  }
}
