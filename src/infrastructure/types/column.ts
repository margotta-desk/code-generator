import type { ITableModel } from './table'

export interface IColumnKey {
	TableCatalog: string
	TableSchema: string
	TableName: string
	OrdinalPosition: number
}

export interface IColumnValue {
	ColumnName: string
	ColumnDefault?: string
	IsNullable: boolean
	DataType: string
	CharacterMaximumLength?: number
	CharacterOctetLength?: number
	NumericPrecision?: number
	NumericPrecisionRadix?: number
	NumericScale?: number
	DatetimePrecision?: number
	IntervalType: string
	IntervalPrecision?: number
	CharacterSetCatalog: string
	CharacterSetSchema: string
	CharacterSetName: string
	CollationCatalog?: string
	CollationSchema?: string
	CollationName?: string
	DomainCatalog?: string
	DomainSchema?: string
	DomainName?: 'cardinal_number' | 'character_data' | 'sql_identifier' | 'time_stamp' | 'yes_or_no'
	UdtCatalog: string
	UdtSchema: string
	UdtName: '_aclitem' | '_bool' | '_char' | '_float4' | '_float8' | '_int2' | '_int4' | '_name' | '_oid' | '_pg_statistic' | '_regtype' | '_text' | 'anyarray' | 'bool' | 'bytea' | 'char' | 'date' | 'float4' | 'float8' | 'inet' | 'int2' | 'int2vector' | 'int4' | 'int8' | 'interval' | 'name' | 'numeric' | 'oid' | 'oidvector' | 'pg_dependencies' | 'pg_lsn' | 'pg_mcv_list' | 'pg_ndistinct' | 'pg_node_tree' | 'regproc' | 'regtype' | 'text' | 'time' | 'timestamp' | 'timestamptz' | 'uuid' | 'varchar' | 'xid'
	ScopeCatalog?: string
	ScopeSchema?: string
	ScopeName?: string
	MaximumCardinality?: number
	DtdIdentifier: number
	IsSelfReferencing: boolean
	IsIdentity: boolean
	IdentityGeneration?: string
	IdentityStart?: number
	IdentityIncrement?: number
	IdentityMaximum?: number
	IdentityMinimum?: number
	IdentityCycle?: boolean
	IsGenerated: 'NEVER'
	GenerationExpression?: string
	IsUpdatable: boolean
}

export interface IColumnEntity extends IColumnKey, IColumnValue { }

export interface IColumnModel extends IColumnKey, IColumnValue {
	Table: ITableModel
}

export interface IColumnFilter {
	TableCatalog?: string
	TableSchema?: string
	TableName?: string
}
