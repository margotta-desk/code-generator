import ejs from 'ejs'
import fs from 'fs'
import { mkdir } from 'fs/promises'
import path from 'path'
import { inject, injectable } from 'tsyringe'
import { IProjectType } from '../../cli'
import { TOKENS } from '../../tokens'
import { INestModulesService } from '../contracts'
import { Sort } from '../helpers'
import { ClassModel, DependencyModel, ModuleModel } from '../models'

const moduleTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/nest/modules.ejs'), 'utf8')
const classesTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/nest/classes.ejs'), 'utf8')
const classesBodyTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/nest/classes-body.ejs'), 'utf8')
const classesParamsTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/nest/classes-params.ejs'), 'utf8')
const classesQueryTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/nest/classes-query.ejs'), 'utf8')
const classesResponseTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/nest/classes-response.ejs'), 'utf8')

const controllersTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/nest/controllers.ejs'), 'utf8')
const controllersGetTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/nest/controllers-get.ejs'), 'utf8')
const controllersFindTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/nest/controllers-find.ejs'), 'utf8')
const controllersPatchTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/nest/controllers-patch.ejs'), 'utf8')
const controllersPostTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/nest/controllers-post.ejs'), 'utf8')
const controllersRemoveTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/nest/controllers-remove.ejs'), 'utf8')

const repositoriesTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/nest/repositories.ejs'), 'utf8')
const servicesTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/nest/services.ejs'), 'utf8')

const importsTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/imports.ejs'), 'utf8')

@injectable()
export class NestModulesService implements INestModulesService {

	constructor(@inject(TOKENS.Project) private readonly project: IProjectType) { }

	public async Generate(_projectId: string, modules: ModuleModel[]): Promise<void> {
		const outputDir = path.join(import.meta.dirname, '../', '../', '../', 'output', this.project.path, 'apps', 'backend', 'src', 'modules')
		if (!fs.existsSync(outputDir)) await mkdir(outputDir, { recursive: true })

		for await (const module of modules) {
			const moduleDir = path.join(outputDir, module.FileName)
			if (!fs.existsSync(outputDir)) await mkdir(moduleDir, { recursive: true })

			await this.generateModule(moduleDir, module)
			await this.generateClasses(moduleDir, module)
			await this.generateRepositories(moduleDir, module)
			await this.generateServices(moduleDir, module)
			await this.generateControllers(moduleDir, module)
		}

		const barril: string = 'export { }'

		fs.writeFileSync(path.join(outputDir, `index.ts`), barril, 'utf8')
	}

	private async generateModule(moduleDir: string, module: ModuleModel) {
		if (!fs.existsSync(moduleDir)) await mkdir(moduleDir, { recursive: true })

		let ModuleImports: Record<string, string[]> = {
			'@nestjs/common': ['Module'],
			'@nestjs/typeorm': ['TypeOrmModule'],
			'./controllers': module.Classes.map(m => `${m.ClassName}Controller`),
			'./infrastructure': module.Classes.map(m => `${m.ClassName}Model`),
			'./repositories': module.Classes.map(m => `${m.ClassName}Repository`),
			'./services': module.Classes.map(m => `${m.ClassName}Service`),
		}

		const Imports = ejs.render(importsTemplate, { UiImports: ModuleImports })

		const rendered: string = ejs.render(moduleTemplate, { Imports, Model: module }).trim()
		fs.writeFileSync(path.join(moduleDir, `${module.FileName}.module.ts`), rendered, 'utf8')

		{
			const barril: string = [
				`export * from './classes'`,
				`export * from './events'`,
				`export * from './infrastructure'`,
				`export * from './models'`,
				`export * from './services'`,
				``,
				`export * from './${module.FileName}.module'`,
			].join('\n')

			fs.writeFileSync(path.join(moduleDir, `index.ts`), barril, 'utf8')
		}
	}

