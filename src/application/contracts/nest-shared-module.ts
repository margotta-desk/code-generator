import { ModuleModel } from '../models'

export interface INestSharedModuleService {
	Generate(projectId: string, modules: ModuleModel[]): Promise<void>
}