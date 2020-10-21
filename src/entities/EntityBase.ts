// Imports
import { PrimaryGeneratedColumn } from 'typeorm';

// Base entity
abstract class EntityBase {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  id!: number;
}

// Exports
export default EntityBase;
