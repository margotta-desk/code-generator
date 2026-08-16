import ejs from 'ejs'
import fs from 'fs'
import { mkdir } from 'fs/promises'
import path from 'path'
import { inject, injectable } from 'tsyringe'
import { IProjectType } from '../../cli'
import { TOKENS } from '../../tokens'
import { INestSharedModuleService } from '../contracts'
import { ModuleModel } from '../models'

const moduleTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/nest/shared-module.ejs'), 'utf8')
const serializerDecoratorTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/nest/shared-serializer.decorator.ejs'), 'utf8')
const serializeInterceptorTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/nest/shared-serialize.interceptor.ejs'), 'utf8')

const importsTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/imports.ejs'), 'utf8')

@injectable()
export class NestSharedModuleService implements INestSharedModuleService {

	constructor(@inject(TOKENS.Project) private readonly project: IProjectType) { }

	public async Generate(_projectId: string, modules: ModuleModel[]): Promise<void> {
		const outputDir = path.join(import.meta.dirname, '../', '../', '../', 'output', this.project.path, 'apps', 'backend', 'src', 'modules')
		if (!fs.existsSync(outputDir)) await mkdir(outputDir, { recursive: true })

		const moduleDir = path.join(outputDir, 'shared')
		if (!fs.existsSync(outputDir)) await mkdir(moduleDir, { recursive: true })

		await this.generateModule(moduleDir)
		await this.generateDecorators(moduleDir)
		await this.generateInterceptors(moduleDir)

		// const barril: string = modules.length == 0
		// 	? 'export { }'
		// 	: modules.map(m => `export * from './${m.FileName}'`).join('\n')

		// fs.writeFileSync(path.join(outputDir, `index.ts`), barril, 'utf8')

	}

	private async generateDecorators(moduleDir: string) {
		const decoratorsDir: string = path.join(moduleDir, 'decorators')
		if (!fs.existsSync(decoratorsDir)) await mkdir(decoratorsDir, { recursive: true })

		let ModuleImports: Record<string, string[]> = {
			'@nestjs/common': ['SetMetadata', 'Type'],
		}

		const Imports = ejs.render(importsTemplate, { UiImports: ModuleImports })

		const rendered: string = ejs.render(serializerDecoratorTemplate, { Imports }).trim()
		fs.writeFileSync(path.join(decoratorsDir, `serialize.decorator.ts`), rendered, 'utf8')

		{
			const barril: string = [
				`export * from './serialize.decorator'`
			].join('\n')

			fs.writeFileSync(path.join(decoratorsDir, `index.ts`), barril, 'utf8')
		}
	}

	private async generateInterceptors(moduleDir: string) {
		const interceptorsDir: string = path.join(moduleDir, 'interceptors')
		if (!fs.existsSync(interceptorsDir)) await mkdir(interceptorsDir, { recursive: true })

		let ModuleImports: Record<string, string[]> = {
			'@nestjs/common': ['CallHandler', 'ExecutionContext', 'Injectable', 'NestInterceptor', 'Type'],
			'@nestjs/core': ['Reflector'],
			'class-transformer': ['plainToInstance'],
			'rxjs': ['map', 'Observable'],
			'../decorators': ['SERIALIZE_KEY'],
		}

		const Imports = ejs.render(importsTemplate, { UiImports: ModuleImports })

		const rendered: string = ejs.render(serializeInterceptorTemplate, { Imports }).trim()
		fs.writeFileSync(path.join(interceptorsDir, `serialize.interceptor.ts`), rendered, 'utf8')

		{
			const barril: string = [
				`export * from './serialize.interceptor'`
			].join('\n')

			fs.writeFileSync(path.join(interceptorsDir, `index.ts`), barril, 'utf8')
		}
	}

	private async generateModule(moduleDir: string) {
		if (!fs.existsSync(moduleDir)) await mkdir(moduleDir, { recursive: true })

		let ModuleImports: Record<string, string[]> = {
			'@nestjs/common': ['Module']
		}

		const Imports = ejs.render(importsTemplate, { UiImports: ModuleImports })

		const rendered: string = ejs.render(moduleTemplate, { Imports }).trim()
		fs.writeFileSync(path.join(moduleDir, `shared.module.ts`), rendered, 'utf8')

		{
			const barril: string = [
				`export * from './decorators'`,
				`export * from './interceptors'`,
				``,
				`export * from './shared.module'`,
			].join('\n')

			fs.writeFileSync(path.join(moduleDir, `index.ts`), barril, 'utf8')
		}
	}
}