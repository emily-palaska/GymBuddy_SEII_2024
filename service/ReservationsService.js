'use strict';
const { usernames, userReservations, availableReservations } = require("./Database");
/**
 * Cancels a reservation by deleting it
 * FR4 - The user must be able to cancel a reservation
 *
 * username String the username of the connected person
 * day Long the day of the reservation
 * no response value expected for this operation
 **/
exports.cancelReservation = function (day, time, username) {
  return new Promise(function (resolve, reject) {
    try {
      validateCancelReservationData(day, time, username);
      checkUsernameExistsForCancel(username);
      const reservationIndex = findReservationIndex(day, time, username);
      deleteReservation(username, reservationIndex);
      resolve({
        message: "Reservation successfully canceled.",
        code: 202
      });
    } catch (error) {
      reject(error);
    }
  });
};
// Function to validate the reservation data
function validateCancelReservationData(day, time, username) {
  if (typeof username !== "string" || typeof day !== "string" || typeof time !== "string") {
    throw {
      message: "Response code 400 (Bad Request): Invalid data types.",
      code: 400
    };
  }
}
// Function to check if the username exists
function checkUsernameExistsForCancel(username) {
  if (!userReservations[username]) {
    throw {
      message: "Response code 401 (Unauthorized): Username not found.",
      code: 401
    };
  }
}
// Function to find the reservation index
function findReservationIndex(day, time, username) {
  const reservationIndex = userReservations[username].findIndex(
    (reservation) => reservation.date === day && reservation.time === time
  );

  if (reservationIndex === -1) {
    throw {
      message: "Response code 404 (Not Found): Reservation does not exist.",
      code: 404
    };
  }

  return reservationIndex;
}
// Function to delete the reservation
function deleteReservation(username, reservationIndex) {
  userReservations[username].splice(reservationIndex, 1);
}

  /**
 * Returns all the reservations' details for a specific day (time, available seats)
 * FR2 - The user must be able to see the availability of a certain date and time
 *
 * username String the username of the connected person
 * day String the day selected for a reservation
 * returns List
 **/

exports.getAvailableReservations = function (day, username) {
    return new Promise(function (resolve, reject) {
      // Check if username exists
      if (!usernames.includes(username)) {
        reject({
          message: 'Response code 401 (Unauthorized): Not a valid username',
          code: 401
        });
      } else if (availableReservations[day]) {
        resolve(availableReservations[day]); // Return the reservations for the specified day
      } else {
        reject({
          message: 'Response code 404 (Not Found): No reservations found for the specified day.',
          code: 404
        });
      }
    });
  };

  /**
 * Returns the three upcoming reservations of a user
 * FR5 - The user must be able to see their reservations
 *
 * username String the username of the connected person
 * returns List
 **/
exports.getMyReservations = function (username) {
    return new Promise(function (resolve, reject) {
      // Validate username
      if (!usernames.includes(username)) {
        return reject({
          message: 'Response code 401 (Unauthorized): Not a valid username',
          code: 401
        });
      }
  
      // Get reservations for the username or return empty array if none
      const reservations = userReservations[username].slice(-3);
      resolve(reservations);
    });
  };

/**
 * Submits a reservation for a selected day and time
 * FR3 - A user must be able to make a reservation
 *
 * body Reservation A json object containing the Reservation info
 * day String the selected day
 * time String the selected time
 * musclegroup String the muscle group the user will train
 * username String the username of the connected person
 * no response value expected for this operation
 **/
exports.makeReservation = function (body, username) {
  return new Promise(function (resolve, reject) {
    try {
    validateReservationData(body, username);
    checkValidMuscleGroup(body.muscleGroup);
    checkUsernameExists(username);
    checkExistingReservations(body, username);
    createReservation(body, username);
    resolve({
      message: "Reservation successfully created.",
      code: 201
    });
    } catch (error) {
    reject(error);
    }
  });
};

// Function to validate the reservation data
function validateReservationData(body, username) {
  if (
    typeof body.date !== "string" ||
    typeof body.time !== "string" ||
    typeof body.muscleGroup !== "string" ||
    typeof username !== "string"
  ) {
    throw {
      message: "Response code 400 (Bad Request): Invalid data types.",
      code: 400
    };
  }
}
// Function to check if the muscle group is valid
function checkValidMuscleGroup(muscleGroup) {
  const validMuscleGroups = ["upper", "lower", "core", "cardio"];
  if (!validMuscleGroups.includes(muscleGroup)) {
    throw {
      message: `Response code 400 (Bad Request): Invalid muscle group. Must be one of ${validMuscleGroups.join(", ")}.`,
      code: 400
    };
  }
}
// Function to check if the username exists
function checkUsernameExists(username) {
  if (!userReservations[username]) {
    throw {
      message: "Response code 401 (Unauthorized): Username not found.",
      code: 401
    };
  }
}
// Function to check if the reservation already exists
function checkExistingReservations(body, username) {
  const existingReservations = userReservations[username].filter(
    (reservation) => reservation.date === body.date && reservation.time === body.time
  );
  if (existingReservations.length > 0) {
    throw {
      message: "Response code 409 (Conflict): Time slot already reserved.",
      code: 409
    };
  }
}
// Function to create a reservation
function createReservation(body, username) {
  const newReservation = { date: body.date, muscleGroup: body.muscleGroup, time: body.time };
  userReservations[username].push(newReservation);
}