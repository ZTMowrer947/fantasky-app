// Imports
import { EntitySchema } from 'typeorm';

import TimestampedSchemaFragment from './TimestampedSchemaFragment';

// Entity schema
const TaskSchema = new EntitySchema({
  name: 'Task',
  columns: {
    ...TimestampedSchemaFragment,
    name: {
      type: 'varchar',
      nullable: false,
    },
    description: {
      type: 'text',
      nullable: true,
    },
    startDate: {
      type: Date,
      nullable: false,
      default: () => 'NOW()',
    },
    daysToRepeat: {
      type: 'smallint',
      nullable: false,
    },
  },
  relations: {
    creator: {
      type: 'many-to-one',
      target: 'User',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      nullable: false,
    },
    completedDays: {
      type: 'many-to-many',
      target: 'Day',
      joinTable: true,
    },
  },
  indices: [
    {
      columns: ['name'],
    },
  ],
});

// Exports
export default TaskSchema;