import { ModuleModel } from '../models'

export interface IBackendService {
	Generate(projectId: string, modules: ModuleModel[]): Promise<void>
}