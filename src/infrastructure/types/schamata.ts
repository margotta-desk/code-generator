import type { ITableModel } from './table'

export interface ISchemataKey {
	CatalogName: string
	SchemaName: string
}

export interface ISchemataValue {
	SchemaOwner: string
	DefaultCharacterSetCatalog: string
	DefaultCharacterSetSchema: string
	DefaultCharacterSetName: string
	SqlPath: string
}

export interface ISchemataEntity extends ISchemataKey, ISchemataValue { }

export interface ISchemataModel extends ISchemataKey, ISchemataValue {
	Tables?: ITableModel[]
}

export interface ISchemataFilter {
	ExcludeSystem: boolean
	CatalogName?: string
}
