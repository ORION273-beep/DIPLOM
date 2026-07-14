const { connectMongo, disconnectMongo, isMongoReady } = require('./mongo');

let memoryServer = null;

async function startMemoryMongo() {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  memoryServer = await MongoMemoryServer.create();
  return memoryServer.getUri('onesec');
}

/**
 * Connect to MONGODB_URI, or in non-production fall back to mongodb-memory-server
 * when a real MongoDB instance is unavailable.
 */
async function ensureMongoConnection(options = {}) {
  const { allowMemoryFallback = process.env.NODE_ENV !== 'production' } = options;
  const preferred = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/onesec';

  try {
    await connectMongo(preferred);
    console.log(`MongoDB connected: ${preferred.replace(/\/\/.*@/, '//***@')}`);
    return { uri: preferred, memory: false };
  } catch (err) {
    if (!allowMemoryFallback) throw err;
    console.warn(`MongoDB unavailable (${err.message}). Starting in-memory MongoDB...`);
    const uri = await startMemoryMongo();
    process.env.MONGODB_URI = uri;
    await connectMongo(uri);
    console.log('MongoDB memory server connected');
    return { uri, memory: true };
  }
}

async function shutdownMongo() {
  await disconnectMongo();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

module.exports = {
  ensureMongoConnection,
  shutdownMongo,
  isMongoReady,
  connectMongo,
  disconnectMongo,
};
