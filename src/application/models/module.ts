import { ClassModel } from './class'

export class ModuleModel {
	FileName: string
	SchemaName: string
	ModuleName: string
	Classes: ClassModel[]
	References: ModuleModel[]
}