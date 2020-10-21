// Imports
import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

import EntityBase from './EntityBase';

// Timestamp Entity
abstract class TimestampedEntity extends EntityBase {
  @CreateDateColumn({ select: false })
  createdAt!: Date;

  @UpdateDateColumn({ select: false })
  updatedAt!: Date;

  @DeleteDateColumn({ select: false })
  deletedAt!: Date;
}

// Exports
export default TimestampedEntity;
