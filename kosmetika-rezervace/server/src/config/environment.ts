// Centralizovaná konfigurace environment proměnných
interface Config {
  port: number;
  nodeEnv: string;
  mongoUri: string;
  jwtSecret: string;
  gosmsLogin: string;
  gosmsPassword: string;
  gosmsAccessToken?: string;
  corsOrigins: string[];
}

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'GOSMS_LOGIN',
  'GOSMS_PASSWORD',
];

// Kontrola povinných env proměnných
const checkRequiredEnvVars = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Chybějící environment proměnné:', missing.join(', '));
    process.exit(1);
  }
};

checkRequiredEnvVars();

const config: Config = {
  port: parseInt(process.env.PORT || '5000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI!,
  jwtSecret: process.env.JWT_SECRET!,
  gosmsLogin: process.env.GOSMS_LOGIN!,
  gosmsPassword: process.env.GOSMS_PASSWORD!,
  gosmsAccessToken: process.env.GOSMS_ACCESS_TOKEN,
  corsOrigins: [
    'https://kosmetika-lhota.vercel.app',
    'https://rezervace-fullstack.onrender.com',
    'https://rezervace-fullstack.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
};

export default config;
