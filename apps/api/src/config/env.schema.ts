import Joi from 'joi';

const productionRequiredString = Joi.when('NODE_ENV', {
  is: 'production',
  then: Joi.string().required(),
  otherwise: Joi.string().allow('', null)
});

export const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  API_PORT: Joi.number().default(3333),
  APP_URL: Joi.string().uri().required(),
  DATABASE_URL: Joi.string().required(),
  DIRECT_URL: Joi.string().required(),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  STRIPE_SECRET_KEY: productionRequiredString,
  STRIPE_WEBHOOK_SECRET: productionRequiredString,
  STRIPE_STUDENT_PRICE_ID: productionRequiredString,
  STRIPE_TEACHER_PRICE_ID: productionRequiredString,
  STRIPE_VERIFICATION_PRICE_ID: productionRequiredString,
  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_ANON_KEY: productionRequiredString,
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),
  SUPABASE_STORAGE_BUCKET_PRIVATE: Joi.string().default('private-assets'),
  GOOGLE_CLIENT_ID: productionRequiredString,
  GOOGLE_CLIENT_SECRET: productionRequiredString,
  GOOGLE_REDIRECT_URI: productionRequiredString,
  GOOGLE_CALENDAR_ID: Joi.string().default('primary')
});
