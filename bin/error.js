const sidebarError = (output) => {
  let errorOutput = output;
  errorOutput = errorOutput.replace(/docusaurus/gi, 'WriteDocs');

  // Replace specific phrases with new ones
  errorOutput = errorOutput.replace(
    /\[ERROR\] Error: Invalid sidebar file at "sidebars\.js"\./gi,
    '[SIDEBAR_ERROR] Invalid sidebar configuration in "config.json".'
  );
  errorOutput = errorOutput.replace(
    /These sidebar document ids do not exist:/gi,
    'The following files could not be found inside docs folder:'
  );
  errorOutput = errorOutput.replace(
    /Available document ids are:/gi,
    'Available files are:'
  );

  return errorOutput;
}

// Keep only the first phrase that ends with .md or .mdx and remove the rest of the content
const extractMdxError = (output) => {
  const errorMatch = output.match(/Error:.*\nCause:.*\n/);

  if (errorMatch) {
    return errorMatch[0].replace(
      /Error/gi,
      '[MDX_ERROR]'
    );
  }

  return output;
}

const suppressWebpackCacheMessages = (output) => {
  return output
    .split('\n')
    .filter(line => 
      !line.includes('[webpack.cache.PackFileCacheStrategy]') && 
      !line.includes('while serializing webpack/lib/cache/PackFileCacheStrategy') 
    )
    .join('\n');
};

// Remove all "at ... file" lines from the error stack trace
const removeAtFileLines = (output) => {
  return output.split('\n').filter(line => !line.trim().startsWith('at')).join('\n');
}

const replaceErrorOutput = (output) => {
  let errorOutput = sidebarError(output);

  errorOutput = extractMdxError(errorOutput);
  errorOutput = removeAtFileLines(errorOutput);
  errorOutput = suppressWebpackCacheMessages(errorOutput);
  return errorOutput;
}

module.exports = { replaceErrorOutput }