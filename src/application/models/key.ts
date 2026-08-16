import { ClassModel } from './class'
import { PropertyModel } from './property'

export class KeyModel {
	KeyName: string
	ConstraintName: string
	Class: ClassModel
	Properties: PropertyModel[]

	public get PropertiesGenerated(): PropertyModel[] {
		return this.Properties.filter(f => f.UdtType === 'uuid' && f.ColumnDefault !== null) ?? []
	}

	public get PropertiesNonGenerated(): PropertyModel[] {
		return this.Properties.filter(f => !this.PropertiesGenerated.includes(f))
	}
}