
// node.js Test Automation results upload to Agile Central.
// Barry Mullan (Feb 2017)

// Script is invoked as part of a jenkins build step.
// MVP
// 1. test automation result files are read from the build directory.
// 2. parse each results file to get the results.
// 3. for each result we have a test name and results.
// 4. for each test, search AC for existing test. 
// 5. if it does not exist create it setting the name, project, test type.
// 6. create and associate test case result from the results including build, 
// verdict, message, date, duration

// MVP 2
// 1. use a story id in the suite name
// 2. find the story and associate the test case to that story.
// 3. add the result file as an attachment.

// MVP 3
// 1. use junit annotations to specify the story name/id

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var async = require('async');

var rally = require('rally'),
	refUtils = rally.util.ref,
 	queryUtils = rally.util.query;

// config file provided by jenkins
var config = require(process.argv[2]);

var restApi = rally(config);

// console.log("Using Config",config);
var parser = require('junit-xml-parser').parser;
var jenkinsWorkspace = process.argv[3];
var buildNumber = process.argv[4];
console.log("workspace",jenkinsWorkspace);

// var filename = workspace + "/build/junit/TEST-sample.HelloWorldTest.xml";
var xmlPath = jenkinsWorkspace + "/build/junit";
var workspace = null;
var project = null;

readWorkspaceRef( config["workspace"], function(error,ws) {
	console.log("looking for project",config["project"]);
	workspace = ws;
	readProjectRef( config["project"], function(error,p) {
		project = p; 
		console.log("ws",ws["_ref"],"project",project["_ref"]);
		walkSync(xmlPath, function(filePath, stat) {
		    // do something with "filePath"...
		    processFile(filePath);
		    console.log(filePath);
		});
	});
});

function findRallyTestCase(name, callback) {

	var q = queryUtils.where("name" , "=" , name )

	restApi.query({
	    type: 'testcase', //the type to query
	    start: 1, //the 1-based start index, defaults to 1
	    pageSize: 200, //the page size (1-200, defaults to 200)
	    limit: 'Infinity', //the maximum number of results to return- enables auto paging
	    // order: 'Rank', //how to sort the results
	    fetch: ['FormattedID','Name','Project'], //the fields to retrieve
	    query: q,
	    scope: {
	        workspace: workspace._ref, // '/workspace/1234' //specify to query entire workspace
	        project: project._ref, // config['source-project'],
	        up: false, //true to include parent project results, false otherwise
	        down: true //true to include child project results, false otherwise
	    },
	    requestOptions: {} //optional additional options to pass through to request
	}, function(error, result) {
	    if(error) {
	        console.log("Error",error);
	        callback(error,result);
	    } else {
	        console.log("query result:"+result.Results.length);
	        callback(null,_.first(result.Results));
	    }
	});

}

function resultFromJunitResult(junitResult) {

	var verdict = "Pass";

	// console.log("failure:\n",junitResult.failure.raw)

	if (junitResult.failure)
		verdict = "Fail";


	var result = {
		"Build" : ""+buildNumber,
		"Date" : new Date().toISOString(),
		"Duration" : junitResult.time,
		"Notes" : junitResult.failure ? 
			// (junitResult.failure.message + "<p></p" + junitResult.failure.raw) : "",
			(junitResult.failure.message + "\n" + junitResult.failure.raw) : "",
		"Verdict" : verdict
	}

	// console.log("junit result",result);
	return result;
}

function createTestCaseResult(testCase, result, callback) {

	console.log(testCase.FormattedID,result);
	result["TestCase"] = testCase["_ref"];

	restApi.create({
	    type: 'testcaseresult', //the type to create
	    data: result,
	    fetch: ['FormattedID'],  //the fields to be returned on the created object
	    scope: {
	        workspace: workspace._ref,
	        project : project._ref
	    },
	    requestOptions: {} //optional additional options to pass through to request
	}, function(error, result) {
	    if(error) {
	        console.log(error);
	        callback(error,null);
	    } else {
	        // console.log(result.Object);
	        callback(null,result.Object);
	    }
	});

}

