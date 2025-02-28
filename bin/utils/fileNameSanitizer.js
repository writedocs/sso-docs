const sanitizeFileName = (filename) => {
  return filename
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-zA-Z])(\d)/g, "$1-$2")
    .replace(/^\/+/, "")
    .replace(/\/+/g, "-")
    .replace(/(?<=\D)(\d+)(?=\D)/g, "-$1-")
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, "")
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .toLowerCase();
};

module.exports = {
  sanitizeFileName,
};
