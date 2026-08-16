import { ModuleModel } from '../models'

export interface INestSrcService {
	Generate(projectId: string, modules: ModuleModel[]): Promise<void>
}