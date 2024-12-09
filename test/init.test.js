
const http = require('node:http');
const test = require('ava');
const got = require('got');

const app = require('../index');

test.before(async (t) => { 
	t.context.server = http.createServer(app);
    const server = t.context.server.listen();
    const { port } = server.address();
	t.context.got = got.extend({ responseType: "json", prefixUrl: `http://localhost:${port}` });
});

test.after.always((t) => {
	t.context.server.close();
});

  //////////////////////////
 // GET /planner/catalog //
//////////////////////////
test("GET /user/{usename}/planner/catalog returns correct response and status code", async (t) => {
	const { body, statusCode } = await t.context.got("user/default/planner/catalog");
	//t.is(body.message, "Exercises Catalogue");
	t.is(statusCode, 200);
	// Verify the body structure
	t.true(Array.isArray(body.exercises), "Exercises should be an array");
	t.is(body.exercises[0].name, "Lat Pull Down", "The first exercise name should be 'Lat Pull Down'");
	t.is(body.exercises[0].notes, "Targets the latissimus dorsi muscles, which are the large muscles of the back. Setup: Sit on a lat pull-do...", "The first exercise notes should be 'Targets the latissimus dorsi muscles, which are the large muscles of the back. Setup: Sit on a lat pull-do...'");
});

test("GET /user/{usename}/planner/catalog Bad request - invalid username", async (t) => {
	const { body, statusCode } = await t.context.got("user/invalid-user/planner/catalog",{
		throwHttpErrors: false // Prevent `got` from rejecting the promise on 4xx responses
	});
	//t.is(body.message, "Exercises Catalogue");
	t.is(statusCode, 401);
});


///////////////////////
// GET /settings //
///////////////////////

test("GET /user/{username}/settings with Correct Request", async (t) => {
	const { body, statusCode } = await t.context.got("user/john_doe/settings", {
	  throwHttpErrors: false,
	});

	t.is(statusCode, 200); // Ensure the status code is 200
	t.deepEqual(body, {
	  gender: "male",
	  goalConsistencyNum: 4,
	  goalBodyWeightNum: 75,
	  bodyweight: 80.5,
	  goals: [true, false, true],
	}); // Verify the response body matches expected data
  });

 test("GET /user/{username}/settings with Bad Request (invalid username)", async (t) => {
	const { body, statusCode } = await t.context.got("user/invalid_user/settings", {
	  throwHttpErrors: false,
	});
  
	t.is(statusCode, 401); // Unauthorized
	//t.true(body.error.includes("Invalid username")); // Verify error message
  });  


  test("GET /user/{username}/settings with No Data Found", async (t) => {
	const { body, statusCode } = await t.context.got("user/alice_wonder/settings", {
	  throwHttpErrors: false,
	});
  
	t.is(statusCode, 404); // Not Found
  }); 


  ///////////////////
 // PUT /settings //
///////////////////
test("PUT /user/{username}/settings updates the bodyweight and other settings", async (t) => {
	//const username = "default";
	const newPersonalInfo = {
		bodyweight: 64.0, // Updated bodyweight
		gender: "female",
		goals: [false, true, true, true],
		goalConsistencyNum: 6,
		goalBodyWeightNum: 55.00,
	};

	const { body, statusCode } = await t.context.got.put("user/jane_smith/settings",
		{
		json: newPersonalInfo,
		responseType: "json",
		}
	);
	t.is(statusCode, 200);
	t.deepEqual(body.updatedInfo, newPersonalInfo, "The updated personal info should match");

});

test("PUT /user/{username}/settings with Bad Request (wrong datatypes)", async (t) => {
	const newPersonalInfo = {
		bodyweight: "hello", 
		gender: "2744",
		goals: [false, true, true, true],
		goalConsistencyNum: 6,
		goalBodyWeightNum: 55.00,
	};
	const { body, statusCode } = await t.context.got.put("user/jane_smith/settings",{
			json: newPersonalInfo,
			responseType: "json",
			throwHttpErrors: false // Prevent `got` from rejecting the promise on 4xx responses
		});
	// Check for bad request response
	t.is(statusCode, 400);
});

