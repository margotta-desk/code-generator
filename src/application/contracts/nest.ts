import { ModuleModel } from '../models'

export interface INestService {
	Generate(projectId: string, modules: ModuleModel[]): Promise<void>
}