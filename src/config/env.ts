import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('4000').transform((v) => parseInt(v, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  MONGO_URI: z
    .string()
    .default(
      'mongodb+srv://momokhaled937_db_user:uQrTrh0Zf9JdnP75@wadaq1.y3mik96.mongodb.net/wadaq_store?retryWrites=true&w=majority&appName=wadaq1'
    ),
  JWT_SECRET: z.string().default('wadaq_super_secret_jwt_key_sensory_2026'),
  CLIENT_URL: z.string().default('https://wadaq-store.vercel.app'),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
  GROQ_API_KEY: z.string().optional().default(''),
  GROQ_MODEL: z.string().optional().default('qwen/qwen3.8-27b'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
