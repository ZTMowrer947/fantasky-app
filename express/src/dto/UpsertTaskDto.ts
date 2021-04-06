// Imports
import { Exclude, Expose } from 'class-transformer';

import Task from '@/entities/Task';

// Data transfer object
@Exclude()
class UpsertTaskDto implements Partial<Task> {
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
