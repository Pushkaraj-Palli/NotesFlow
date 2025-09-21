import mongoose, { Schema, Model } from 'mongoose';

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the DATABASE_URL environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially during API routes calls.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongooseInstance) => {
      return mongooseInstance;
    }) as Promise<any>;
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Mongoose Models
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  name: string;
  tenantId: mongoose.Types.ObjectId;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

interface TenantDoc extends mongoose.Document {
  name: string;
  settings: {
    maxNotes: number;
  };
  plan: 'free' | 'pro';
  createdAt: Date;
  updatedAt: Date;
}

interface NoteDoc extends mongoose.Document {
  title: string;
  content: string;
  tenantId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  tags: string[];
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

let User: Model<UserDoc>;
let Tenant: Model<TenantDoc>;
let Note: Model<NoteDoc>;

try {
  // Attempt to retrieve existing models to prevent recompilation
  User = mongoose.model<UserDoc>('User');
  Tenant = mongoose.model<TenantDoc>('Tenant');
  Note = mongoose.model<NoteDoc>('Note');
} catch (error) {
  // If models do not exist, define them
  const UserSchema = new Schema<UserDoc>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    role: { type: String, default: 'user' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });

  const TenantSchema = new Schema<TenantDoc>({
    name: { type: String, required: true },
    settings: {
      maxNotes: { type: Number, default: 50 },
    },
    plan: { type: String, default: 'free' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });

  const NoteSchema = new Schema<NoteDoc>({
    title: { type: String, required: true },
    content: { type: String, required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: String }],
    isPinned: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });

  User = mongoose.model<UserDoc>('User', UserSchema);
  Tenant = mongoose.model<TenantDoc>('Tenant', TenantSchema);
  Note = mongoose.model<NoteDoc>('Note', NoteSchema);
}

export { connectDB, User, Tenant, Note };
