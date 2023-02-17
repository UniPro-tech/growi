import { USER_STATUS } from '~/interfaces/user';
import type { IUserStatus } from '~/interfaces/user';

// For unauthorized
export const createRedirectToByUserStatus = (userStatus: IUserStatus): string | null => {
  switch (userStatus) {
    case USER_STATUS.REGISTERED:
      return '/login/error/registered';
    case USER_STATUS.SUSPENDED:
      return '/login/error/suspended';
    case USER_STATUS.INVITED:
      return '/invited';
    default:
      return null;
  }
};
