#!/usr/bin/env node
import { getCustomerClient } from '../auth.js';
import { formatSuccess, formatError } from '../utils/response-format.js';

/**
 * Execute mutation operations using GoogleAdsService.Mutate
 * Supports any write operation with dry_run validation
 *
 * @param {Object} params - Mutation parameters
 * @param {string} params.customer_id - Google Ads customer ID (optional, uses env default)
 * @param {Array} params.operations - Array of mutation operation objects
 * @param {boolean} params.partial_failure - Enable partial failure mode (default: true)
 * @param {boolean} params.dry_run - Validate only, don't execute (default: true)
 * @returns {Promise<Object>} Mutation results
 */
export async function mutate(params) {
  const {
    customer_id = process.env.GOOGLE_ADS_CUSTOMER_ID,
    operations,
    partial_failure = true,
    dry_run = true
  } = params;

  try {
    // Validate required parameters
    if (!customer_id) {
      throw new Error('customer_id is required (either as parameter or GOOGLE_ADS_CUSTOMER_ID env var)');
    }

    if (!operations || !Array.isArray(operations) || operations.length === 0) {
      throw new Error('operations array is required and must contain at least one operation');
    }

    const customer = getCustomerClient(customer_id);

    // Execute mutation with validation options
    const response = await customer.mutateResources(operations, {
      partialFailure: partial_failure,
      validateOnly: dry_run
    });

    const message = dry_run
      ? 'Validation successful - no changes made'
      : 'Mutations applied successfully';

    return formatSuccess({
      summary: `${message} (${operations.length} operation${operations.length !== 1 ? 's' : ''})`,
      data: response || [],
      metadata: {
        dry_run,
        operations_count: operations.length,
        customer_id
      }
    });
  } catch (error) {
    return formatError(error);
  }
}
