// Re-export governanceService from main services file
// The full implementation is in ../services.ts
import { governanceService as _governanceService } from '../services.ts';

export const governanceService = _governanceService;
export default governanceService;
