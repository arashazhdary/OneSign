const fs = require('fs');

const en = JSON.parse(fs.readFileSync('en-new.json', 'utf8'));
const fa = JSON.parse(fs.readFileSync('fa-new.json', 'utf8'));

function countKeys(obj) {
  let count = 0;
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      count += countKeys(obj[key]);
    } else {
      count++;
    }
  }
  return count;
}

function getMissingKeys(enObj, faObj, prefix = '') {
  const missing = [];
  for (const key in enObj) {
    const fullKey = prefix + key;
    if (typeof enObj[key] === 'object' && enObj[key] !== null) {
      if (!faObj[key] || typeof faObj[key] !== 'object') {
        missing.push(fullKey);
      } else {
        missing.push(...getMissingKeys(enObj[key], faObj[key], fullKey + '.'));
      }
    } else {
      if (!(key in faObj)) {
        missing.push(fullKey);
      }
    }
  }
  return missing;
}

const enCount = countKeys(en);
const faCount = countKeys(fa);
const missing = getMissingKeys(en, fa);

console.log('='.repeat(60));
console.log('FINAL TRANSLATION STATUS');
console.log('='.repeat(60));
console.log('');
console.log('English keys (en-new.json):', enCount);
console.log('Farsi keys (fa-new.json):', faCount);
console.log('Missing keys:', missing.length);
console.log('Coverage:', ((faCount / enCount) * 100).toFixed(2) + '%');
console.log('');

if (missing.length === 0) {
  console.log('✅ ALL KEYS TRANSLATED - 100% COVERAGE!');
} else {
  console.log('❌ Missing keys:');
  missing.forEach(k => console.log('  -', k));
}

console.log('');
console.log('='.repeat(60));
