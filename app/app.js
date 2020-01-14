'use strict';

//import 'lforms'; // also sets window.angular
import * as LForms from 'lforms'; // also sets window.angular
window.LForms = LForms;
require('lforms/app/scripts/fhir/R4/fhirRequire.js');
require('lforms/app/scripts/fhir/STU3/fhirRequire.js');

// Angular modules
require('angular-cookies');
require('angular-resource');
require('angular-sanitize');
require('angular-route');
require('angular-material');
require('angular-material/angular-material.css');
require('angular-file-upload');

require('bootstrap');

//window.LForms = require('lforms'); // also sets window.angular
//import * as window.LForms from 'lforms'; // also sets window.angular


angular.module('lformsApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ngAnimate',
  'ngMaterial',
  'lformsWidget',
  'angularFileUpload',
  require('angular-aria'),
  'angularFileUpload'
])
.config(['$ariaProvider', function ($ariaProvider) {
  $ariaProvider.config({
    tabindex: false,
    bindRoleForClick: false
  });
}])
.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider
	.when('/lforms-fhir-app', {
	  templateUrl: 'fhir-app/fhir-app.html',
	  controller: 'FhirAppCtrl'
	})
	.when('/', {
	  templateUrl: 'fhir-app/fhir-app.html',
	  controller: 'FhirAppCtrl'
	});


    $locationProvider.html5Mode(true);
}]);

// Util functions
var LFormsUtil = LFormsUtil || {};

LFormsUtil.copyToClipboard = function(elementId) {
  window.getSelection().selectAllChildren(document.getElementById(elementId));
  /* Copy the text inside the element */
  document.execCommand("Copy");
};

require('./webpack-index.js'); // files from app directory

require('../.tmp/templates.js'); // output of grunt ngtemplates


