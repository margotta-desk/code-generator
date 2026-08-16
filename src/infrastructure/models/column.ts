import { EntitySchema, Repository } from 'typeorm'
import { YesNoTransformer } from '../helpers'
import { IColumnModel } from '../types'

export const ColumnSchema = new EntitySchema<IColumnModel>({
	name: 'columns',
	schema: 'information_schema',
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
		ColumnName: {
			name: 'column_name',
			type: 'varchar',
			primary: true
		},
		OrdinalPosition: {
			name: 'ordinal_position',
			type: 'int'
		},
		ColumnDefault: {
			name: 'column_default',
			type: 'varchar',
			nullable: true
		},
		IsNullable: {
			name: 'is_nullable',
			type: 'boolean',
			transformer: YesNoTransformer
		},
		DataType: {
			name: 'data_type',
			type: 'varchar'
		},
		CharacterMaximumLength: {
			name: 'character_maximum_length',
			type: 'int',
			nullable: true
		},
		CharacterOctetLength: {
			name: 'character_octet_length',
			type: 'int',
			nullable: true
		},
		NumericPrecision: {
			name: 'numeric_precision',
			type: 'int',
			nullable: true
		},
		NumericPrecisionRadix: {
			name: 'numeric_precision_radix',
			type: 'int',
			nullable: true
		},
		NumericScale: {
			name: 'numeric_scale',
			type: 'int',
			nullable: true
		},
		DatetimePrecision: {
			name: 'datetime_precision',
			type: 'int',
			nullable: true
		},
		IntervalType: {
			name: 'interval_type',
			type: 'varchar'
		},
		IntervalPrecision: {
			name: 'interval_precision',
			type: 'int',
			nullable: true
		},
		CharacterSetCatalog: {
			name: 'character_set_catalog',
			type: 'varchar'
		},
		CharacterSetSchema: {
			name: 'character_set_schema',
			type: 'varchar'
		},
		CharacterSetName: {
			name: 'character_set_name',
			type: 'varchar'
		},
		CollationCatalog: {
			name: 'collation_catalog',
			type: 'varchar',
			nullable: true
		},
		CollationSchema: {
			name: 'collation_schema',
			type: 'varchar',
			nullable: true
		},
		CollationName: {
			name: 'collation_name',
			type: 'varchar',
			nullable: true
		},
		DomainCatalog: {
			name: 'domain_catalog',
			type: 'varchar',
			nullable: true
		},
		DomainSchema: {
			name: 'domain_schema',
			type: 'varchar',
			nullable: true
		},
		DomainName: {
			name: 'domain_name',
			type: 'varchar',
			nullable: true
		},
		UdtCatalog: {
			name: 'udt_catalog',
			type: 'varchar'
		},
		UdtSchema: {
			name: 'udt_schema',
			type: 'varchar'
		},
		UdtName: {
			name: 'udt_name',
			type: 'varchar'
		},
		ScopeCatalog: {
			name: 'scope_catalog',
			type: 'varchar',
			nullable: true
		},
		ScopeSchema: {
			name: 'scope_schema',
			type: 'varchar',
			nullable: true
		},
		ScopeName: {
			name: 'scope_name',
			type: 'varchar',
			nullable: true
		},
		MaximumCardinality: {
			name: 'maximum_cardinality',
			type: 'int',
			nullable: true
		},
		DtdIdentifier: {
			name: 'dtd_identifier',
			type: 'int'
		},
		IsSelfReferencing: {
			name: 'is_self_referencing',
			type: 'boolean',
			transformer: YesNoTransformer
		},
		IsIdentity: {
			name: 'is_identity',
			type: 'boolean',
			transformer: YesNoTransformer
		},
		IdentityGeneration: {
			name: 'identity_generation',
			type: 'varchar',
			nullable: true
		},
		IdentityStart: {
			name: 'identity_start',
			type: 'int',
			nullable: true
		},
		IdentityIncrement: {
			name: 'identity_increment',
			type: 'int',
			nullable: true
		},
		IdentityMaximum: {
			name: 'identity_maximum',
			type: 'int',
			nullable: true
		},
		IdentityMinimum: {
			name: 'identity_minimum',
			type: 'int',
			nullable: true
		},
		IdentityCycle: {
			name: 'identity_cycle',
			type: 'boolean',
			nullable: true,
			transformer: YesNoTransformer
		},
		IsGenerated: {
			name: 'is_generated',
			type: 'varchar'
		},
		GenerationExpression: {
			name: 'generation_expression',
			type: 'varchar',
			nullable: true
		},
		IsUpdatable: {
			name: 'is_updatable',
			type: 'boolean',
			transformer: YesNoTransformer
		},
	},
	relations: {
		Table: {
			type: 'many-to-one',
			target: 'tables',
			joinColumn: [
				{ name: 'table_catalog', referencedColumnName: 'TableCatalog' },
				{ name: 'table_schema', referencedColumnName: 'TableSchema' },
				{ name: 'table_name', referencedColumnName: 'TableName' }
			]
		}
	}
})

export type ColumnPersistence = Repository<IColumnModel>