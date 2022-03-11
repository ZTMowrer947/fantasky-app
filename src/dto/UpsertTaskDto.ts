// Imports
import { Exclude, Expose } from 'class-transformer';

// Data transfer object
@Exclude()
class UpsertTaskDto {
  @Expose()
  name!: string;

  @Expose()
  description?: string;

  @Expose()
  startDate!: string;

  @Expose()
  reminderTime?: string;

  @Expose()
  activeDays!: {
    sun: boolean;
    mon: boolean;
    tue: boolean;
    wed: boolean;
    thu: boolean;
    fri: boolean;
    sat: boolean;
  };
}

// Exports
export default UpsertTaskDto;