test("PUT /user/{username}/settings with Bad Request ( username doesn't exists )", async (t) => {
	const newPersonalInfo = {
		bodyweight: 52.0, 
		gender: "female",
		goals: [false, true, true, true],
		goalConsistencyNum: 6,
		goalBodyWeightNum: 47.00,
	};
	const { body, statusCode } = await t.context.got.put("user/dimitra/settings",{
			json: newPersonalInfo,
			responseType: "json",
			throwHttpErrors: false // Prevent `got` from rejecting the promise on 4xx responses
		});
	// Check for bad request response
	t.is(statusCode, 401);
	t.deepEqual(body.message, 'Response code 401 (Unauthorized): Not a valid username');
});

  /////////////////////////////////////////
 // GET /user/{username}/settings/goals //
/////////////////////////////////////////

test("GET /user/{usename}/settings/goals with Correct Request ( Achieved Goal!!! )", async (t) => {
	const { body, statusCode } = await t.context.got("user/adrian_carter/settings/goals", {
		searchParams: {
			currentBodyWeight: "91.00"
		},
		throwHttpErrors: false // Prevent `got` from rejecting the promise on 4xx responses
	});
	t.is(statusCode, 200);
	t.deepEqual(body.message, 'Victory Animation');
});

test("GET /user/{usename}/settings/goals with Correct Request ( User is closer to the goal but hasn't achieved it yet. )", async (t) => {
	const { body, statusCode } = await t.context.got("user/adrian_carter/settings/goals", {
		searchParams: {
			currentBodyWeight: "80.00"
		},
		throwHttpErrors: false // Prevent `got` from rejecting the promise on 4xx responses
	});
	t.is(statusCode, 200);
	t.deepEqual(body.message, 'Keep trying. You are closer to your goal');
});

test("GET /user/{usename}/settings/goals with Correct Request ( User negative progress )", async (t) => {
	const { body, statusCode } = await t.context.got("user/adrian_carter/settings/goals", {
		searchParams: {
			currentBodyWeight: "70.00"
		},
		throwHttpErrors: false // Prevent `got` from rejecting the promise on 4xx responses
	});
	t.is(statusCode, 200);
	t.deepEqual(body.message, 'You can do better! I believe in you!');
});

test("GET /user/{usename}/settings/goals with Correct Request ( The goal weight loss/gain is not active)", async (t) => {
	const { body, statusCode } = await t.context.got("user/default/settings/goals", {
		searchParams: {
			currentBodyWeight: 81.00
		}
	});
	t.is(statusCode, 200);
	t.deepEqual(body.message, 'No weight loss/gain goal active');
});

test("GET /user/{usename}/settings/goals with Bad Request ( missing query param (currentBodyWeight) )", async (t) => {
	const { body, statusCode } = await t.context.got("user/default/settings/goals", {
		throwHttpErrors: false // Prevent `got` from rejecting the promise on 4xx responses
	});
	t.is(statusCode, 400);
});

test("GET /user/{usename}/settings/goals with Bad Request ( not previous BodyWeight data with goal enabled )", async (t) => {
	const { body, statusCode } = await t.context.got("user/john_doe/settings/goals", {
		searchParams: {
			currentBodyWeight: 81.00
		},
		throwHttpErrors: false // Prevent `got` from rejecting the promise on 4xx responses
	});
	t.is(statusCode, 404);
});

test("GET /user/{usename}/settings/goals with Bad Request ( wrong currentBodyWeight datatype)", async (t) => {
	const { body, statusCode } = await t.context.got("user/default/settings/goals", {
		searchParams: {
			currentBodyWeight: "hello"
		},
		throwHttpErrors: false // Prevent `got` from rejecting the promise on 4xx responses
	});
	t.is(statusCode, 400);
});

test("GET /user/{usename}/settings/goals with Bad Request ( username doesn't exist)", async (t) => {
	const { body, statusCode } = await t.context.got("user/dimitra/settings/goals", {
		searchParams: {
			currentBodyWeight: "55.00"
		},
		throwHttpErrors: false // Prevent `got` from rejecting the promise on 4xx responses
	});
	t.is(statusCode, 401);
});

test("GET /user/{usename}/settings/goals with Bad Request ( missing goal BodyWeight )", async (t) => {
	const { body, statusCode } = await t.context.got("user/nathaniel_brooks/settings/goals", {
		searchParams: {
			currentBodyWeight: "70.00"
		},
		throwHttpErrors: false // Prevent `got` from rejecting the promise on 4xx responses
	});
	t.is(statusCode, 404);
});

  ///////////////////////////////////////////
 // POST /user/{username}/planner/catalog //