function createTestCase(testCase, callback) {

	restApi.create({
	    type: 'testcase',
	    data: testCase,
	    fetch: ['FormattedID'],  //the fields to be returned on the created object
	    scope: {
	        workspace: workspace._ref,
	        project: project._ref
	    },
	    requestOptions: {} //optional additional options to pass through to request
	}, function(error, result) {
	    if(error) {
	        console.log(error);
	        callback(error,null);
	    } else {
	        callback(null,result.Object);
	    }
	});
}

function readWorkspaceRef(workspaceName,callback) {
	restApi.query({
	    type: 'workspace', //the type to query
	    start: 1, //the 1-based start index, defaults to 1
	    pageSize: 200, //the page size (1-200, defaults to 200)
	    limit: 'Infinity', //the maximum number of results to return- enables auto paging
	    // order: 'Rank', //how to sort the results
	    fetch: ['Name', 'ObjectID','Projects'], //the fields to retrieve

	    // query: queryUtils.where('ObjectID', '!=', 0), //optional filter
	}, function(error, result) {
	    if(error) {
	        console.log("Error",error);
	        callback(error,null);
	    } else {
	    	// console.log("ws results",result);
			var workspace = _.find(result.Results,function(r) {
	        	return r.Name === workspaceName;
	        });
	        // console.log(workspace.Projects);
	        callback(null,workspace)
	    }
	});
}

function readProjectRef(projectName,callback) {
	console.log("looking for project ",projectName)
	var q = queryUtils.where("name" , "=" , projectName )
	console.log("looking for project ",q)
	restApi.query({
	    type: 'project', //the type to query
	    start: 1, //the 1-based start index, defaults to 1
	    pageSize: 200, //the page size (1-200, defaults to 200)
	    limit: 'Infinity', //the maximum number of results to return- enables auto paging
	    // order: 'Rank', //how to sort the results
	    fetch: ['Name'], //the fields to retrieve
	    query: q,
	    scope: {
	        workspace: workspace._ref, // '/workspace/1234' //specify to query entire workspace
	    },
	    requestOptions: {} //optional additional options to pass through to request
	}, function(error, result) {
	    if(error) {
	        console.log("Error",error);
	        callback(error,result);
	    } else {
	        console.log("query result:"+result.Results);
	        callback(null,_.first(result.Results));
	    }
	});
}


function processTest(test,callback) {

	console.log("=================================");
	console.log("searching for ... " + test.name);
	findRallyTestCase(test.name,function(error,tc){
		console.log("found....",tc !==undefined ? tc.FormattedID : " (null)");
		if (tc) {
			createTestCaseResult(tc,resultFromJunitResult(test),function(error,tcr){
				console.log("tcr",tcr._ref);
				callback(null,tcr);
			})
		} else {
			createTestCase( 
				{ name : test.name, 
				  project : project._ref, 
				  workspace : workspace._ref},
				  function(error,tc) {
				  	if (tc) {
						createTestCaseResult(tc,resultFromJunitResult(test),function(error,tcr){
							console.log("tcr",tcr._ref);
							callback(null,tcr);
						})
				  	}
			});
		}
	})

}

function processFile(filename) {
	fs.readFile(filename, 'utf8', function (err,data) {
		if (err) {
	    	return console.log(err);
	  	} else {
	  		// console.log("data",data);
			parser.parse(data).then(function (results) { 
				// console.log( "Tests:",results.suite.tests.length, results.suite.name);
				// console.log( "Suite:",results.suite, results.suite.name);
				// console.log( "Tests:",results.suite.tests );
				async.mapSeries(results.suite.tests,processTest,function(error,results){
					console.log("done! ",results.length);
				})
			});
		}
	});
}


function walkSync(currentDirPath, callback) {

    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        // console.log(path.extname(filePath));
        if (stat.isFile() && path.extname(filePath)==".xml") {
            callback(filePath, stat);
        } else if (stat.isDirectory()) {
            walkSync(filePath, callback);
        }
    });
}