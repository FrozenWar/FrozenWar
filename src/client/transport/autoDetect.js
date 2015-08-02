import SocketIOTransport from './socketIOTransport.js';
import LocalTransport from './localTransport.js';

export default function autoDetectTransport(app) {
  if (window.location.protocol === 'file:') {
    return new LocalTransport(app);
  }
  return new SocketIOTransport(app);
}
