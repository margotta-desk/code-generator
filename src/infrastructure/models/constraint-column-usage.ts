import { EntitySchema, Repository } from 'typeorm'
import { IConstraintColumnUsageModel } from '../types'


export const ConstraintColumnUsageSchema = new EntitySchema<IConstraintColumnUsageModel>({
	name: 'constraint_column_usage',
	schema: 'information_schema',
	columns: {
		ConstraintCatalog: { name: 'constraint_catalog', type: 'varchar', primary: true },
		ConstraintSchema: { name: 'constraint_schema', type: 'varchar', primary: true },
		ConstraintName: { name: 'constraint_name', type: 'varchar', primary: true },
		ColumnName: { name: 'column_name', type: 'varchar', primary: true },
		TableCatalog: { name: 'table_catalog', type: 'varchar' },
		TableSchema: { name: 'table_schema', type: 'varchar' },
		TableName: { name: 'table_name', type: 'varchar' },
	},
	relations: {
		// TableConstraint: {
		// 	type: 'many-to-one',
		// 	target: 'table_constraints',
		// 	joinColumn: [
		// 		{ name: 'constraint_catalog', referencedColumnName: 'ConstraintCatalog' },
		// 		{ name: 'constraint_schema', referencedColumnName: 'ConstraintSchema' },
		// 		{ name: 'constraint_name', referencedColumnName: 'ConstraintName' }
		// 	]
		// },
		// Column: {
		// 	type: 'many-to-one',
		// 	target: 'columns',
		// 	joinColumn: [
		// 		{ name: 'table_catalog', referencedColumnName: 'TableCatalog' },
		// 		{ name: 'table_schema', referencedColumnName: 'TableSchema' },
		// 		{ name: 'table_name', referencedColumnName: 'TableName' },
		// 		{ name: 'ordinal_position', referencedColumnName: 'OrdinalPosition' }
		// 	]
		// }
	}
})

export type ConstraintColumnUsagePersistence = Repository<IConstraintColumnUsageModel>