///////////////////////////////////////////

test("POST /user/{username}/planner/catalog with Correct Request (Mock Data)", async (t) => {
	const newExercise = {
		name: "Bench Press",
		notes: "Targets the pectoral muscles, triceps, and anterior deltoids. Setup: Lie on a flat bench with your feet flat on the floor. Grasp the barbell with your hands slightly wider than shoulder-width apart. Lower the bar to your chest, then press it back up to the starting position.",
	};
	const { body, statusCode } = await t.context.got.post("user/default/planner/catalog", {
		json: newExercise,
		responseType: "json",
	});
	t.is(statusCode, 201);
	t.deepEqual(body.exercise, newExercise);
});

test("POST /user/{username}/planner/catalog with Bad Request - Already existing exercise", async (t) => {
	const newExercise = {
		name: "Lat Pull Down",
		notes: "blah blah blah",
	};
	const { body, statusCode } = await t.context.got.post("user/default/planner/catalog", {
		json: newExercise,
		responseType: "json",
		throwHttpErrors: false
	});
	t.is(statusCode, 409);
	t.deepEqual(body.exercise.name, newExercise.name);
});

  /////////////////////////
 // GET /progress/goals //
/////////////////////////

test("GET /user/{usename}/progress/goals with Bad Request (no day parameter)", async (t) => {
	const { body, statusCode } = await t.context.got("user/default/planner/progress/goals", {
		throwHttpErrors: false // Prevent `got` from rejecting the promise on 4xx responses
	});
	t.is(statusCode, 400);
});

test("GET /user/{usename}/progress/goals with Bad Request (no data for requested day)", async (t) => {
	const { body, statusCode } = await t.context.got("user/john_doe/planner/progress/goals", {
		searchParams: {
			day: 10
		},
		throwHttpErrors: false // Prevent `got` from rejecting the promise on 4xx responses
	});
	t.is(statusCode, 404);
});

test("GET /user/{usename}/progress/goals with Bad Request (wrong day datatype)", async (t) => {
	const { body, statusCode } = await t.context.got("user/default/planner/progress/goals", {
		searchParams: {
			day: "hello"
		},
		throwHttpErrors: false // Prevent `got` from rejecting the promise on 4xx responses
	});
	t.is(statusCode, 400);
});

test("GET /user/{usename}/progress/goals with Correct Request (Mock Data)", async (t) => {
	const { body, statusCode } = await t.context.got("user/john_doe/planner/progress/goals", {
		searchParams: {
			day: 2
		}
	});
	t.is(statusCode, 200);
	t.deepEqual(body, {message: [true, true, true, true, true], code: 200});  // Check with the mock data
});

///////////////////////
// GET /reservations //
///////////////////////

test("GET /user/{usename}/reservations with Bad Request (no day parameter)", async (t) => {
	const { body, statusCode } = await t.context.got("user/default/reservations", {
		throwHttpErrors: false // Prevent `got` from rejecting the promise on 400 responses
	});
	t.is(statusCode, 400);
});

test("GET /user/{usename}/reservations with Bad Request (invalid username)", async (t) => {
	const { body, statusCode } = await t.context.got("user/no_name/reservations", {
		searchParams: {
			day: 3
		},
		throwHttpErrors: false // Prevent `got` from rejecting the promise on 400 responses
	});
	t.is(statusCode, 401);
});

test("GET /user/{usename}/reservations with Bad Request (no existing data)", async (t) => {
	const { body, statusCode } = await t.context.got("user/default/reservations", {
		searchParams: {
			day: 30
		},
		throwHttpErrors: false // Prevent `got` from rejecting the promise on 400 responses
	});
	t.is(statusCode, 404);
});

test("GET /user/{usename}/reservations with Correct Request", async (t) => {
	const { body, statusCode } = await t.context.got("user/john_doe/reservations", {
		searchParams: {
			day: 1
		}
	});
	t.is(statusCode, 200);
	t.deepEqual(body, [
		{ "date": "2024-11-01", "reservationsPerMuscleGroup": [1, 2, 3, 4, 5], "time": "08:00", "availability": 50 },
		{ "date": "2024-11-01", "reservationsPerMuscleGroup": [0, 0, 0, 0, 0], "time": "10:00", "availability": 50 }
	  ]);  // Check with the mock data
});

