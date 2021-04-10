import { EntitySchema, EntitySchemaColumnOptions } from 'typeorm';

import { EntityBase, EntityBaseSchemaFragment } from './base';
import { Day } from './day';
// eslint-disable-next-line import/no-cycle
import { User } from './user';

export interface Task extends EntityBase {
  name: string;

  description: string | null;

  startDate: string;

  onSundays: boolean;

  onMondays: boolean;

  onTuesdays: boolean;

  onWednesdays: boolean;

  onThursdays: boolean;

  onFridays: boolean;

  onSaturdays: boolean;

  daysCompletedOn: Day[];

  creator: User;
}

const dayBoolColumn: EntitySchemaColumnOptions = {
  type: Boolean,
  default: false,
};

export const TaskSchema = new EntitySchema<Task>({
  name: 'Task',
  tableName: 'tasks',
  columns: {
    ...EntityBaseSchemaFragment,
    name: {
      type: String,
      nullable: false,
    },
    description: {
      type: String,
      nullable: true,
    },
    startDate: {
      type: Date,
      nullable: false,
    },
    onSundays: dayBoolColumn,
    onMondays: dayBoolColumn,
    onTuesdays: dayBoolColumn,
    onWednesdays: dayBoolColumn,
    onThursdays: dayBoolColumn,
    onFridays: dayBoolColumn,
    onSaturdays: dayBoolColumn,
  },
  relations: {
    daysCompletedOn: {
      type: 'many-to-many',
      joinTable: true,
      target: 'Day',
    },
    creator: {
      type: 'many-to-one',
      target: 'User',
      onDelete: 'CASCADE',
      inverseSide: 'createdTasks',
    },
  },
});
