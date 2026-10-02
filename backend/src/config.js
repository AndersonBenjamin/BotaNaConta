function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente ${name} não definida.`);
  }
  return value;
}

required('DATABASE_URL');

export const config = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigins: (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  timeZone: process.env.APP_TIMEZONE || 'America/Sao_Paulo',
};

if (config.jwtSecret.length < 32) {
  throw new Error('JWT_SECRET deve ter pelo menos 32 caracteres.');
}