	private async generateClasses(moduleDir: string, module: ModuleModel) {
		const classesDir = path.join(moduleDir, 'classes')
		if (!fs.existsSync(classesDir)) await mkdir(classesDir, { recursive: true })

		for await (const classModel of module.Classes) await this.generateClass(classesDir, module, classModel)

		const barril: string = module.Classes.length == 0 ? 'export { }' : module.Classes.map(m => `export * from './${m.FileName}'`).join('\n')
		fs.writeFileSync(path.join(classesDir, `index.ts`), barril, 'utf8')
	}

	private async generateClass(classesDir: string, module: ModuleModel, model: ClassModel) {
		let ClassesImports: Record<string, string[]> = {}

		{	//	Current model
			const file = `@packages/${model.Module.FileName}/ui`
			if (!ClassesImports[file]) ClassesImports[file] = []

			if (!model.ReadOnly && model.Type == 'entity') {
				const entity = `I${model.ClassName}Body`
				if (!ClassesImports[file].includes(entity)) ClassesImports[file].push(entity)
			}

			{
				const entity = `I${model.ClassName}Params`
				if (!ClassesImports[file].includes(entity)) ClassesImports[file].push(entity)
			}

			{
				const entity = `I${model.ClassName}Query`
				if (!ClassesImports[file].includes(entity)) ClassesImports[file].push(entity)
			}

			{
				const entity = `I${model.ClassName}Response`
				if (!ClassesImports[file].includes(entity)) ClassesImports[file].push(entity)
			}
		}

		{
			const file = `class-transformer`
			if (!ClassesImports[file]) ClassesImports[file] = []

			{
				const entity = `Expose`
				if (!ClassesImports[file].includes(entity)) ClassesImports[file].push(entity)
			}

			{
				const entity = `Transform`
				if (!ClassesImports[file].includes(entity)) ClassesImports[file].push(entity)
			}

			if (model.OneToOne.length != 0 || model.ManyToOne.length != 0) {// || model.OneToOneReversed.length != 0 || model.ManyToOneReversed.length != 0
				const entity = `Transform`
				if (!ClassesImports[file].includes(entity)) ClassesImports[file].push(entity)
			}

			if (model.OneToOne.length != 0 || model.ManyToOne.length != 0) {// || model.OneToOneReversed.length != 0 || model.ManyToOneReversed.length != 0
				const entity = `Type`
				if (!ClassesImports[file].includes(entity)) ClassesImports[file].push(entity)
			}
		}

		{
			const file = `@nestjs/swagger`
			if (!ClassesImports[file]) ClassesImports[file] = []

			if (model.Properties.some(s => s.Nullable)) {
				const entity = `ApiPropertyOptional`
				if (!ClassesImports[file].includes(entity)) ClassesImports[file].push(entity)
			}

			if (model.Properties.some(s => !s.Nullable)) {
				const entity = `ApiProperty`
				if (!ClassesImports[file].includes(entity)) ClassesImports[file].push(entity)
			}
		}

		{
			const file = `class-validator`
			if (!ClassesImports[file]) ClassesImports[file] = []

			if (model.Properties.some(s => s.Nullable)) {
				const entity = `IsEmpty`
				if (!ClassesImports[file].includes(entity)) ClassesImports[file].push(entity)
			}

			if (model.Properties.some(s => !s.Nullable)) {
				const entity = `IsNotEmpty`
				if (!ClassesImports[file].includes(entity)) ClassesImports[file].push(entity)
			}

			if (model.Properties.some(s => s.PropertyType === 'number')) {
				const entity = `IsNumber`
				if (!ClassesImports[file].includes(entity)) ClassesImports[file].push(entity)
			}

			if (model.Properties.some(s => s.PropertyType === 'string')) {
				if (model.Properties.some(s => s.UdtType === 'uuid')) {
					const entity = `IsUUID`
					if (!ClassesImports[file].includes(entity)) ClassesImports[file].push(entity)
				}
				if (model.Properties.some(s => s.UdtType === 'varchar')) {
					const entity = `IsString`
					if (!ClassesImports[file].includes(entity)) ClassesImports[file].push(entity)
				}
			}

			if (model.Properties.some(s => s.PropertyType === 'boolean')) {
				const entity = `IsBoolean`
				if (!ClassesImports[file].includes(entity)) ClassesImports[file].push(entity)
			}

			if (model.Properties.some(s => s.PropertyType === 'Date')) {
				const entity = `IsDate`
				if (!ClassesImports[file].includes(entity)) ClassesImports[file].push(entity)
			}
		}


		([...model.ManyToOne.map(obj => obj.Class), ...model.OneToOne.map(obj => obj.Class)]).filter(f => f !== model).forEach((dependency: ClassModel) => {
			{
				const file = `@packages/${dependency.Module.FileName}/ui`
				if (!ClassesImports[file]) ClassesImports[file] = []

				{	//	Response
					const entity = `I${dependency.ClassName}Response`
					if (!ClassesImports[file].includes(entity)) ClassesImports[file].push(entity)
				}
			}

			{
				const file = dependency.Module == model.Module ? `./${dependency.FileName}` : `../../${dependency.Module.FileName}`
				if (!ClassesImports[file]) ClassesImports[file] = []

				{	//	Response
					const entity = `${dependency.ClassName}Response`
					if (!ClassesImports[file].includes(entity)) ClassesImports[file].push(entity)
				}
			}
		})

		ClassesImports = Sort.RecordArrayByKey<string>(ClassesImports)

		const Imports = ejs.render(importsTemplate, { UiImports: ClassesImports })
		const Body: string | null = !model.ReadOnly && model.Type == 'entity' ? ejs.render(classesBodyTemplate, { Model: model }).trim() : null
		const Params: string = ejs.render(classesParamsTemplate, { Model: model }).trim()
		const Query: string = ejs.render(classesQueryTemplate, { Model: model }).trim()
		const Response: string = ejs.render(classesResponseTemplate, { Model: model }).trim()
		const Rendered: string = ejs.render(classesTemplate, { Model: model, Imports, Body, Params, Query, Response }).trim()

		// const rendered: string = ejs.render(classesTemplate, { Imports, Model: model }).trim()
		fs.writeFileSync(path.join(classesDir, `${model.FileName}.ts`), Rendered, 'utf8')
	}

