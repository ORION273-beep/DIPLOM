const crypto = require('crypto');

function toIdString(id) {
  if (typeof id === 'string') return id;
  if (typeof id === 'number') return String(id);
  return '';
}

function isSameId(left, right) {
  const leftId = toIdString(left);
  const rightId = toIdString(right);
  return leftId.length > 0 && leftId === rightId;
}

function generateStringId(length = 8) {
  return crypto.randomBytes(Math.max(4, Math.ceil(length / 2))).toString('hex').slice(0, length);
}

module.exports = { isSameId, generateStringId };
