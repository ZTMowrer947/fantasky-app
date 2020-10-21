/* eslint-disable import/no-cycle */
// Imports
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

import Day from './Day';
import TimestampedEntity from './TimestampedEntity';
import User from './User';

// Entity
@Entity()
class Task extends TimestampedEntity {
  @Column({ nullable: false })
  name!: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('date', { nullable: false, default: () => 'CURRENT_DATE' })
  startDate!: string;

  @Column('time with time zone', { nullable: true })
  reminderTime?: string;

  @Column('smallint', { nullable: false })
  daysToRepeat!: number;

  @ManyToOne(() => User, (user) => user.tasks, {
    nullable: false,
    cascade: ['update', 'remove', 'soft-remove', 'recover'],
  })
  creator!: User;

  @JoinTable()
  @ManyToMany(() => Day, (day) => day.tasksCompleted)
  completedDays!: Day[];
}

// Exports
export default Task;
