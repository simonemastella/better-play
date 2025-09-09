import { z } from 'zod';
import { EnvSource, envVarsSource } from './env-sources.js';

export interface LoadEnvOptions {
  sources?: EnvSource[];
}

export const loadEnv = <T>(
  schema: z.ZodSchema<T>, 
  options?: LoadEnvOptions
): T => {
  // Default to process.env if no sources provided
  const sources = options?.sources || [envVarsSource()];
  
  // Merge all sources (later sources override earlier ones)
  let mergedEnv: Record<string, any> = {};
  for (const source of sources) {
    try {
      const sourceData = source.load();
      mergedEnv = { ...mergedEnv, ...sourceData };
    } catch (error) {
      console.warn(`Failed to load source ${source.name}:`, error);
    }
  }
  
  const result = schema.safeParse(mergedEnv);
  
  if (!result.success) {
    const errors = result.error.issues
      .map((e) => `\t${e.path.join('.')}: ${e.message}`)
      .join('\n');
    throw new Error(`Invalid environment:\n${errors}`);
  }
  
  return result.data;
};