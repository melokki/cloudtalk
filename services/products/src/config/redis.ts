type RedisConfig = {
  host: string;
  port: number;
};
const redisConfig: RedisConfig = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: parseInt(process.env.REDIS_PORT ?? "6379"),
};

export default redisConfig;
