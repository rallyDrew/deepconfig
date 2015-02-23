var configSettings = {

};

var cmdArgs = require('minimist')((process.argv.slice(2)));
var requiredArguments = [];
var usageData = "";
var envData = "";
var appNameSet = false;
var failed = false;



function usage(additional) {
  console.log("USAGE: ");
  var str = "";
  for(var i in process.argv) {
    str = str + process.argv[i] + " ";
  }
  additional = additional || "";
  str = str + additional;
  console.log(str);

}

function readEnvVars(appName) {
  for (var envKey in process.env) {
    if (envKey.lastIndexOf(appName) === 0) {
      var globalKey = envKey.replace(appName + "_", '');
      configSettings[globalKey] = process.env[envKey];


    }
  }
}

function readCmdArgs() {
  //Read command line arguments
  for (var argKey in cmdArgs) {

    //Don't worry about the blank key
    if (argKey !== '_')
    {
      configSettings[argKey] = cmdArgs[argKey];
    }


  }
}

function checkUnmetRequirements() {
  for (var i in requiredArguments) {
    var argName = requiredArguments[i];
    if (!(argName in configSettings)) {
      console.log("'" + argName + "' is a required argument, but was not found.");
      failed = true;
      usageData = usageData + "--" + argName + "='value' ";
      envData = envData + appNameSet + "_" + argName + " ";

    }
  }

  if (failed === true) {
    console.log("Try exporting " + envData +" environment variables, or you can run this from the command line:");
    usage(usageData);

    console.log(configSettings);

    process.exit(code=1);
  }
}



module.exports = {

  addRequiredArgument: function(argName, defaultValue) {
    requiredArguments.push(argName);

    //These default values will go into the stack first
    //Env vars will override them when present
    //Cmd args will take precedence over those
    if (defaultValue) {
      configSettings[argName] = defaultValue;
    }


  },

  template: function(key, template, findstr) {
    var output = template.replace(findstr, configSettings[key]);
    return output;
  },

  read: function(appName) {

    if (appName === undefined) {
      throw Error("appName in deepconfig.settings(appName) call is undefined. Please specify an appName");
    }

    appNameSet = appName;

    if (appName !== appNameSet)    {
      throw Error("appName cannot be changed.");
    }

    readEnvVars(appName); //Process ENV vars first
    readCmdArgs(); //Process cmd args second, cmd args can override env vars.
    checkUnmetRequirements();






    return configSettings;



  },

  config: configSettings,

};
