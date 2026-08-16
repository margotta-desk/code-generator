import { EntitySchema, Repository } from 'typeorm'
import { YesNoTransformer } from '../helpers'
import { ITableConstraintModel } from '../types'

export const TableConstraintSchema = new EntitySchema<ITableConstraintModel>({
	name: 'table_constraints',
	schema: 'information_schema',
	columns: {
		ConstraintCatalog: {
			name: 'constraint_catalog',
			type: 'varchar',
			primary: true
		},
		ConstraintSchema: {
			name: 'constraint_schema',
			type: 'varchar',
			primary: true
		},
		ConstraintName: {
			name: 'constraint_name',
			type: 'varchar',
			primary: true
		},
		TableCatalog: {
			name: 'table_catalog',
			type: 'varchar'
		},
		TableSchema: {
			name: 'table_schema',
			type: 'varchar'
		},
		TableName: {
			name: 'table_name',
			type: 'varchar'
		},
		ConstraintType: {
			name: 'constraint_type',
			type: 'varchar'
		},
		IsDeferrable: {
			name: 'is_deferrable',
			type: 'varchar',
			transformer: YesNoTransformer
		},
		InitiallyDeferred: {
			name: 'initially_deferred',
			type: 'varchar',
			transformer: YesNoTransformer
		},
		Enforced: {
			name: 'enforced',
			type: 'varchar',
			transformer: YesNoTransformer
		},
		NullsDistinct: {
			name: 'nulls_distinct',
			type: 'varchar',
			transformer: YesNoTransformer
		},
	},
	relations: {
		// Table: {
		// 	type: 'many-to-one',
		// 	target: 'tables',
		// 	joinColumn: [
		// 		{ name: 'table_catalog', referencedColumnName: 'TableCatalog' },
		// 		{ name: 'table_schema', referencedColumnName: 'TableSchema' },
		// 		{ name: 'table_name', referencedColumnName: 'TableName' }
		// 	]
		// },
		KeyColumnUsages: {
			type: 'one-to-many',
			target: 'key_column_usage',
			inverseSide: 'TableConstraint'
		},
		ReferentialConstraint: {
			type: 'one-to-one',
			target: 'referential_constraints',
			inverseSide: 'TableConstraint'
		},
		UniqueReferentialConstraint: {
			type: 'one-to-one',
			target: 'referential_constraints',
			inverseSide: 'UniqueTableConstraint'
		}
	}
})

export type TableConstraintPersistence = Repository<ITableConstraintModel>
