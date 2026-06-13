import mongoose from 'mongoose';

const MONGODB_URI =mongodb+srv://bijnoorwellness_db_user:<db_password>@bijnoor-wellness.gserpb1.mongodb.net/?appName=Bijnoor-Wellness
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL ||
  process.env.MONGO_URI ||
  process.env.RAILWAY_MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'MONGODB_URI must be set. Add it to server/.env for local development or set MONGODB_URI (or DATABASE_URL) in your deployment environment.'
  );
}

let cached = globalThis.__mongooseCache;

if (!cached) {
  cached = globalThis.__mongooseCache = { conn: null, promise: null };
}

export async function connectMongo() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectMongo;