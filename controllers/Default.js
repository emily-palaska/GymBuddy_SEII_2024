'use strict';

var utils = require('../utils/writer.js');
var Default = require('../service/DefaultService');

module.exports.cancelReservation = function cancelReservation (req, res, next, username, day, time) {
  Default.cancelReservation(username, day, time)
    .then(function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response, response.code);
    });
};

module.exports.checkGoalsFromInfo = function checkGoalsFromInfo (req, res, next, username, currentBodyWeight) {
  Default.checkGoalsFromInfo(username, currentBodyWeight)
    .then(function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (error) {
      // console.log(error);
      utils.writeJson(res, error.message, error.code);
    });
};

module.exports.checkGoalsFromProgress = function checkGoalsFromProgress (req, res, next, username, day) {
  Default.checkGoalsFromProgress(username, day)
    .then(function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response, response.code);
    });
};

module.exports.createCustomExercise = function createCustomExercise (req, res, next, body, username) {
  Default.createCustomExercise(body, username)
    .then(function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response, response.code);
    });
};

module.exports.getAvailableReservations = function getAvailableReservations (req, res, next, username, day) {
  Default.getAvailableReservations(username, day)
    .then(function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response, response.code);
    });
};

module.exports.getDayofPlanner = function getDayofPlanner (req, res, next, username, day) {
  Default.getDayofPlanner(username, day)
    .then(function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response, response.code);
    });
};

module.exports.getDropDownMenuList = function getDropDownMenuList (req, res, next, username) {
  Default.getDropDownMenuList(username)
    .then(function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response, response.code);
    });
};

module.exports.getExerciseCatalog = function getExerciseCatalog (req, res, next, username) {
  Default.getExerciseCatalog(username)
    .then(function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response, response.code);
    });
};

module.exports.getExerciseProgress = function getExerciseProgress (req, res, next, username, exerciseName) {
  Default.getExerciseProgress(username, exerciseName)
    .then(function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response, response.code);
    });
};

module.exports.getMyReservations = function getMyReservations (req, res, next, username) {
  Default.getMyReservations(username)
    .then(function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response, response.code);
    });
};

module.exports.getPersonalInfo = function getPersonalInfo (req, res, next, username) {
  Default.getPersonalInfo(username)
    .then(function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response, response.code);
    });
};

module.exports.makeReservation = function makeReservation (req, res, next, body, username) {
  
  Default.makeReservation(body, username)
    .then(function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (error) {
      utils.writeJson(res, error.message, error.code);
    });
};

module.exports.updateExerciseProgress = function updateExerciseProgress (req, res, next, day, name, weight, reps, username) {
  Default.updateExerciseProgress(day, name, weight, reps, username)
    .then(function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response, response.code);
    });
};

module.exports.updatePersonalInfo = function updatePersonalInfo (req, res, next, body, username) {
  Default.updatePersonalInfo(body, username)
    .then(function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response, response.code);
    });
};
