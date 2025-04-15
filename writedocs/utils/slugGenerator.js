const fs = require("fs");
const path = require("path");
const glob = require("glob");
const matter = require("gray-matter");

/**
 * Generate a slug based on the file's path.
 *
 * The function:
 * - Splits the file path using both "/" and "\" as separators.
 * - Removes the base folder ("docs" or "apiPages").
 * - Processes the filename: it removes its extension, strips any occurrence of ".endpoint",
 *   and omits the segment if the filename is "index".
 * - Filters out any segment equal to the provided removal string (case-insensitive).
 * - Joins the remaining segments with "/" (with no leading slash).
 *
 * @param {string} filePath - The file path relative to the project root.
 * @param {string} removeStr - Optional string (folder name) to remove from anywhere in the slug.
 * @returns {string} - The generated slug.
 */
function generateSlug(filePath, removeStr = "") {
  // Split the file path using both forward (/) and back (\) slashes.
  let segments = filePath.split(/[\\/]/);

  // Remove the base folder if it is "docs" or "apiPages"
  if (segments[0] === "docs" || segments[0] === "apiPages") {
    segments.shift();
  }

  // Process the last segment if it is a file (has an extension).
  let lastSegment = segments[segments.length - 1];
  if (path.extname(lastSegment)) {
    // Get the filename without its extension.
    let fileName = path.basename(lastSegment, path.extname(lastSegment));
    // Remove any occurrence of ".endpoint" (case-insensitive) from the filename.
    fileName = fileName.replace(/\.endpoint/gi, "");

    // If the cleaned filename is "index", drop it; otherwise, update the last segment.
    if (fileName.toLowerCase() === "index") {
      segments.pop();
    } else {
      segments[segments.length - 1] = fileName;
    }
  }

  // If a removal string is provided, remove any segment that exactly matches it (case-insensitive).
  if (removeStr) {
    segments = segments.filter((segment) => segment.toLowerCase() !== removeStr.toLowerCase());
  }

  // Join segments into a slug using "/" (convert to lowercase, replace spaces with dashes).
  const slug = segments.map((segment) => segment.toLowerCase().replace(/\s+/g, "-")).join("/");

  return `/${slug}`;
}

/**
 * Update all MDX files in the "docs" and "apiPages" folders (and subfolders)
 * by adding/updating the "slug" field in the frontmatter.
 *
 * @param {string} removeStr - Optional string to remove from the slug (from any segment).
 */
function updateFilesWithSlug(removeStr = "") {
  // Patterns to match MDX files in docs/ and apiPages/ folders and their subfolders.
  const patterns = ["docs/**/*.mdx", "apiPages/**/*.mdx"];

  patterns.forEach((pattern) => {
    glob(pattern, {}, (err, files) => {
      if (err) {
        console.error("Error finding files:", err);
        return;
      }

      files.forEach((file) => {
        fs.readFile(file, "utf8", (readErr, data) => {
          if (readErr) {
            console.error(`Error reading file ${file}:`, readErr);
            return;
          }

          // Parse frontmatter and file content using gray-matter.
          const parsed = matter(data);

          // Generate slug using the file path and the optional removal string.
          const slug = generateSlug(file, removeStr);

          // Update (or create) the slug field in the frontmatter.
          parsed.data.slug = slug;

          // Convert back the content with the updated frontmatter.
          const updatedContent = matter.stringify(parsed.content, parsed.data);

          fs.writeFile(file, updatedContent, "utf8", (writeErr) => {
            if (writeErr) {
              console.error(`Error writing file ${file}:`, writeErr);
              return;
            }
            console.log(`Updated slug in file: ${file} -> ${slug}`);
          });
        });
      });
    });
  });
}

// Retrieve the optional removal string from command-line arguments.
const removalParameter = "documentation";
updateFilesWithSlug(removalParameter);
