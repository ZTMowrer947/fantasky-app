// Imports
import { EntitySchema } from 'typeorm';

// Entity schema
const UserSchema = new EntitySchema({
  name: 'User',
  columns: {
    id: {
      type: 'integer',
      primary: true,
      generated: true,
      nullable: false,
    },
    createdAt: {
      type: Date,
      createDate: true,
      select: false,
    },
    updatedAt: {
      type: Date,
      updateDate: true,
      select: false,
    },
    deletedAt: {
      type: Date,
      deleteDate: true,
      select: false,
    },
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
      type: Date,
      nullable: false,
    },
  },
});

// Exports
export default UserSchema;
