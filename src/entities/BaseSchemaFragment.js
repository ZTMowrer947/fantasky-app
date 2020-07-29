// Base schema columns
/**
 * @type {import("typeorm").EntitySchemaColumnOptions}
 */
const BaseSchemaFragment = {
  id: {
    type: 'bigint',
    primary: true,
    generated: true,
    nullable: false,
  },
};

// Exports
export default BaseSchemaFragment;