////////////////////////
// POST /reservations //
////////////////////////

test("POST /user/{username}/reservations with Correct Request (Mock Data)", async (t) => {
	const bodyData = {
		date: "2024-11-01",
	  	time: "10:00",
	  	muscleGroup: "lower",
	};
	const { body, statusCode } = await t.context.got.post("user/john_doe/reservations", {
		json: bodyData
	});
	t.is(statusCode, 201);
 });
 
 test("POST /user/{username}/reservations with Bad Request (Invalid data type)", async (t) => {
	const bodyData = {
		date: 123,
	  	time: 123,
	  	muscleGroup: 123,
	};
	const { body, statusCode } = await t.context.got.post("user/john_doe/reservations", {
		json: bodyData,
		throwHttpErrors: false
	});
	t.is(statusCode, 400);
 });

 test("POST /user/{username}/reservations with Bad Request (Invalid muscle group)", async (t) => {
	const bodyData = {
		date: "2024-11-01",
	  	time: "10:00",
	  	muscleGroup: "legs",
	};
	const { body, statusCode } = await t.context.got.post("user/john_doe/reservations", {
		json: bodyData,
		throwHttpErrors: false
	});
	t.is(statusCode, 400);
 });

test("POST /user/{username}/reservations with Bad Request (Not existing username)", async (t) => {
	const bodyData = {
		date: "2024-11-01",
	  	time: "10:00",
	  	muscleGroup: "lower",
	};
	const { body, statusCode } = await t.context.got.post("user/no_name/reservations", {
		json: bodyData,
		throwHttpErrors: false
	});
	t.is(statusCode, 401);
 });

 test("POST /user/{username}/reservations with Bad Request (Existing Reservation)", async (t) => {
	const bodyData = {
		date: "2024-11-01",
	  	time: "10:00",
	  	muscleGroup: "upper",
	};
	const { body, statusCode } = await t.context.got.post("user/john_doe/reservations", {
		json: bodyData,
		throwHttpErrors: false
	});
	t.is(statusCode, 409);
 });


//////////////////////////
// DELETE /reservations //
//////////////////////////

test("DELETE /user/{username}/reservations with Correct Request (Mock Data)", async (t) => {
	const { body, statusCode } = await t.context.got.delete("user/john_doe/reservations", {
		searchParams: {
			day: "2024-11-01",
			time: "08:00"
		}, // Send query parameters
	});
	t.is(statusCode, 202);
});

test("DELETE /user/{username}/reservations with Bad Request (Invalid data types)", async (t) => {
	const { body, statusCode } = await t.context.got.delete("user/john_doe/reservations", {
		searchParams: {
			day: undefined, // Invalid data type
			time: false // Invalid data type
		},
		throwHttpErrors: false // Ensure the test doesn't throw on error response
	});
	t.is(statusCode, 400)
});


///////////////////////
// GET /planner //
///////////////////////

test("GET /user/{username}/planner with Bad Request (no day parameter)", async (t) => {
	const { body, statusCode } = await t.context.got("user/default/planner", {
		throwHttpErrors: false,
	});
	t.is(statusCode, 400); // Expect a 400 Bad Request
    
});


test("GET /user/{username}/planner with Bad Request or Not Found", async (t) => {
    //try {
        const { body, statusCode } = await t.context.got("user/john_doe/planner", {
            searchParams: {
                day: 5,
            },
            throwHttpErrors: false,
        });
		t.is(statusCode, 404);
});


test("GET /user/{usename}/planner with Bad Request (wrong day datatype)", async (t) => {
	const { body, statusCode } = await t.context.got("user/default/planner", {
		searchParams: {
			day: "invalid_day"
		},
		throwHttpErrors: false
	});
	t.is(statusCode, 400);
});


test("GET /user/{usename}/planner with Correct Request", async (t) => {
		const { body, statusCode } = await t.context.got("user/john_doe/planner", {
			searchParams: {
				day: 1
			},
			throwHttpErrors: false
		});
		t.is(statusCode, 200);
		t.deepEqual(body, {
			currentDate: 1,
			exercisesList: [
			{
				name: "Romanian Deadlift",
				notes: "Focus on form",
				weightPerDateEntries: [60, 65],
				repetitionsPerDateEntries: [8, 12],
			},
			{
				name: "Hip Thrust",
				notes: "Keep back straight",
				weightPerDateEntries: [80, 85],
				repetitionsPerDateEntries: [10, 15],
			},
			],
		});
});

