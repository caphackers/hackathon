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


var todoList = angular.module('todoList', []);

todoList.controller('todoCtrl', ['$scope', '$http',
    function ($scope, $http) {

        var urls = $scope.urls = [];

        $scope.addUrl = function () {

            var newUrl = $scope.newUrl;

            var apiWatsonKey = "2bf3d9e76fed69e0c6309b47bc40760bb8936da3";
            var collectionUrl = "https://watson-api-explorer.mybluemix.net/visual-recognition/api/v3/collections?api_key=2bf3d9e76fed69e0c6309b47bc40760bb8936da3&name=name&version=2016-05-20";

            $http({
                method: 'GET',
                url: collectionUrl,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then(function successCallback(response) {
                if (response.data.collections.length > 0) {
                    console.log(response.data.collections);
                } else {
                    var collectionName =  Math.random().toString(36).substring(7);

                    var form = new FormData();
                    form.append("name=name", "");


                    $http({
                        method: 'POST',
                        url: collectionUrl,
                        headers: {
                            'Accept': 'application/json',
                        },
                        "data": form
                    }).then(function successCallback(response) {
                    }, function errorCallback(response) {
                    });
                }
            }, function errorCallback(response) {
            });


            var detectFacesUrl = "https://watson-api-explorer.mybluemix.net/visual-recognition/api/v3/detect_faces?api_key="
                + apiWatsonKey + "&url="
                + newUrl + "&version=2016-05-20";
            $http({
                method: 'POST',
                url: detectFacesUrl,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then(function successCallback(response) {
                console.log(response.data.images[0].faces[0]);
            }, function errorCallback(response) {
            });
            if (!newUrl.length) {
                return;
            }
            urls.push({
                title: newUrl,
                completed: false
            });
            $scope.newUrl = '';
        };

        $scope.removeUrls = function (todo) {
            urls.splice(urls.indexOf(todo), 1);
        };
        $scope.markAll = function (completed) {
            urls.forEach(function (todo) {
                todo.completed = !completed;
            });
        };

        $scope.clearCompletedUrls = function () {
            $scope.urls = urls = urls.filter(function (todo) {
                return !todo.completed;
            });
        };
    }
]);
