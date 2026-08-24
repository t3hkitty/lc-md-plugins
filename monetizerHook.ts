import { AnymdHookRegistry } from '../anymd-core/AnymdHooks';

// Register the custom birthday monetization hook
AnymdHookRegistry.register('onCrmGiftUrlGenerated', (payload) => {
  const { originalUrl, affiliateId, provider } = payload;

  if (provider === 'starbucks') {
    // Return custom affiliate parameters for Starbucks API Gateway if configured
    return {
      modifiedUrl: `${originalUrl}?partner_id=${affiliateId}&subid=anymddb_crm`,
      verified: true
    };
  }

  return { modifiedUrl: originalUrl, verified: false };
});