'use strict';

// Declare app level module which depends on views, and components
var myApp = angular.module('myApp', [
    'ngRoute',
    'myApp.view1',
    'myApp.view2',
    'myApp.version',
    'todoList'
]).config(['$locationProvider', '$routeProvider', '$httpProvider', function ($locationProvider, $routeProvider, $httpProvider) {
    $httpProvider.defaults.headers.common = {};
    $httpProvider.defaults.headers.post = {};
    $httpProvider.defaults.headers.put = {};
    $httpProvider.defaults.headers.patch = {};
}]);


myApp.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function () {
                scope.$apply(function () {
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

myApp.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function (file, uploadUrl) {
        var fd = new FormData();
        fd.append('file', file);

        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).success(function () {
        })
            .error(function () {
            });
    }
}]);


var todoList = angular.module('todoList', []);

todoList.controller('todoCtrl', ['$scope', '$http',
    function ($scope, $http) {

        var urls = $scope.urls = [];

        $scope.myFile;

        $scope.foundCollection = "";
        $scope.informations = "";
        $scope.category = "";

        $scope.addUrl = function () {

            var newUrl = $scope.newUrl;

            var apiWatsonKey = "2bf3d9e76fed69e0c6309b47bc40760bb8936da3";
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
                $scope.informations = "Collected information: minimum age " + response.data.images[0].faces[0].age.min + " and maximum age "
                    + response.data.images[0].faces[0].age.max + " with score "
                    + response.data.images[0].faces[0].age.score + " and sexe " + response.data.images[0].faces[0].gender.gender
                    + " with score " + response.data.images[0].faces[0].gender.score;
                if (response.data.images[0].faces[0].gender.gender == 'MALE') {
                    if ((response.data.images[0].faces[0].age.min > 1 || typeof(response.data.images[0].faces[0].age.min) == 'undefined')
                        && response.data.images[0].faces[0].age.max <= 17) {
                        $scope.category = "Category: BATMAN";
                    } else if (response.data.images[0].faces[0].age.min < 90 && response.data.images[0].faces[0].age.min > 50)
                        $scope.category = "Category: Trump";

                } else if (response.data.images[0].faces[0].gender.gender == 'FEMALE') {
                    if ((response.data.images[0].faces[0].age.min > 1 || typeof(response.data.images[0].faces[0].age.min) == 'undefined')
                        && response.data.images[0].faces[0].age.max <= 17) {
                        $scope.category = "Category: Nintendo";
                    } else if (response.data.images[0].faces[0].age.min < 90 && response.data.images[0].faces[0].age.max > 44)
                        $scope.category = "Category: Hillary";

                }
                $http({
                    method: 'POST',
                    url: 'https://eu11.salesforce.com/services/apexrest/resAcc',
                    data: {
                        "uniqueID": "uniqueIdIdz",
                        "sex": response.data.images[0].faces[0].gender.gender,
                        "age": response.data.images[0].faces[0].age.min,
                        "accuracy": response.data.images[0].faces[0].age.score
                    },
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer 00D0Y000000akoN!AREAQOEciwfejiEZBnqI3ho0_1op3OXEvGUaF.rSuMyEyLuC6rwgM8Xx.x2NGuwSSfSBF48mrHFTE26ueye1NOnuYDo20YZ7'
                    }
                }).then(function successCallback(response) {

                }, function errorCallback(response) {
                });
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

        $scope.uploadFile = function () {

            var collectionUrl = "https://watson-api-explorer.mybluemix.net/visual-recognition/api/v3/collections?" +
                "api_key=2bf3d9e76fed69e0c6309b47bc40760bb8936da3&version=2016-05-20";

            var findSimilarUrl = "";
            var findSimilarUrlFirstPart = "https://watson-api-explorer.mybluemix.net/visual-recognition/api/v3/collections/"

            var findSimilarUrlSecondPart = "/find_similar?" +
                "api_key=2bf3d9e76fed69e0c6309b47bc40760bb8936da3" +
                "&limit=1" +
                "&version=2016-05-20";

            var file = $scope.myFile;

            $http({
                method: 'GET',
                url: collectionUrl,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then(function successCallback(response) {
                if (response.data.collections.length > 0) {
                    var createCollection = true;
                    for (var i = 0; i < response.data.collections.length; i++) {
                        console.log(response.data.collections[i]);
                        findSimilarUrl = findSimilarUrlFirstPart + response.data.collections[i].collection_id + findSimilarUrlSecondPart;
                        var data = new FormData();
                        var collection = response.data.collections[i].collection_id;
                        data.append("image_file", file);
                        $http({
                            method: 'POST',
                            url: findSimilarUrl,
                            data: data,
                            headers: {
                                'Accept': 'application/json'
                            }
                        }).then(function successCallback(response) {
                            console.log(response.data.similar_images.length);
                            if (response.data.similar_images.length > 0) {
                                console.log(response.data.similar_images);
                                for (var j = 0; j < response.data.similar_images.length; j++) {
                                    if (response.data.similar_images[j].score > 0.5) {
                                        $scope.foundCollection = "Result: A collection is found for the image:  " + collection;
                                        createCollection = false;
                                        var addImageToCollectionUrl = "https://watson-api-explorer.mybluemix.net/visual-recognition/api/v3/collections/"
                                            + collection +
                                            "/images?api_key=2bf3d9e76fed69e0c6309b47bc40760bb8936da3&version=2016-05-20";
                                        var data = new FormData();
                                        data.append("image_file", file);
                                        $http({
                                            method: 'POST',
                                            url: addImageToCollectionUrl,
                                            data: data,
                                            headers: {
                                                'Accept': 'application/json'
                                            }
                                        }).then(function successCallback(response) {
                                        }, function errorCallback(response) {
                                        });
                                        break;
                                    }
                                    if (createCollection == true) {
                                        createCollection = false;
                                        var collectionName = new FormData();
                                        collectionName.append("name", "test")
                                        $http({
                                            method: 'POST',
                                            url: collectionUrl,
                                            data: collectionName,
                                            headers: {
                                                'Accept': 'application/json'
                                            }
                                        }).then(function successCallback(response) {
                                            $scope.foundCollection = "Result: No collection found, the image is added to a new collection :  " + response.data.collection_id;
                                            var addImageToCollectionUrl = "https://watson-api-explorer.mybluemix.net/visual-recognition/api/v3/collections/"
                                                + response.data.collection_id +
                                                "/images?api_key=2bf3d9e76fed69e0c6309b47bc40760bb8936da3&version=2016-05-20";
                                            $http({
                                                method: 'POST',
                                                url: addImageToCollectionUrl,
                                                data: data,
                                                headers: {
                                                    'Accept': 'application/json'
                                                }
                                            }).then(function successCallback(response) {
                                            }, function errorCallback(response) {
                                            });

                                        }, function errorCallback(response) {
                                        });
                                        break;
                                    }
                                }
                            }
                        }, function errorCallback(response) {
                        });
                    }

                } else {
                    console.log("NO collections")
                    var collectionName = new FormData();
                    collectionName.append("name", "test")
                    $http({
                        method: 'POST',
                        url: collectionUrl,
                        data: collectionName,
                        headers: {
                            'Accept': 'application/json'
                        }
                    }).then(function successCallback(response) {
                        $scope.foundCollection = "Result: No collection found, the image is added to a new collection :  " + response.data.collection_id;
                        var addImageToCollectionUrl = "https://watson-api-explorer.mybluemix.net/visual-recognition/api/v3/collections/"
                            + response.data.collection_id +
                            "/images?api_key=2bf3d9e76fed69e0c6309b47bc40760bb8936da3&version=2016-05-20";
                        var data = new FormData();
                        data.append("image_file", file);
                        $http({
                            method: 'POST',
                            url: addImageToCollectionUrl,
                            data: data,
                            headers: {
                                'Accept': 'application/json'
                            }
                        }).then(function successCallback(response) {
                        }, function errorCallback(response) {
                        });

                    }, function errorCallback(response) {
                    });
                }
            }, function errorCallback(response) {
            });


        };
    }
]);
