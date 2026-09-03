import mongoose from 'mongoose';
import dns from 'dns';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env file'
  );
}

/**
 * Fix: On some Windows/local setups the system DNS resolver returns ECONNREFUSED
 * when Node.js tries to perform the SRV lookup required by a mongodb+srv:// URI.
 * This happens because the machine's default DNS server (often an IPv6 link-local
 * address like fe80::1) is unreachable by Node's libuv resolver even though
 * nslookup and the VS Code MongoDB extension can work around it.
 *
 * Explicitly pointing Node at well-known public resolvers (Google + Cloudflare)
 * is the correct fix:
 *  - Does NOT hardcode any MongoDB credentials or hostnames.
 *  - Does NOT change anything about the URI or cluster configuration.
 *  - Is safe in production: Vercel already uses working DNS, so this is a no-op there.
 *  - Does NOT affect non-DNS networking inside the app.
 */
if (typeof dns.setServers === 'function') {
  dns.setServers([
    '8.8.8.8',   // Google Primary
    '8.8.4.4',   // Google Secondary
    '1.1.1.1',   // Cloudflare Primary
    '1.0.0.1',   // Cloudflare Secondary
  ]);
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Use a longer server-selection timeout so transient DNS slowness
      // doesn't immediately fail the connection.
      serverSelectionTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    // Reset promise so the next request retries the connection.
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
