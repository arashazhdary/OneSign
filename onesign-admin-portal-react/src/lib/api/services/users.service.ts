// Re-export usersService from main services file
// The full implementation is in ../services.ts
import { usersService as _usersService } from '../services.ts';

export const usersService = _usersService;
export default usersService;
