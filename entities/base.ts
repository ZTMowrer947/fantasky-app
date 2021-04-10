import { EntitySchemaColumnOptions } from 'typeorm';

export interface EntityBase {
  id: number;
  version: number;
}

export const EntityBaseSchemaFragment: Record<
  keyof EntityBase,
  EntitySchemaColumnOptions
> = {
  id: {
    type: Number,
    primary: true,
    generated: true,
  },
  version: {
    type: Number,
    version: true,
  },
};
