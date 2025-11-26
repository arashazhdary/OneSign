// Re-export platformService from main services file
// The full implementation is in ../services.ts
import { platformService as _platformService } from '../services.ts';

export const platformService = _platformService;
export default platformService;
