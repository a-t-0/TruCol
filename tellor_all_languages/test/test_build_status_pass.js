const SampleUsingTellor = artifacts.require("./SampleUsingTellor.sol");
const Tellor = artifacts.require("TellorPlayground.sol");

//Helper function that submits and value and returns a timestamp for easy retrieval
const submitTellorValue = async (tellorOracle, requestId, amount) => {
  //Get the amount of values for that timestamp
  let count = await tellorOracle.getNewValueCountbyRequestId();
  await tellorOracle.submitValue(requestId, amount);
  let time = await getTimestampbyRequestIDandIndex(requestId, count.toString());
  return time.toNumber();
};

contract("UsingTellor Tests", function (accounts) {
	let sampleUsingTellor;
	let tellorOracle;

	beforeEach("Setup contract for each test", async function () {
	tellorOracle = await Tellor.new();
	sampleUsingTellor = await SampleUsingTellor.new(tellorOracle.address);
	});

	it("Update Price", async function () {
	
		// Specify which data (type) is requested from the oracle. (Should become something like 59, a new entry for TruCol)
		const requestId = 1; 


	// -----------------------------------------Helper Functions ----------------------------
	// Encode a string to a number 
	// Source: https://stackoverflow.com/questions/14346829/is-there-a-way-to-convert-a-string-to-a-base-10-number-for-encryption
	function encode(string) {
		var number = "0x";
		var length = string.length;
		for (var i = 0; i < length; i++)
			number += string.charCodeAt(i).toString(16);
		return number;
	}    	
    	
    // Function that runs some incoming shell command (not bash)
	const exec = require('child_process').exec;
	function os_func() {
		this.execCommand = function (cmd) {
		    return new Promise((resolve, reject)=> {
		       exec(cmd, (error, stdout, stderr) => {
		         if (error) {
		            reject(error);
		            return;
		        }
		        resolve(stdout)
		       });
		   })
	   }
	}
	var os = new os_func();
	
		
	// -----------------------------------------Specify Tellor Oracles Data Sources ----------------------------
	// Read whether a travis build has failed or passed
	const github_username = "v-bosch"
	const github_repository_name = "sponsor_example"
	const github_branch_name = "passing_build"
		
	// Show the contract contains the logic to identify a correct build fail/pass. 
	// If the build passes, a uint256 of value 2 is expected 
	// from the contract. Otherwise a uint of value 1 is expected.
	const expected_sponsor_contract_output = 2
	
	
	// -----------------------------------------Get The Tellor Oracles Data With Shell --------------------------
	// Specify local output location of curled data
	var test_case = "pass"
	var test_type = "build_status"
	var output_filename = test_type+"_"+test_case+".txt"
	
	// Specify travis api command that gets the build status and stores its result in an output file.
	// travis history -r v-bosch/sponsor_example --com --token $COM_TRAVIS_TOKEN
	// TODO: export your travis token in terminal before running this with:COM_TRAVIS_TOKEN="YOURPERSONALTRAVISCODE"
	// TODO: get that code from command:`travis token --pro` or with `--org` or `--com` options.
	var get_build_status_command ="travis status -r "+github_username+"/"+github_repository_name+" --com --token $COM_TRAVIS_TOKEN > "+output_filename
	console.log("The shell command that gets the build status is:")
	console.log(get_build_status_command)
	
	// Run the shell command that stores the Travis build status into a file
	os.execCommand(get_build_status_command).then(res=> {
		console.log("Exporting output of travis api call to output file, please wait 10 seconds.", res);
	}).catch(err=> {
		console.log("Exporting output of travis api call to output file, please wait 10 seconds.", err);
	})
	
	// Manually wait a bit unitll the Travis build status is stored into file before proceding.
	// TODO: do not hardcode the build time, but make it dependend on completion of the os_func function. 
	await new Promise(resolve => setTimeout(resolve, 10000));
	
	
	// -----------------------------------------Process The Tellor Oracles Data With Shell ------------------------
	// Read out the Travis build status that is outputed to a file, from the file.
	var fs = require('fs');
	var curled_build_status = fs.readFileSync(output_filename);
	var curled_build_status_string = curled_build_status.toString();
	console.log("The build status of the bounty hunter repository is:")
	console.log(curled_build_status_string)
	
	// encode build status as a number such that it can be passed to the contract
	// TODO: convert to boolean to save gas costs
	const encoded_build_status = encode(curled_build_status_string);
	console.log("encoded_build_status")
	console.log(encoded_build_status)	
	
	// -----------------------------------------Verify the contract returns the correct retrieved value ----------------------------
	// specify the mock value that is into the contract fed by the Tellor oracles:
	const mockValue = encoded_build_status;
	
	// Simulate the Tellor oracle and test the contract on oracle output.
    await tellorOracle.submitValue(requestId, mockValue);
    let retrievedVal = await sampleUsingTellor.readTellorValue(requestId);
	assert.equal(retrievedVal.toString(), expected_sponsor_contract_output);
  });
});