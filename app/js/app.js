'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.view1',
  'myApp.view2',
  'myApp.version',
  'todoList'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {

}]);

/**
 * D�claration du module todoList
 */
var todoList = angular.module('todoList', []);

todoList.controller('todoCtrl', ['$scope',
  function ($scope) {

    var todos = $scope.todos = [];

    // Ajouter un todo
    $scope.addTodo = function () {
      var newTodo = $scope.newTodo.trim();
      if (!newTodo.length) {
        return;
      }
      todos.push({
        title: newTodo,
        completed: false
      });
      $scope.newTodo = '';
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
