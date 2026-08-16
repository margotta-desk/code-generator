import { Convert } from '../helpers'
import { DependencyModel } from './dependency'
import { KeyModel } from './key'
import { ModuleModel } from './module'
import { PropertyModel } from './property'
import { ValueModel } from './value'

export class ClassModel {
	TableName: string

	Module: ModuleModel

	Properties: PropertyModel[]
	Key?: KeyModel
	Values: ValueModel[]

	ManyToOne: DependencyModel[]
	ManyToOneReversed: DependencyModel[]
	OneToOne: DependencyModel[]
	OneToOneReversed: DependencyModel[]

	public get ClassName(): string {
		return Convert.ToPascalCase(this.TableName)
	}

	public get FieldName(): string {
		return Convert.ToCamelCase(this.TableName)
	}

	public get FileName(): string {
		return Convert.ToKebabCase(this.TableName)
	}

	public get ReadOnly(): boolean {
		return !this.Key?.Properties.some(s => s.DataType === 'uuid')
	}

	public get Type(): 'view' | 'many-to-many' | 'entity' {
		if (this.Key?.Properties.length === 0) return 'view'
		else if (this.Values.length === 0) return 'many-to-many'
		else return 'entity'
	}
}