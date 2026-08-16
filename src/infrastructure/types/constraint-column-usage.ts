export interface IConstraintColumnUsageKey {
	ConstraintCatalog: string
	ConstraintSchema: string
	ConstraintName: string
	ColumnName: string
}

export interface IConstraintColumnUsageValue {
	TableCatalog: string
	TableSchema: string
	TableName: string
}

export interface IConstraintColumnUsageEntity extends IConstraintColumnUsageKey, IConstraintColumnUsageValue { }

export interface IConstraintColumnUsageModel extends IConstraintColumnUsageKey, IConstraintColumnUsageValue { }

export interface IConstraintColumnUsageFilter { }
