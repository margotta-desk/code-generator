import { ModuleModel } from '../models'

export interface IMetadataLoaderService {
	Load(): Promise<ModuleModel[]>
	ValidateSchemas(schemas: Record<string, boolean>): Promise<Record<string, boolean>>
}