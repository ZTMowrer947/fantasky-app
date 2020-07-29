// Imports
import { EntitySchema } from 'typeorm';

// Entity schema
const GoalSchema = new EntitySchema({
  name: 'Goal',
  columns: {
    id: {
      type: 'bigint',
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
  },
  indices: [
    {
      columns: ['name'],
    },
  ],
});

// Exports
export default GoalSchema;
