import { EntitySchema, Repository } from 'typeorm'
import { ITableModel } from '../types'
import { YesNoTransformer } from '../helpers'

export const TableSchema = new EntitySchema<ITableModel>({
	name: 'tables',
	schema: 'information_schema',
	orderBy: {
		'table_name': 'ASC'
	},
	columns: {
		TableCatalog: {
			name: 'table_catalog',
			type: 'varchar',
			primary: true
		},
		TableSchema: {
			name: 'table_schema',
			type: 'varchar',
			primary: true
		},
		TableName: {
			name: 'table_name',
			type: 'varchar',
			primary: true
		},
		TableType: {
			name: 'table_type',
			type: 'varchar'
		},
		SelfReferencingColumnName: {
			name: 'self_referencing_column_name',
			type: 'varchar'
		},
		ReferenceGeneration: {
			name: 'reference_generation',
			type: 'varchar'
		},
		UserDefinedTypeCatalog: {
			name: 'user_defined_type_catalog',
			type: 'varchar'
		},
		UserDefinedTypeSchema: {
			name: 'user_defined_type_schema',
			type: 'varchar'
		},
		UserDefinedTypeName: {
			name: 'user_defined_type_name',
			type: 'varchar'
		},
		IsInsertableInto: {
			name: 'is_insertable_into',
			type: 'varchar',
			transformer: YesNoTransformer
		},
		IsTyped: {
			name: 'is_typed',
			type: 'varchar',
			transformer: YesNoTransformer
		},
		CommitAction: {
			name: 'commit_action',
			type: 'varchar'
		},
	},
	relations: {
		Schemata: {
			type: 'many-to-one',
			target: 'schemata',
			joinColumn: [
				{ name: 'table_catalog', referencedColumnName: 'CatalogName' },
				{ name: 'table_schema', referencedColumnName: 'SchemaName' }
			]
		},
		Columns: {
			type: 'one-to-many',
			target: 'columns',
			inverseSide: 'Table'
		},
		// TableConstraints: {
		// 	type: 'one-to-many',
		// 	target: 'table_constraints',
		// 	inverseSide: 'Table'
		// },
	}
})

export type TablePersistence = Repository<ITableModel>
