import appConfig from './appConfig';
import MyController from './MyController';

  angular
      .module('app', ['ngRoute'])
      .config(appConfig)
      .controller('MyController', MyController);