	private async generateRepositories(outputDir: string, module: ModuleModel) {
		const repositoriesDir = path.join(outputDir, 'repositories')
		if (!fs.existsSync(repositoriesDir)) await mkdir(repositoriesDir, { recursive: true })

		const classes: Array<ClassModel> = module.Classes

		for await (const model of classes) {
			let RepositoryImports: Record<string, string[]> = {
				[`@nestjs/common`]: [`Injectable`],
				[`@nestjs/typeorm`]: [`InjectRepository`],
				[`typeorm`]: [`FindOptionsWhere`, `Repository`],
			}

			if (model.ReadOnly == false) {
				const file = `@nestjs/event-emitter`
				if (!RepositoryImports[file]) RepositoryImports[file] = []

				const entity = `EventEmitter2`
				if (!RepositoryImports[file].includes(entity)) RepositoryImports[file].push(entity)
			}

			if (model.ReadOnly == false) {	//	Current model
				const file = `../events`
				if (!RepositoryImports[file]) RepositoryImports[file] = []

				{
					const entity = `${model.ClassName}Events`
					if (!RepositoryImports[file].includes(entity)) RepositoryImports[file].push(entity)
				}
			}

			{
				const file = `../infrastructure`
				if (!RepositoryImports[file]) RepositoryImports[file] = []

				{
					const entity = `${model.ClassName}Model`
					if (!RepositoryImports[file].includes(entity)) RepositoryImports[file].push(entity)
				}
			}
			{
				const file = `../models`
				if (!RepositoryImports[file]) RepositoryImports[file] = []

				// if (model.ReadOnly == false) {
				// 	const entity = `I${model.ClassName}Entity`
				// 	if (!RepositoryImports[file].includes(entity)) RepositoryImports[file].push(entity)
				// }

				{
					const entity = `I${model.ClassName}Key`
					if (!RepositoryImports[file].includes(entity)) RepositoryImports[file].push(entity)
				}

				{
					const entity = `I${model.ClassName}Model`
					if (!RepositoryImports[file].includes(entity)) RepositoryImports[file].push(entity)
				}

				{
					const entity = `I${model.ClassName}Query`
					if (!RepositoryImports[file].includes(entity)) RepositoryImports[file].push(entity)
				}

				if (model.ReadOnly == false) {
					const entity = `I${model.ClassName}Value`
					if (!RepositoryImports[file].includes(entity)) RepositoryImports[file].push(entity)
				}
			}

			RepositoryImports = Sort.RecordArrayByKey<string>(RepositoryImports)

			const Imports = ejs.render(importsTemplate, { UiImports: RepositoryImports })

			const rendered: string = ejs.render(repositoriesTemplate, { Model: model, Imports }).trim()
			fs.writeFileSync(path.join(repositoriesDir, `${model.FileName}.repository.ts`), rendered, 'utf8')
		}

		const barril: string = classes.length === 0
			? `export { }`
			: classes.map(m => `export * from './${m.FileName}.repository'`).join('\n')

		fs.writeFileSync(path.join(repositoriesDir, `index.ts`), barril, 'utf8')
	}

