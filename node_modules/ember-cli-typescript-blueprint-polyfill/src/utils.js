const path = require('path');

function replaceExtension(filePath, newExt) {
  const { dir, name } = path.parse(filePath);

  return path.format({
    dir,
    name,
    ext: newExt,
  });
}

function isTypeScriptFile(filePath) {
  return path.extname(filePath) === '.ts';
}

module.exports = {
  replaceExtension,
  isTypeScriptFile,
};
