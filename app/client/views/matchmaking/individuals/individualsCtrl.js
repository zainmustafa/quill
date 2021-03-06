angular.module('reg')
.controller('IndividualsCtrl', [
  '$scope',
  '$stateParams',
  'currentUser',
  'settings',
  'Utils',
  'UserService',
  'TEAM',
  'Session',
  function($scope, $stateParams, currentUser, settings, Utils, UserService, TEAM, Session){

    //icon tooltip popup
    $('.icon')
    .popup({
      on: 'hover'
    });
    // Semantic-UI moves modal content into a dimmer at the top level.
    // While this is usually nice, it means that with our routing will generate
    // multiple modals if you change state. Kill the top level dimmer node on initial load
    // to prevent this.
    $('.ui.dimmer').remove();
    // Populate the size of the modal for when it appears, with an arbitrary user.
    $scope.selectedUser = {};

    // Get the current user's most recent data.
    var Settings = settings.data;

    $scope.user = currentUser.data;
    $scope.pages = [];
    $scope.users = [];

    //Update table data
    function updateTable(data){
      $scope.users = data.users.filter(function(user){
        return user.id !== $scope.user.id;
      });
      $scope.currentPage = data.page;
      $scope.pageSize = data.size;

      var p = [];
      for (var i = 0; i < data.totalPages; i++){
        p.push(i);
      }
      $scope.pages = p;
    }
    function getMatchmakingData(){
      UserService
      .getMatchmaking('individuals', $stateParams.page, $stateParams.size, $scope.filter)
      .success(function(data){
        updateTable(data);
      })
    }
    $scope.filterMatchmaking = function() {
      UserService
        .getMatchmaking('individuals', $stateParams.page, $stateParams.size, $scope.filter)
        .success(function(data){
          updateTable(data);
        });
    }

    getMatchmakingData();


    //User selection

    $scope.selectIndividual = function(user){
      $scope.selectedUser = user;
      $scope.selectedUser.sections = generateSections(user);
      $('.long.individual.modal')
        .modal('show');
    }

    function generateSections(user){
      return [

        {
          name: 'Team Matchmaking',
          fields: [
            {
              name: 'Track',
              value: user.individual.mostInterestingTrack
            },{
              name: 'Role',
              value: user.individual.role
            },{
              name: 'Top Challenges',
              value: user.individual.topChallenges.join(', ')
            },{
              name: 'Description',
              value: user.individual.description
            },
            {
              name: 'Additional',
              value: user.individual.freeText
            }
          ]
        }
      ];
    }


  }]);
