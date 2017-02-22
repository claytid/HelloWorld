var fs = require('fs');
var _ = require('lodash');

console.log("Hello World")

var parser = require('junit-xml-parser').parser;
var workspace = process.argv[2];
console.log("workspace",workspace);
var filename = workspace + "/build/junit/TEST-sample.HelloWorldTest.xml";

fs.readFile(filename, 'utf8', function (err,data) {
	if (err) {
    	return console.log(err);
  	} else {
  		// console.log("data",data);
		parser.parse(data).then(function (results) { 
			console.log( "Tests:",results.suite.tests.length, results.suite.name);
			// console.log( "Tests:",results.suite.tests );
			_.each(results.suite.tests,function(test){
				console.log("Test:",test);
			})
		});
	}
});

console.log("done!");

