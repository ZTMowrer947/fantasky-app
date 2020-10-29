/* eslint-disable import/no-cycle */
// Imports
import argon2 from 'argon2';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import Task from './Task';

import TimestampedEntity from './TimestampedEntity';

// Entity
@Entity({ name: 'user' })
class User extends TimestampedEntity {
  @Column({ nullable: false })
  firstName!: string;

  @Column({ nullable: false })
  lastName!: string;

  @Column({ nullable: false, unique: true })
  emailAddress!: string;

  @Column({ nullable: false, select: false })
  password!: string;

  @Column('date', { nullable: false })
  dob!: string;

  @OneToMany(() => Task, (task) => task.creator)
  tasks!: Task[];

  @BeforeInsert()
  @BeforeUpdate()
  private async hashPassword() {
    this.password = await argon2.hash(this.password, {
      timeCost: 10,
      memoryCost: 2 ** 16,
      type: argon2.argon2id,
      hashLength: 48,
    });
  }
}

// Exports
export default User;
