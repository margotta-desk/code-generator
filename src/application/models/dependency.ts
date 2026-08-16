import { Convert } from '../helpers'
import { ClassModel } from './class'
import { PropertyModel } from './property'

export class DependencyPropertiesModel {
	Primary: PropertyModel
	Foreign: PropertyModel
}

export class DependencyModel {
	ConstraintName: string
	Type: 'many-to-one' | 'one-to-one'

	Class: ClassModel
	Referenced: ClassModel

	Properties: DependencyPropertiesModel[]

	public get DependencyName(): string {
		return Convert.ToPascalCase(this.ConstraintName.startsWith('fk_') ? this.ConstraintName.substring(3) : this.ConstraintName)
	}
}