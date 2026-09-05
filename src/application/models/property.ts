import { Convert } from '../helpers'
import { ClassModel } from './class'

export class PropertyModel {
	ColumnDefault?: string
	ColumnName: string
	DataType: string
	GenerationExpression?: string
	Identity: boolean
	MaxLength?: number
	Nullable: boolean
	NumericPrecision?: number
	NumericScale?: number
	Position: number
	UdtType:
		| "_aclitem"
		| "_bool"
		| "_char"
		| "_float4"
		| "_float8"
		| "_int2"
		| "_int4"
		| "_name"
		| "_oid"
		| "_pg_statistic"
		| "_regtype"
		| "_text"
		| "anyarray"
		| "bool"
		| "bytea"
		| "char"
		| "date"
		| "float4"
		| "float8"
		| "inet"
		| "int2"
		| "int2vector"
		| "int4"
		| "int8"
		| "interval"
		| "jsonb"
		| "name"
		| "numeric"
		| "oid"
		| "oidvector"
		| "pg_dependencies"
		| "pg_lsn"
		| "pg_mcv_list"
		| "pg_ndistinct"
		| "pg_node_tree"
		| "regproc"
		| "regtype"
		| "text"
		| "time"
		| "timestamp"
		| "timestamptz"
		| "uuid"
		| "varchar"
		| "xml"
		| "xid"
	Updatable: boolean

	Class: ClassModel

	public get PropertyName(): string {
		return Convert.ToPascalCase(this.ColumnName)
	}

	public get PropertyType(): 'string' | 'number' | 'Date' | 'boolean' | 'Record<string, unknown>' {
		switch (this.UdtType) {
			case 'bool': return 'boolean'
			case 'char': return 'string'
			case 'date': return 'Date'
			case 'float4': return 'number'
			case 'float8': return 'number'
			case 'int2': return 'number'
			case 'int4': return 'number'
			case 'int8': return 'number'
			case 'jsonb': return 'Record<string, unknown>'
			case 'name': return 'string'
			case 'numeric': return 'number'
			case 'oid': return 'string'
			case 'text': return 'string'
			case 'time': return 'Date'
			case 'timestamp': return 'Date'
			case 'timestamptz': return 'Date'
			case 'uuid': return 'string'
			case 'varchar': return 'string'
			case 'xml': return 'string'
			default: throw new Error(`No se ha especificado una conversión para el tipo de datos udt ${this.UdtType}`)
		}
	}
}