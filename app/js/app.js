'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.view1',
  'myApp.view2',
  'myApp.version',
  'todoList'
]).config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {

}]);

/**
 * D�claration du module todoList
 */
var todoList = angular.module('todoList', []);

todoList.controller('todoCtrl', ['$scope', '$http',
  function ($scope, $http) {

    var todos = $scope.todos = [];

    $scope.addUrl = function () {
      var newUrl = $scope.newUrl.trim();
      var url = "https://watson-api-explorer.mybluemix.net/visual-recognition/api/v3/detect_faces?api_key=2bf3d9e76fed69e0c6309b47bc40760bb8936da3&url="
          + newUrl + "&version=2016-05-20";
      $http({
        method: 'POST',
        url: url,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }).then(function successCallback(response) {
        console.log(response.data.images[0].faces[0]);
        $scope.facedetection = response
      }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      });
      if (!newUrl.length) {
        return;
      }
      todos.push({
        title: newUrl,
        completed: false
      });
      $scope.newUrl = '';
    };

    $scope.removeTodo = function (todo) {
      todos.splice(todos.indexOf(todo), 1);
    };
    $scope.markAll = function (completed) {
      todos.forEach(function (todo) {
        todo.completed = !completed;
      });
    };

    $scope.clearCompletedTodos = function () {
      $scope.todos = todos = todos.filter(function (todo) {
        return !todo.completed;
      });
    };
  }
]);
