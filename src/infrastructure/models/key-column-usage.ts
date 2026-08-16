import { EntitySchema, Repository } from 'typeorm'
import { IKeyColumnUsageModel } from '../types'

export const KeyColumnUsageSchema = new EntitySchema<IKeyColumnUsageModel>({
	name: 'key_column_usage',
	schema: 'information_schema',
	columns: {
		ConstraintCatalog: { name: 'constraint_catalog', type: 'varchar', primary: true },
		ConstraintSchema: { name: 'constraint_schema', type: 'varchar', primary: true },
		ConstraintName: { name: 'constraint_name', type: 'varchar', primary: true },
		TableCatalog: { name: 'table_catalog', type: 'varchar' },
		TableSchema: { name: 'table_schema', type: 'varchar' },
		TableName: { name: 'table_name', type: 'varchar' },
		ColumnName: { name: 'column_name', type: 'varchar', primary: true },
		OrdinalPosition: { name: 'ordinal_position', type: 'integer' },
		PositionInUniqueConstraint: { name: 'position_in_unique_constraint', type: 'integer' },
	},
	relations: {
		TableConstraint: {
			type: 'many-to-one',
			target: 'table_constraints',
			joinColumn: [
				{ name: 'constraint_catalog', referencedColumnName: 'ConstraintCatalog' },
				{ name: 'constraint_schema', referencedColumnName: 'ConstraintSchema' },
				{ name: 'table_name', referencedColumnName: 'TableName' },
				{ name: 'constraint_name', referencedColumnName: 'ConstraintName' }
			]
		},
		ReferentialConstraint: {
			type: 'many-to-one',
			target: 'referential_constraints',
			joinColumn: [
				{ name: 'constraint_catalog', referencedColumnName: 'ConstraintCatalog' },
				{ name: 'constraint_schema', referencedColumnName: 'ConstraintSchema' },
				{ name: 'constraint_name', referencedColumnName: 'ConstraintName' }
			]
		},
		UniqueReferentialConstraint: {
			type: 'many-to-one',
			target: 'referential_constraints',
			joinColumn: [
				{ name: 'constraint_catalog', referencedColumnName: 'UniqueConstraintCatalog' },
				{ name: 'constraint_schema', referencedColumnName: 'UniqueConstraintSchema' },
				{ name: 'constraint_name', referencedColumnName: 'UniqueConstraintName' }
			]
		},
		// KeyColumnUsage: {
		// 	type: 'one-to-one',
		// 	target: 'constraint_column_usage',
		// 	joinColumn: [
		// 		{ name: 'constraint_catalog', referencedColumnName: 'ConstraintCatalog' },
		// 		{ name: 'constraint_schema', referencedColumnName: 'ConstraintSchema' },
		// 		{ name: 'constraint_name', referencedColumnName: 'ConstraintName' }
		// 	]
		// },
		Column: {
			type: 'one-to-one',
			target: 'columns',
			joinColumn: [
				{ name: 'table_catalog', referencedColumnName: 'TableCatalog' },
				{ name: 'table_schema', referencedColumnName: 'TableSchema' },
				{ name: 'table_name', referencedColumnName: 'TableName' },
				{ name: 'column_name', referencedColumnName: 'ColumnName' }
			]
		}
	}
})

export type KeyColumnUsagePersistence = Repository<IKeyColumnUsageModel>
