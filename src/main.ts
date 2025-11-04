import './components/main.css';
import { App } from './App';

const appElement = document.getElementById('app');
if (appElement) {
  new App(appElement);
}