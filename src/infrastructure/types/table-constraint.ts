import type { IKeyColumnUsageModel } from './key-column-usage'
import type { IReferentialConstraintModel } from './referential-constraint'

export interface ITableConstraintKey {
	ConstraintCatalog: string
	ConstraintSchema: string
	ConstraintName: string
}

export interface ITableConstraintValue {
	ConstraintCatalog: string
	ConstraintSchema: string
	ConstraintName: string
	TableCatalog: string
	TableSchema: string
	TableName: string
	ConstraintType: 'CHECK' | 'FOREIGN KEY' | 'PRIMARY KEY' | 'UNIQUE'
	IsDeferrable: boolean
	InitiallyDeferred: boolean
	Enforced: boolean
	NullsDistinct: boolean
}

export interface ITableConstraintEntity extends ITableConstraintKey, ITableConstraintValue { }

export interface ITableConstraintModel extends ITableConstraintKey, ITableConstraintValue {
	KeyColumnUsages: IKeyColumnUsageModel[]
	ReferentialConstraint: IReferentialConstraintModel
	UniqueReferentialConstraint: IReferentialConstraintModel

	// Table: ITableModel
}

export interface ITableConstraintFilter {
	TableCatalog?: string
	TableSchema?: string
	TableName?: string
	ConstraintType?: 'CHECK' | 'FOREIGN KEY' | 'PRIMARY KEY' | 'UNIQUE'
}
