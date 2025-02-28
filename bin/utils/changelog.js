const truncateChangelog = (fileContent, updatedContent) => {
  let truncateContent = updatedContent;

  if (!fileContent.includes('{/* truncate */}')) {
    const lines = truncateContent.split('\n');
    let i = 0;
    const totalLines = lines.length;
    // Skip front matter (lines between '---' and '---')
    if (lines[i].trim() === '---') {
      i++;
      while (i < totalLines && lines[i].trim() !== '---') {
        i++;
      }
      i++; // Skip the closing '---'
    }
    // Skip empty lines and import statements
    while (i < totalLines && (lines[i].trim() === '' || lines[i].trim().startsWith('import '))) {
      i++;
    }
    // Check for heading
    if (i < totalLines && lines[i].trim().startsWith('# ')) {
      i++; // Move past the heading
    }
    // Skip any additional empty lines
    while (i < totalLines && lines[i].trim() === '') {
      i++;
    }
    // Find the end of the first paragraph
    while (i < totalLines && lines[i].trim() !== '') {
      i++;
    }
    // Insert the truncate comment after the first paragraph
    const insertIndex = i;
    lines.splice(insertIndex, 0, '\n{/* truncate */}');
    truncateContent = lines.join('\n');
  }
  return truncateContent;
};

module.exports = {
  truncateChangelog
};