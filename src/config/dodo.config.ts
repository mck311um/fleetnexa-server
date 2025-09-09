import DodoPayments from 'dodopayments';

const API_KEY = process.env.DODOPAYMENTS_API_KEY || '';
const ENVIRONMENT =
  process.env.NODE_ENV === 'production' ? 'live_mode' : 'test_mode';

const client = new DodoPayments({
  bearerToken: API_KEY,
  environment: ENVIRONMENT,
});

export default client;