	private async generateServices(outputDir: string, module: ModuleModel) {
		const servicesDir = path.join(outputDir, 'services')
		if (!fs.existsSync(servicesDir)) await mkdir(servicesDir, { recursive: true })

		const classes: Array<ClassModel> = module.Classes

		for await (const model of classes) {

			let RepositoryImports: Record<string, string[]> = {
				[`@nestjs/common`]: [`Injectable`, `Logger`],
			}

			if (model.ReadOnly == false) {
				const file = `@nestjs/event-emitter`
				if (!RepositoryImports[file]) RepositoryImports[file] = []

				const entity = `OnEvent`
				if (!RepositoryImports[file].includes(entity)) RepositoryImports[file].push(entity)
			}

			if (model.ReadOnly == false) {
				const file = `../events`
				if (!RepositoryImports[file]) RepositoryImports[file] = []

				{
					const entity = `${model.ClassName}Events`
					if (!RepositoryImports[file].includes(entity)) RepositoryImports[file].push(entity)
				}
			}

			{
				const file = `../repositories`
				if (!RepositoryImports[file]) RepositoryImports[file] = []

				{
					const entity = `${model.ClassName}Repository`
					if (!RepositoryImports[file].includes(entity)) RepositoryImports[file].push(entity)
				}
			}

			{
				const file = `../models`
				if (!RepositoryImports[file]) RepositoryImports[file] = []

				// if (model.ReadOnly == false) {
				// 	const entity = `I${model.ClassName}Entity`
				// 	if (!RepositoryImports[file].includes(entity)) RepositoryImports[file].push(entity)
				// }

				{
					const entity = `I${model.ClassName}Key`
					if (!RepositoryImports[file].includes(entity)) RepositoryImports[file].push(entity)
				}

				{
					const entity = `I${model.ClassName}Model`
					if (!RepositoryImports[file].includes(entity)) RepositoryImports[file].push(entity)
				}

				{
					const entity = `I${model.ClassName}Query`
					if (!RepositoryImports[file].includes(entity)) RepositoryImports[file].push(entity)
				}

				if (model.ReadOnly == false) {
					const entity = `I${model.ClassName}Value`
					if (!RepositoryImports[file].includes(entity)) RepositoryImports[file].push(entity)
				}
			}

			RepositoryImports = Sort.RecordArrayByKey<string>(RepositoryImports)

			const Imports = ejs.render(importsTemplate, { UiImports: RepositoryImports })

			const rendered: string = ejs.render(servicesTemplate, { Model: model, Imports }).trim()
			fs.writeFileSync(path.join(servicesDir, `${model.FileName}.service.ts`), rendered, 'utf8')
		}

		const barril: string = classes.length === 0
			? `export { }`
			: classes.map(m => `export * from './${m.FileName}.service'`).join('\n')

		fs.writeFileSync(path.join(servicesDir, `index.ts`), barril, 'utf8')
	}

