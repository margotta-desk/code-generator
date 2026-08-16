import { ModuleModel } from '../../application/models'

export function renderModules<T extends Record<string, ModuleModel>>(rows: T[]): void {
	console.table(rows)
}