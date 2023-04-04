import { SetMetadata } from '@nestjs/common';
// import { Actions, Subjects } from './ability.factory';

// export interface RequiredRule {
//   action: Actions;
//   subject: Subjects;
// }

export interface RequiredRule {
  action: any;
  subject: any;
}

export const CHECK_ABILITY = 'check_ability';

export const CheckAbilities = (...requirements: RequiredRule[]) =>
  SetMetadata(CHECK_ABILITY, requirements);