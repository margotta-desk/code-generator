import { EntitySchema, Repository } from 'typeorm'
import { ISchemataModel } from '../types'

export const SchemataSchema = new EntitySchema<ISchemataModel>({
	name: 'schemata',
	schema: 'information_schema',
	columns: {
		CatalogName: {
			name: 'catalog_name',
			type: 'varchar',
			primary: true,
		},
		SchemaName: {
			name: 'schema_name',
			type: 'varchar',
			primary: true,
		},
		SchemaOwner: {
			name: 'schema_owner',
			type: 'varchar'
		},
		DefaultCharacterSetCatalog: {
			name: 'default_character_set_catalog',
			type: 'varchar'
		},
		DefaultCharacterSetSchema: {
			name: 'default_character_set_schema',
			type: 'varchar'
		},
		DefaultCharacterSetName: {
			name: 'default_character_set_name',
			type: 'varchar'
		},
		SqlPath: {
			name: 'sql_path',
			type: 'varchar'
		},
	},
	relations: {
		Tables: {
			type: 'one-to-many',
			target: 'tables',
			inverseSide: 'Schemata'
		}
	}
})

export type SchemataPersistence = Repository<ISchemataModel>
