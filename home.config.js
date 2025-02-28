const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const babel = require('@babel/core');

/**
 * Transpile a React component file using Babel
 * @param {string} filePath - The path to the React component file
 */
function transpileFile(filePath) {
  try {
    const result = babel.transformFileSync(filePath, {
      presets: [
        '@babel/preset-env',
        '@babel/preset-react',
        '@babel/preset-typescript',
      ],
    });
    fse.ensureFileSync(filePath);
    fse.writeFileSync(filePath, result.code, 'utf8');
    // console.log(`Transpiled: ${filePath}`);
  } catch (error) {
    console.error(`[HOME] Error transpiling file ${filePath}:`, error.message);
  }
}

/**
 * Convert language code to Capitalized format for React component names
 * @param {string} lang - Language code (e.g., 'pt', 'fr')
 * @returns {string} - Capitalized language code (e.g., 'Pt', 'Fr')
 */
function capitalizeLang(lang) {
  return lang.charAt(0).toUpperCase() + lang.slice(1);
}

/**
 * Process the homepage HTML and generate corresponding CSS and React component files
 * @param {string} inputFilePath - Path to the input HTML file
 * @param {string} cssOutputPath - Path to output the CSS file
 * @param {string} reactComponentOutputPath - Path to output the React component file
 * @param {string} componentName - Name of the React component
 */
const processHomepage = (
  inputFilePath,
  cssOutputPath,
  reactComponentOutputPath,
  componentName
) => {
  // Check if the input HTML file exists
  if (!fs.existsSync(inputFilePath)) {
    console.warn(`Warning: Input file ${inputFilePath} does not exist. Skipping.`);
    return false; // Indicate that processing was skipped
  }

  // Read the HTML file
  let htmlContent;
  try {
    htmlContent = fs.readFileSync(inputFilePath, 'utf-8');
  } catch (err) {
    console.error(`Error reading file ${inputFilePath}:`, err.message);
    return false;
  }

  // Extract the CSS from the HTML content
  const cssMatches = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  let cssContent = '';
  if (cssMatches && cssMatches[1]) {
    cssContent = cssMatches[1].trim();
    cssContent = cssContent.replace(
      /url\(['"]?(?:\.?\/)?media\/([^'")]+)['"]?\)/g,
      "url('../../static/media/$1')"
    );
  }

  // Write the CSS to a separate file
  try {
    fs.writeFileSync(cssOutputPath, cssContent, 'utf-8');
    // console.log(`CSS written to: ${cssOutputPath}`);
  } catch (err) {
    console.error(`[HOME] Error writing CSS to ${cssOutputPath}:`, err.message);
    return false;
  }

  // Extract the content inside the <body> tag
  const bodyMatches = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let bodyContent = '';
  if (bodyMatches && bodyMatches[1]) {
    bodyContent = bodyMatches[1].trim();
  }

  // Replace image src paths with useBaseUrl
  bodyContent = bodyContent.replace(
    /<img([\s\S]*?)src=["'](\.?\/)?media\/([^"']+)["']([\s\S]*?)\/?>/gi,
    function (
      match,
      beforeSrc,
      dotSlash,
      srcPath,
      afterSrc
    ) {
      const srcValue = `useBaseUrl('media/${srcPath}')`;
      return `<img${beforeSrc}src={${srcValue}}${afterSrc}/>`;
    }
  );

  // Create the React component with the content inside the <body> tag
  const reactComponentContent = `import React from 'react';
import useBaseUrl from "@docusaurus/useBaseUrl";
import './${path.basename(cssOutputPath)}';

const ${componentName} = () => (
  <>
    ${bodyContent}
  </>
);

export default ${componentName};
`;

  // Write the React component to a file
  try {
    fs.writeFileSync(reactComponentOutputPath, reactComponentContent, 'utf-8');
    // console.log(`React component written to: ${reactComponentOutputPath}`);
  } catch (err) {
    console.error(`[HOME] Error writing React component to ${reactComponentOutputPath}:`, err.message);
    return false;
  }

  // Transpile the React component
  transpileFile(reactComponentOutputPath);

  // console.log('CSS and HTML body content have been separated and saved.\n');
  return true; // Indicate successful processing
};

/**
 * Read and parse a JSON file
 * @param {string} filePath - Relative path to the JSON file
 * @returns {Object} - Parsed JSON object
 */
