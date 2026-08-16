import { IKeyColumnUsageModel } from './key-column-usage'
import type { ITableConstraintModel } from './table-constraint'

export interface IReferentialConstraintKey {
	ConstraintCatalog: string
	ConstraintSchema: string
	ConstraintName: string
}

export interface IReferentialConstraintValue {
	UniqueConstraintCatalog: string
	UniqueConstraintSchema: string
	UniqueConstraintName: string
	MatchOption: 'NONE'
	UpdateRule: 'NO ACTION'
	DeleteRule: 'NO ACTION'
}

export interface IReferentialConstraintEntity extends IReferentialConstraintKey, IReferentialConstraintValue { }

export interface IReferentialConstraintModel extends IReferentialConstraintKey, IReferentialConstraintValue {
	TableConstraint: ITableConstraintModel
	UniqueKeyColumnUsage: IKeyColumnUsageModel[]
	// UniqueTableConstraint: ITableConstraintModel
}

export interface IReferentialConstraintFilter {
	ConstraintCatalog?: string
	ConstraintSchema?: string
	ConstraintName?: string
	UniqueConstraintCatalog?: string
	UniqueConstraintSchema?: string
	UniqueConstraintName?: string
}
