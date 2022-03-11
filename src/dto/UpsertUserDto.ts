// Imports
import { Exclude, Expose } from 'class-transformer';

// Data transfer object
@Exclude()
class UpsertUserDto {
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
