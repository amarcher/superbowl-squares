const { Redis } = require('@upstash/redis');

const url =
  process.env.KV_REST_API_URL ||
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.STORAGE_KV_REST_API_URL;

const token =
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.STORAGE_KV_REST_API_TOKEN;

const redis = new Redis({ url, token });

module.exports = { redis };