function getJson(filePath) {
  const configJsonPath = path.join(__dirname, filePath);
  try {
    const data = fs.readFileSync(configJsonPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`[HOME] Error reading or parsing ${filePath}:`, err.message);
    process.exit(1);
  }
}

/**
 * Generate the languages mapping file (languagesMap.js) based on existing components
 * @param {Array<string>} validLanguages - Array of language codes that have been processed
 */
function generateLanguagesMap(validLanguages) {
  // Import React in the mapping file
  const importReact = `import React from 'react';\n\n`;

  // Generate import statements using React.lazy for code-splitting
  const importStatements = validLanguages.map((lang) => {
    const componentName = lang === validLanguages[0] ? 'Homepage' : `Homepage${capitalizeLang(lang)}`;
    const filePath = `../pages/${componentName}`;
    return `  '${lang}': React.lazy(() => import('${filePath}')),`;
  });

  // Create the languagesMap content
  const languagesMapContent = `${importReact}export const languagesMap = {\n${importStatements.join(
    '\n'
  )}\n};\n`;

  const languagesMapPath = path.join(__dirname, 'src', 'utils', 'languagesMap.js');

  // Ensure the utils directory exists
  fse.ensureDirSync(path.dirname(languagesMapPath));

  // Write the languagesMap.js file
  try {
    fs.writeFileSync(languagesMapPath, languagesMapContent, 'utf-8');
    // console.log(`Languages map generated at: ${languagesMapPath}`);
  } catch (err) {
    console.error(`[HOME] Error writing languagesMap.js:`, err.message);
  }
}

/**
 * Main function to check the plan and process the homepage accordingly
 */
function main() {
  const planConfig = getJson('plan.json');
  const { plan } = planConfig;

  const config = getJson('config.json');
  const { languages } = config;

  // Path for the base HTML file (first language)
  const baseInputFilePath = 'homepage.html'; // Typically for 'en'

  // Array to keep track of successfully processed languages
  const validLanguages = [];

  if (plan !== 'free') {
    if (languages && Array.isArray(languages) && languages.length > 0) {
      // Iterate through each language
      languages.forEach((lang, index) => {
        let inputFilePath;
        let cssOutputPath;
        let reactComponentOutputPath;
        let componentName;

        if (index === 0) {
          // Base language processing
          inputFilePath = 'homepage.html';
          cssOutputPath = `./src/pages/homepage.css`;
          reactComponentOutputPath = `./src/pages/Homepage.js`;
          componentName = 'Homepage';
        } else {
          // Other languages processing
          inputFilePath = `homepage-${lang}.html`;
          cssOutputPath = `./src/pages/homepage-${lang}.css`;
          reactComponentOutputPath = `./src/pages/Homepage${capitalizeLang(
            lang
          )}.js`;
          componentName = `Homepage${capitalizeLang(lang)}`;
        }

        // Process the homepage
        const processed = processHomepage(
          inputFilePath,
          cssOutputPath,
          reactComponentOutputPath,
          componentName
        );

        if (processed) {
          // If processing was successful, add to validLanguages
          validLanguages.push(lang);
          console.log(`[HOME] Successfully processed homepage for language: ${lang}\n`);
        } else {
          // If processing failed or was skipped, do not add to validLanguages
          console.log(`[HOME] Skipped homepage for language: ${lang}\n`);
        }
      });

      // Generate languagesMap.js based on validLanguages
      if (validLanguages.length > 0) {
        generateLanguagesMap(validLanguages);
      } else {
        console.warn('[HOME] No valid languages were processed. languagesMap.js will not be generated.');
      }
    } else {
      console.log('[HOME] No languages specified. Processing default homepage.');

      // Define output paths for default homepage
      const defaultCssOutputPath = `./src/pages/homepage.css`;
      const defaultReactComponentOutputPath = `./src/pages/Homepage.js`;
      const defaultComponentName = 'Homepage';

      // Process the default homepage
      const processed = processHomepage(
        baseInputFilePath,
        defaultCssOutputPath,
        defaultReactComponentOutputPath,
        defaultComponentName
      );

      if (processed) {
        // Add 'en' as the default language
        validLanguages.push('en');
        console.log('[HOME] Successfully processed default homepage.\n');

        // Generate languagesMap.js with only 'en'
        generateLanguagesMap(['en']);
      } else {
        console.log('[HOME] Failed to process the default homepage.');
      }
    }
  } else {
    console.log(`[HOME] Homepage deactivated for ${plan} plan`);
  }
}

// Execute the main function
main();
