// Imports
import { EntitySchema } from 'typeorm';

import TimestampedSchemaFragment from './TimestampedSchemaFragment';

// Entity schema
const UserSchema = new EntitySchema({
  name: 'User',
  columns: {
    ...TimestampedSchemaFragment,
    firstName: {
      type: 'varchar',
      nullable: false,
    },
    lastName: {
      type: 'varchar',
      nullable: false,
    },
    emailAddress: {
      type: 'varchar',
      nullable: false,
      unique: true,
    },
    password: {
      type: 'varchar',
      nullable: false,
      select: false,
    },
    dob: {
      type: 'date',
      nullable: false,
    },
  },
  relations: {
    tasks: {
      type: 'one-to-many',
      target: 'Task',
    },
  },
});

// Exports
export default UserSchema;
