import { EntitySchema, Repository } from 'typeorm'
import { IReferentialConstraintModel } from '../types'

export const ReferentialConstraintSchema = new EntitySchema<IReferentialConstraintModel>({
	name: 'referential_constraints',
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
		UniqueConstraintCatalog: {
			name: 'unique_constraint_catalog',
			type: 'varchar'
		},
		UniqueConstraintSchema: {
			name: 'unique_constraint_schema',
			type: 'varchar'
		},
		UniqueConstraintName: {
			name: 'unique_constraint_name',
			type: 'varchar'
		},
		MatchOption: {
			name: 'match_option',
			type: 'varchar'
		},
		UpdateRule: {
			name: 'update_rule',
			type: 'varchar'
		},
		DeleteRule: {
			name: 'delete_rule',
			type: 'varchar'
		},
	},
	relations: {
		TableConstraint: {
			type: 'one-to-one',
			target: 'table_constraints',
			joinColumn: [
				{ name: 'constraint_catalog', referencedColumnName: 'ConstraintCatalog' },
				{ name: 'constraint_schema', referencedColumnName: 'ConstraintSchema' },
				{ name: 'constraint_name', referencedColumnName: 'ConstraintName' },
			]
		},
		UniqueKeyColumnUsage: {
			type: 'one-to-many',
			target: 'key_column_usage',
			inverseSide: 'UniqueReferentialConstraint'
		},
	}
})

export type ReferentialConstraintPersistence = Repository<IReferentialConstraintModel>
