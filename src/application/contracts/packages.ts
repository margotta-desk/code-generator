import { ModuleModel } from '../models'

export interface IPackagesService {
	Generate(projectId: string, modules: ModuleModel[]): Promise<void>
}