import { ModuleModel } from '../models'

export interface INestModulesService {
	Generate(projectId: string, modules: ModuleModel[]): Promise<void>
}