import { EntitySchema } from 'typeorm';

import { EntityBase, EntityBaseSchemaFragment } from './base';

export interface Day extends EntityBase {
  date: string;
}

export const DaySchema = new EntitySchema<Day>({
  name: 'Day',
  tableName: 'days',
  columns: {
    ...EntityBaseSchemaFragment,
    date: {
      type: Date,
      nullable: false,
      primary: true,
    },
  },
});