test("GET /user/{username}/planner with Default User", async (t) => {
	const { body, statusCode } = await t.context.got("user/default/planner", {
		searchParams: {
		day: 1,
		},
	});
	
	t.is(statusCode, 200);
	t.deepEqual(body, {
		currentDate: 1,
		exercisesList: [],
	});
});	

  //////////////////////////
 // GET /myreservations  //
//////////////////////////

test("GET /user/{username}/myreservations with Bad Request Format", async (t) => {
    const { statusCode, body } = await t.context.got("user/default/myreservations", {
        throwHttpErrors: false,
        searchParams: {
            day: "invalid_day"
        }
    });

    t.is(statusCode, 400);

});

test("GET /user/{username}/myreservations returns up to 3 upcoming reservations", async (t) => {
    const { body, statusCode } = await t.context.got("user/john_doe/myreservations",{
    });

    t.is(statusCode, 200);

    t.deepEqual(body, [
        { date: "2024-11-02", muscleGroup: "lower", time: "10:00" },
    	{ date: "2024-11-03", muscleGroup: "core", time: "12:00" },
    	{ date: "2024-11-04", muscleGroup: "cardio", time: "06:00" }          
    ]);
});

test("GET /user/{username}/myreservations returns empty array if no reservations", async (t) => {
    const { body, statusCode } = await t.context.got("user/default/myreservations");
    t.is(statusCode, 200);
    t.deepEqual(body, []); // Empty array
});

test("GET /user/{username}/myreservations with invalid username", async (t) => {
    const { statusCode, body } = await t.context.got("user/no_name/myreservations", {
        throwHttpErrors: false
    });

    t.is(statusCode, 401);

});

  //////////////////////////
 // GET planner/progress //
//////////////////////////

test("GET /user/{usename}/planner/progress with Bad Request Format", async (t) => {
	const { body, statusCode } = await t.context.got("user/default/planner/progress", {
		throwHttpErrors: false,
        searchParams: {
            day: "invalid_day" // Simulating an invalid query parameter
        }
	});
	t.is(statusCode, 400);
});

test("DELETE /user/{username}/reservations with Unauthorized Request (Non-existent username)", async (t) => {
	const { body, statusCode } = await t.context.got.delete("user/non_existent_user/reservations", {
		searchParams: {
			day: "2024-11-01",
			time: "08:00"
		},
		throwHttpErrors: false, 
	});
	t.is(statusCode, 401);
});

test("GET /user/{username}/planner/progress returns exercise details successfully", async (t) => {
    const { body, statusCode } = await t.context.got("user/default/planner/progress");

    t.is(statusCode, 200);
    
    t.true(Array.isArray(body.exercises)); // response contains an "exercises" array

    t.deepEqual(body.exercises, [
        { "notes" : "note1", "name" : "exercise_1", "weightPerDateEntries" : [ 5, 6, 6, 8, 8, 5, 6, 6, 8, 8], "repetitionsPerDateEntries" : [ 10, 10, 15, 10, 10 ] },
        { "notes" : "note2", "name" : "exercise_2", "weightPerDateEntries" : [ 20, 25, 25, 25 ,30, 20, 25, 25, 25 ,30], "repetitionsPerDateEntries" : [ 15, 15, 15, 20, 15 ]  },
        { "notes" : "note3", "name" : "exercise_3", "weightPerDateEntries" : [ 30, 35, 35, 40, 45, 30, 35, 35, 40, 45], "repetitionsPerDateEntries" : [ 5, 5, 5, 5 ,8 ] }
    ]);
});

test("GET /user/{usename}/planner/progress with invalid username", async (t) => {
	const { body, statusCode } = await t.context.got("user/no_name/planner/progress", {
		throwHttpErrors: false
	});
	t.is(statusCode, 401);
});

test("DELETE /user/{username}/reservations with Not Found (Non-existent reservation)", async (t) => {
	const { body, statusCode } = await t.context.got.delete("user/john_doe/reservations", {
		searchParams: {
			day: "2024-11-01",
			time: "20:00" // No reservation at this time
		},
		throwHttpErrors: false
	});
	t.is(statusCode, 404);
});
  //////////////////////////
 // PUT planner/progress //
//////////////////////////

