const getEnv = (name: string, value: string) => {
  if (value === undefined || value === '') {
    throw new Error(`Environment variable ${name} is missing or empty`);
  }
  return value;
};

const env = {
  REVENUECAT_API_KEY_ANDROID: getEnv(
    'REVENUECAT_API_KEY_ANDROID',
    process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID || '',
  ),
  REVENUECAT_API_KEY_IOS: getEnv(
    'REVENUECAT_API_KEY_IOS',
    process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS || '',
  ),
  SUPABASE_ANON_KEY: getEnv('SUPABASE_ANON_KEY', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''),
  SUPABASE_SERVICE_ROLE_KEY: getEnv(
    'SUPABASE_SERVICE_ROLE_KEY',
    process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || '',
  ),
  SUPABASE_URL: getEnv('SUPABASE_URL', process.env.EXPO_PUBLIC_SUPABASE_URL || ''),
};

export default env;
