const crypto = require('crypto');

const PASSWORD_HASH_ITERATIONS = 120000;
const PASSWORD_HASH_KEY_LENGTH = 64;
const PASSWORD_HASH_DIGEST = 'sha512';

const normalizeUsername = (value) => String(value || '').trim();

const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => {
  const hash = crypto
    .pbkdf2Sync(
      String(password || ''),
      salt,
      PASSWORD_HASH_ITERATIONS,
      PASSWORD_HASH_KEY_LENGTH,
      PASSWORD_HASH_DIGEST
    )
    .toString('hex');

  return {
    salt,
    hash
  };
};

const verifyPassword = (password, salt, expectedHash) => {
  if (!salt || !expectedHash) {
    return false;
  }

  const candidateHash = hashPassword(password, salt).hash;
  const expectedBuffer = Buffer.from(String(expectedHash), 'hex');
  const candidateBuffer = Buffer.from(candidateHash, 'hex');

  if (expectedBuffer.length === 0 || expectedBuffer.length !== candidateBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, candidateBuffer);
};

const createSessionToken = () => crypto.randomBytes(48).toString('hex');

const hashToken = (token) =>
  crypto.createHash('sha256').update(String(token || ''), 'utf8').digest('hex');

module.exports = {
  normalizeUsername,
  hashPassword,
  verifyPassword,
  createSessionToken,
  hashToken
};
