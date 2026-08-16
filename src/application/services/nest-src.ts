import ejs from 'ejs'
import fs from 'fs'
import { mkdir } from 'fs/promises'
import path from 'path'
import { inject, injectable } from 'tsyringe'
import { IProjectType } from '../../cli'
import { TOKENS } from '../../tokens'
import { INestModulesService, INestSharedModuleService, INestSrcService } from '../contracts'
import { ModuleModel } from '../models'
import { Sort } from '../helpers'

const AppModuleTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/nest/app-module.ejs'), 'utf8')
const mainTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/nest/main.ejs'), 'utf8')
const importsTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/imports.ejs'), 'utf8')

@injectable()
export class NestSrcService implements INestSrcService {

	constructor(
		@inject(TOKENS.Project) private readonly project: IProjectType,
		@inject(TOKENS.NestSharedModuleService) private readonly nestSharedModuleService: INestSharedModuleService,
		@inject(TOKENS.NestModulesService) private readonly nestModulesService: INestModulesService,
	) { }

	public async Generate(projectId: string, modules: ModuleModel[]): Promise<void> {
		const outputDir = path.join(import.meta.dirname, '../', '../', '../', 'output', this.project.path, 'apps', 'backend', 'src')
		if (!fs.existsSync(outputDir)) await mkdir(outputDir, { recursive: true })

		await this.generateMain(outputDir)
		await this.generateAppModule(outputDir, modules)

		await this.nestSharedModuleService.Generate(projectId, modules)
		await this.nestModulesService.Generate(projectId, modules)
	}

	public async generateAppModule(outputDir: string, modules: ModuleModel[]) {

		/*
		import { Module } from '@nestjs/common'
		import { ConfigModule, ConfigService } from '@nestjs/config'
		import { RouterModule } from '@nestjs/core'
		import { EventEmitterModule } from '@nestjs/event-emitter'
		import { JwtModule } from '@nestjs/jwt'
		import { ScheduleModule } from '@nestjs/schedule'
		import { TypeOrmModule } from '@nestjs/typeorm'
		import { <%- Modules.map((module)=> `${module.ModuleName}Module`).join(', ') %> } from './modules'
		*/

		let ModuleImports: Record<string, string[]> = {
			'@nestjs/common': ['Module'],
			'@nestjs/config': ['ConfigModule', 'ConfigService'],
			'@nestjs/core': ['RouterModule'],
			'@nestjs/event-emitter': ['EventEmitterModule'],
			'@nestjs/jwt': ['JwtModule'],
			'@nestjs/schedule': ['ScheduleModule'],
			'@nestjs/typeorm': ['TypeOrmModule'],
			'./modules/shared': ['SharedModule'],
		}
		
		for await (const module of modules) {
			ModuleImports[`./modules/${module.FileName}`] = [`${module.ModuleName}Module`]
		}

		ModuleImports = Sort.RecordArrayByKey<string>(ModuleImports)

		const Imports = ejs.render(importsTemplate, { UiImports: ModuleImports })

		const rendered: string = ejs.render(AppModuleTemplate, { Modules: modules, Imports }).trim()

		fs.writeFileSync(path.join(outputDir, `app.module.ts`), rendered, 'utf8')
	}

	public async generateMain(outputDir: string) {
		const rendered: string = ejs.render(mainTemplate, { Project: this.project }).trim()

		fs.writeFileSync(path.join(outputDir, `main.ts`), rendered, 'utf8')
	}
}