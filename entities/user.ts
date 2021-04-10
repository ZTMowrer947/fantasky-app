import Adapters from 'next-auth/adapters';
import { EntitySchema } from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { Task } from './task';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export class User extends Adapters.TypeORM.Models.User.model {
  createdTasks!: Task[];
}

export const UserSchema = new EntitySchema<
  User & Adapters['TypeORM']['Models']['User']['model']
>({
  name: 'User',
  tableName: 'users',
  columns: Adapters.TypeORM.Models.User.schema.columns,
  relations: {
    createdTasks: {
      type: 'one-to-many',
      target: 'Task',
      inverseSide: 'creator',
    },
  },
});
