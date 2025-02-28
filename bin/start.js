const { spawn } = require("child_process");
const path = require("path");
const { replaceErrorOutput } = require("./error");
const { startFileWatcher } = require("./utils/fileWatcher");
const print = require("./utils/print");

const MAX_RETRIES = 5;

const startProject = (spinner, port = 3000, retries = 1) => {
  if (retries >= MAX_RETRIES) {
    print.error("Exceeded maximum number of retries. Please check your system for conflicting services.");
    return;
  }

  const npmPath = process.platform === "win32" ? "npm.cmd" : "npm";
  const env = { ...process.env, PORT: port }; 

  const startupProcess = spawn(npmPath, ["start"], { 
    cwd: path.join(__dirname, ".."),
    env,
    stdio: ['ignore', 'pipe', 'pipe'] 
  });

  let portConflictDetected = false;

  // startFileWatcher(process.cwd());

  startupProcess.stdout.on('data', (data) => {
    let output = data.toString();

    // Suppress warnings from stdout if necessary
    if (output.toLowerCase().includes('warning')) {
      return; // Ignore lines that contain 'warning'
    }

    output = output.replace(/docusaurus/gi, 'WriteDocs');

    if (output.includes('Server listening on port') || output.includes('http://localhost:')) {
      spinner.succeed(print.green + `WriteDocs running on http://localhost:${port}` + print.reset);
      console.log("\nPress Ctrl+C to quit the WriteDocs preview");
    }
  });

  startupProcess.stderr.on('data', (data) => {
    let errorOutput = data.toString();

    // Suppress warnings from stderr if necessary
    if (errorOutput.toLowerCase().includes('deprecation') || errorOutput.toLowerCase().includes('warning')) {
      return; // Ignore deprecation warnings and other warning types
    }

    errorOutput = replaceErrorOutput(errorOutput);
    // errorOutput = errorOutput.replace(/docusaurus/gi, 'WriteDocs');

    // Remove all "at ... file" lines from the error stack trace
    errorOutput = errorOutput.split('\n').filter(line => !line.trim().startsWith('at')).join('\n');


    if (errorOutput.includes('Something is already running on port')) {
      portConflictDetected = true;
      print.error(`Port ${port} is already in use.`);

      startupProcess.kill();
    } else {
      print.error(errorOutput);
    }
  });

  startupProcess.on("close", (code) => {
    if (portConflictDetected) {
      const newPort = port + 1;
      print.alert(`Trying to run WriteDocs on port ${newPort}...`);
      startProject(spinner, newPort, retries + 1);
    } else if (code !== 0) {
      spinner.fail(print.red + `WriteDocs exited with code ${code}.` + print.reset);
    }
  });

  startupProcess.on("error", (err) => {
    spinner.fail(print.red + `Error starting WriteDocs: ${err.message}` + print.reset);
  });
}

module.exports = {startProject}