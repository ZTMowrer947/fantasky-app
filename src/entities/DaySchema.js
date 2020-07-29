// Imports
import { EntitySchema } from 'typeorm';

import BaseSchemaFragment from './BaseSchemaFragment';

// Entity schema
const DaySchema = new EntitySchema({
  name: 'Day',
  columns: {
    ...BaseSchemaFragment,
    date: {
      type: Date,
      nullable: false,
    },
  },
  relations: {
    goalsCompleted: {
      type: 'many-to-many',
      target: 'Goal',
    },
  },
  indices: [
    {
      columns: ['date'],
    },
  ],
});

// Exports
export default DaySchema;
