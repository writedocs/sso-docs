const fs = require('fs');
const path = require('path');

function getJson(file) {
  const configJsonPath = path.join(__dirname, file);
  const data = fs.readFileSync(configJsonPath, 'utf8');
  return JSON.parse(data);
}

const planConfig = getJson('plan.json');

function freePlanConfiguration() {
  const { plan } = planConfig;
  // console.log(`Current Plan: ${plan}`)
  if (plan.toLowerCase() === 'free') {
    const componentsDir = path.join(__dirname, 'src', 'components');
    const deprecatedDir = path.join(componentsDir, '_deprecated');
    const filesToKeep = ['index.js', 'writedocsComponentsFolder', '_deprecated'];

    if (!fs.existsSync(deprecatedDir)) {
      fs.mkdirSync(deprecatedDir);
    }
  
    fs.readdir(componentsDir, (err, files) => {
      if (err) throw err;
  
      files.forEach(file => {
        const filePath = path.join(componentsDir, file);
        const isDirectory = fs.statSync(filePath).isDirectory();
        const shouldKeep = filesToKeep.includes(file) || (isDirectory && filesToKeep.includes(file));
  
        if (!shouldKeep) {
          const targetPath = path.join(deprecatedDir, file);
        
          fs.renameSync(filePath, targetPath);
          // console.log(`Moved: ${filePath} -> ${targetPath}`);
        }
      });
    });
  }
}

freePlanConfiguration();