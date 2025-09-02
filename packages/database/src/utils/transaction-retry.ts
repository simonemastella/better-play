import { type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { isTransientError } from "./db-error-handling.js";

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
}

// Exponential backoff with jitter
async function delay(attempt: number, baseDelay: number, maxDelay: number): Promise<void> {
  const jitter = Math.random() * 100; // 0-100ms random jitter
  const delayMs = Math.min(baseDelay * Math.pow(2, attempt) + jitter, maxDelay);
  return new Promise(resolve => setTimeout(resolve, delayMs));
}

/**
 * Execute a database transaction with automatic retry for transient errors
 * @param db - The database instance
 * @param transaction - The transaction function to execute
 * @param options - Retry configuration options
 * @returns The result of the transaction
 */
export async function transactionWithRetry<T = unknown>(
  db: PostgresJsDatabase<any>,
  transaction: (tx: any) => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 100,
    maxDelay = 5000
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Execute the transaction
      return await db.transaction(async (tx) => await transaction(tx));
    } catch (error) {
      lastError = error;

      // If it's not transient or we're out of retries, fail immediately
      if (!isTransientError(error) || attempt === maxRetries) {
        throw error;
      }

      // Log retry attempt
      console.warn(
        `⚠️ Transient database error (attempt ${attempt + 1}/${maxRetries + 1}):`,
        error instanceof Error ? error.message : error
      );
      console.log(`  Retrying in ${baseDelay * Math.pow(2, attempt)}ms...`);
      
      await delay(attempt, baseDelay, maxDelay);
    }
  }

  // Should never reach here, but TypeScript needs this
  throw lastError;
}