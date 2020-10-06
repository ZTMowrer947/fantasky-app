// Imports
import { EntitySchema } from 'typeorm';

import BaseSchemaFragment from './BaseSchemaFragment';

// Entity schema
const DaySchema = new EntitySchema({
  name: 'Day',
  columns: {
    ...BaseSchemaFragment,
    date: {
      type: 'date',
      nullable: false,
      unique: true,
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
