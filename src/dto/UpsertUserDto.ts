// Imports
import { Exclude, Expose } from 'class-transformer';

import User from '@/entities/User';

// Data transfer object
@Exclude()
class UpsertUserDto implements Partial<User> {
  @Expose()
  firstName!: string;

  @Expose()
  lastName!: string;

  @Expose()
  emailAddress!: string;

  @Expose()
  password!: string;

  @Expose()
  dob!: string;
}

// Exports
export default UpsertUserDto;
