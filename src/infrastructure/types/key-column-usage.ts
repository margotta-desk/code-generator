import type { IColumnModel } from './column'
import { IReferentialConstraintModel } from './referential-constraint'
import type { ITableConstraintModel } from './table-constraint'

export interface IKeyColumnUsageKey {
	ConstraintCatalog: string
	ConstraintSchema: string
	ConstraintName: string
	ColumnName: string
}

export interface IKeyColumnUsageValue {
	TableCatalog: string
	TableSchema: string
	TableName: string
	OrdinalPosition: number
	PositionInUniqueConstraint: number
}

export interface IKeyColumnUsageEntity extends IKeyColumnUsageKey, IKeyColumnUsageValue { }

export interface IKeyColumnUsageModel extends IKeyColumnUsageKey, IKeyColumnUsageValue {
	TableConstraint: ITableConstraintModel
	ReferentialConstraint: IReferentialConstraintModel
	UniqueReferentialConstraint: IReferentialConstraintModel
	Column: IColumnModel
	// KeyColumnUsage: IKeyColumnUsageModel
}

export interface IKeyColumnUsageFilter {
	ConstraintCatalog?: string
	ConstraintSchema?: string
	ConstraintName?: string
	TableName?: string
}