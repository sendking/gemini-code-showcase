const fs = require('fs');
const path = require('path');

function loadRules(root) {
  const file = path.join(root, '.gemini', 'config', 'skill-rules.json');
  return JSON.parse(fs.readFileSync(file, 'utf8')).rules;
}

function matchRules(filePath, rules) {
  const ext = path.extname(filePath);
  const normalized = filePath.replace(/\\/g, '/');
  return rules.filter(rule => {
    const matchExt = rule.match.fileExtensions && rule.match.fileExtensions.includes(ext);
    const matchPath = rule.match.pathContains && rule.match.pathContains.some(seg => normalized.includes(seg));
    return matchExt || matchPath;
  });
}

module.exports = { loadRules, matchRules };
