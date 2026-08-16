import type { IColumnModel } from './column'
import type { ISchemataModel } from "./schamata"

export interface ITableKey {
	TableCatalog: string
	TableSchema: string
	TableName: string
}

export interface ITableValue {
	TableType: 'BASE TABLE' | 'VIEW'
	SelfReferencingColumnName: string
	ReferenceGeneration: string
	UserDefinedTypeCatalog: string
	UserDefinedTypeSchema: string
	UserDefinedTypeName: string
	IsInsertableInto: boolean
	IsTyped: boolean
	CommitAction: string
}

export interface ITableEntity extends ITableKey, ITableValue { }

export interface ITableModel extends ITableKey, ITableValue {
	Schemata: ISchemataModel
	Columns: IColumnModel[]
	// TableConstraints: ITableConstraintModel[]
}

export interface ITableFilter {
	TableCatalog?: string
	TableSchema?: string
}
