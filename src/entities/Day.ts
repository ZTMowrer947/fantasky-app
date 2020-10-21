/* eslint-disable import/no-cycle */
// Imports
import { Column, Entity, ManyToMany } from 'typeorm';

import EntityBase from './EntityBase';
import Task from './Task';

// Entity
@Entity()
class Day extends EntityBase {
  @Column('date', { nullable: false, unique: true })
  date!: string;

  @ManyToMany(() => Task, (task) => task.completedDays, {
    cascade: ['update'],
    nullable: false,
  })
  tasksCompleted!: Task[];
}

// Exports
export default Day;