test("PUT /user/{username}/planner/progress updates exercise progress entries successfully", async (t) => {
    const day = 8;
    const name = "Bench_Press";
    const weight = 70;
    const reps = 10;
  
    // Send the PUT request
    const { body, statusCode } = await t.context.got.put("user/john_doe/planner/progress", {
        searchParams: {
            day: day,
            name: name,
            weight: weight,
            reps: reps
        },
        responseType: "json"
    });

    // Validate the response
    t.is(statusCode, 200);
  
    // Ensure updated progress matches expectations
    t.deepEqual(body.updatedProgress.weightPerDateEntries[day - 1], weight, "The updated exercise weight should match");
    t.deepEqual(body.updatedProgress.repetitionsPerDateEntries[day - 1], reps, "The updated exercise reps should match");
  });
  

    test("PUT /user/{username}/planner/progress with bad request", async (t) => {
        const day = 10;
        const newProgress = {
            name: "Bench Press",
            weightPerDateEntries: "1234",
            repetitionsPerDateEntries: 10
        };
    
    // Send the PUT request
        const { body, statusCode } = await t.context.got.put("user/john_doe/planner/progress",
            {
                json: newProgress,
                responseType: "json",
                throwHttpErrors: false
            });    
    
        t.is(statusCode, 400);
    });

    test("PUT /user/{username}/planner/progress with invalid username", async (t) => {
        const day = 8;
        const name = "Bench_Press";
        const weight = 70;
        const reps = 10;
    
    // Send the PUT request
        const { body, statusCode } = await t.context.got.put("user/no_name/planner/progress",
            {
                throwHttpErrors: false,
                searchParams: {
                    day: day,
                    name: name,
                    weight: weight,
                    reps: reps
                },
                responseType: "json"
            }
        );
    
        t.is(statusCode, 401);
    });

    test("PUT /user/{username}/planner/progress with non-existing exercise name", async (t) => {
        const day = 8;
        const name = "Bench_Press";
        const weight = 70;
        const reps = 10;
    
    // Send the PUT request
        const { body, statusCode } = await t.context.got.put("user/jane_smith/planner/progress",{
                throwHttpErrors: false,
                searchParams: {
                    day: day,
                    name: name,
                    weight: weight,
                    reps: reps
                },
                responseType: "json"
            }
        );
    
        t.is(statusCode, 404);
    });

/////////////////////////
// GET /catalog/{exercise-name} //
///////////////////////// 

test("GET /user/{usename}/planner/catalog/{exercise-name} with Bad Request (invalid exercise_name parameter)", async (t) => {
	const { body, statusCode } = await t.context.got("user/default/planner/catalog/no_exercise", {
		throwHttpErrors: false 
	});

	t.is(statusCode, 404);
});


test("GET /user/{username}/planner/catalog/{exercise-name} with Bad Request (invalid username)", async (t) => {
	const { body, statusCode } = await t.context.got("user/invalid_user/planner/catalog/lat-pull-down", {
	  throwHttpErrors: false
	});

	t.is(statusCode, 401);
  
});
  
test("GET /user/{usename}/planner/catalog/{exercise_name} with Correct Request", async (t) => {
	const { body, statusCode } = await t.context.got("user/john_doe/planner/catalog/lat-pull-down", {
		throwHttpErrors: false
	});

	t.is(statusCode, 200);

	t.deepEqual(body, {
		name: "Lat Pull Down",
	 	notes: "Targets the latissimus dorsi muscles, which are the large muscles of the back. Setup: Sit on a lat pull-down machine with your knees securely under the pads. Adjust the thigh pads to fit comfortably against your thighs. Grasp the wide bar with an overhand grip, hands slightly wider than shoulder-width apart.",
		weightPerDateEntries: [40.0, 42.5, 45.0],
		repetitionsPerDateEntries: [10, 12, 14],
	  });
});

test("GET /user/{usename}/planner/catalog/{exercise_name} with Correct Request and no exercise progress", async (t) => {
	const { body, statusCode } = await t.context.got("user/jane_smith/planner/catalog/deadlift", {
		throwHttpErrors: false
	});
	t.is(statusCode, 200);
	t.deepEqual(body, {
		name: "deadlift",
		notes: "Focus on keeping a neutral spine and engage your core. Avoid rounding your back during the lift.",
		weightPerDateEntries: [],
		repetitionsPerDateEntries: [],
	});
});