	private async generateControllers(moduleDir: string, module: ModuleModel) {
		const controllersDir = path.join(moduleDir, 'controllers')
		if (!fs.existsSync(controllersDir)) await mkdir(controllersDir, { recursive: true })

		for await (const classModel of module.Classes) await this.generateController(controllersDir, module, classModel)

		const barril: string = module.Classes.length == 0
			? 'export { }'
			: module.Classes.map(m => `export * from './${m.FileName}.controller'`).join('\n')

		fs.writeFileSync(path.join(controllersDir, `index.ts`), barril, 'utf8')
	}

	private async generateController(controllersDir: string, module: ModuleModel, model: ClassModel) {
		let ControllersImports: Record<string, string[]> = {}

		{	//	Current model
			{
				const file = `@nestjs/common`
				if (!ControllersImports[file]) ControllersImports[file] = [
					'Controller',
					'Get',
					'Param',
					'Query',
				]
			}

			if (!model.ReadOnly) {
				const file = `@nestjs/common`
				if (!ControllersImports[file]) ControllersImports[file] = []

				if (model.Type === 'entity') {
					const entity = `Body`
					if (!ControllersImports[file].includes(entity)) ControllersImports[file].push(entity)
					ControllersImports[file] = ControllersImports[file]
				}

				{
					const entity = `Delete`
					if (!ControllersImports[file].includes(entity)) ControllersImports[file].push(entity)
					ControllersImports[file] = ControllersImports[file]
				}

				if (model.Type === 'entity') {
					const entity = `Patch`
					if (!ControllersImports[file].includes(entity)) ControllersImports[file].push(entity)
					ControllersImports[file] = ControllersImports[file]
				}

				{
					const entity = `Post`
					if (!ControllersImports[file].includes(entity)) ControllersImports[file].push(entity)
					ControllersImports[file] = ControllersImports[file]
				}
			}

			{
				const file = `@nestjs/swagger`
				if (!ControllersImports[file]) ControllersImports[file] = [
					'ApiTags',
					'ApiParam'
				]
			}

			{
				const file = `@packages/${model.Module.FileName}/ui`
				if (!ControllersImports[file]) ControllersImports[file] = [
					`I${model.ClassName}Response`
				]
			}

			{
				const file = `../services`
				if (!ControllersImports[file]) ControllersImports[file] = [
					`${model.ClassName}Service`
				]
			}

			{
				const file = `../../shared`
				if (!ControllersImports[file]) ControllersImports[file] = [
					`Serialize`
				]
			}

			const file = `../classes`
			if (!ControllersImports[file]) ControllersImports[file] = []

			if (!model.ReadOnly && model.Type === 'entity') {
				const entity = `${model.ClassName}Body`
				if (!ControllersImports[file].includes(entity)) ControllersImports[file].push(entity)
				ControllersImports[file] = ControllersImports[file]
			}

			{	//	Query
				const entity = `${model.ClassName}Query`
				if (!ControllersImports[file].includes(entity)) ControllersImports[file].push(entity)
				ControllersImports[file] = ControllersImports[file]
			}

			{	//	Params
				const entity = `${model.ClassName}Params`
				if (!ControllersImports[file].includes(entity)) ControllersImports[file].push(entity)
				ControllersImports[file] = ControllersImports[file]
			}

			{	//	Query
				const entity = `${model.ClassName}Response`
				if (!ControllersImports[file].includes(entity)) ControllersImports[file].push(entity)
				ControllersImports[file] = ControllersImports[file]
			}
		}

		ControllersImports = Sort.RecordArrayByKey<string>(ControllersImports)

		const Imports = ejs.render(importsTemplate, { UiImports: ControllersImports })

		const Get: string = ejs.render(controllersGetTemplate, { Model: model }).trim()
		const Find: string = ejs.render(controllersFindTemplate, { Model: model }).trim()
		const Post: string = ejs.render(controllersPostTemplate, { Model: model }).trim()
		const Patch: string = ejs.render(controllersPatchTemplate, { Model: model }).trim()
		const Remove: string = ejs.render(controllersRemoveTemplate, { Model: model }).trim()
		const Controllers: string = ejs.render(controllersTemplate, { Model: model, Imports, Get, Find, Post, Patch, Remove }).trim()

		fs.writeFileSync(path.join(controllersDir, `${model.FileName}.controller.ts`), Controllers, 'utf8')
	}
}