// Imports
import BaseSchemaFragment from './BaseSchemaFragment';

// Timestamped schema columns
/**
 * @type {import("typeorm").EntitySchemaColumnOptions}
 */
const TimestampedSchemaFragment = {
  ...BaseSchemaFragment,
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
};

// Exports
export default TimestampedSchemaFragment;
