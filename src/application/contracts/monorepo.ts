import { ModuleModel } from '../models'

export interface IMonorepoService {
	Generate(projectId: string, modules: ModuleModel[]): Promise<void>
}