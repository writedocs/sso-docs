const { spawn } = require("child_process");
const path = require("path");
const print = require("./utils/print");
const { replaceErrorOutput } = require("./error");

function extractBrokenLinks(errorOutput) {
  const lines = errorOutput.split('\n');
  let isCapturing = false;
  let brokenLinksSection = '';

  for (const line of lines) {
    // Start capturing when we find the start of the broken links section
    if (line.includes('Exhaustive list of all broken links found:')) {
      isCapturing = true;
      brokenLinksSection += '[BROKEN_LINKS_ERROR] WriteDocs found broken links in your docs. Check the list below:\n';
      continue; // Skip adding the original line
    }

    // Stop capturing when a line starts with "at" (indicating stack trace)
    if (isCapturing) {
      if (line.trim().startsWith('at')) {
        break;
      }
      brokenLinksSection += line + '\n';
    }
  }

  return brokenLinksSection.trim();
}

const checkLinks = (spinner) => {
  const npmPath = process.platform === "win32" ? "npm.cmd" : "npm";
  const env = { ...process.env };

  // Spawn the npm run build process
  const docusaurusProcess = spawn(npmPath, ["run", "build"], {
    cwd: path.join(__dirname, ".."),
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let errorFound = false;

  const handleOutput = (data) => {
    const output = data.toString();

    // Attempt to replace Docusaurus with WriteDocs in output and format as needed
    const brokenLinks = extractBrokenLinks(output).replace(/docusaurus/gi, 'WriteDocs');
    if (brokenLinks) {
      spinner.fail(print.red + `${brokenLinks}\n` + print.reset);
      errorFound = true;
    }
  };

  docusaurusProcess.stdout.on('data', handleOutput);
  docusaurusProcess.stderr.on('data', handleOutput);

  // Handle process close event
  docusaurusProcess.on("close", (code) => {
    if (!errorFound) {
      spinner.succeed(print.green + 'No broken links found! Your WriteDocs site is ready to go!\n' + print.reset);
    } 
  });

  // Handle errors during the process execution
  docusaurusProcess.on("error", (err) => {
    spinner.fail(print.red + `Error checking broken links: ${err.message}` + print.reset);
  });
};

module.exports = { checkLinks };
