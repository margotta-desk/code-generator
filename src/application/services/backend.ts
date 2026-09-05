import ejs from 'ejs'
import fs from 'fs'
import { mkdir } from 'fs/promises'
import path from 'path'
import { inject, injectable } from 'tsyringe'
import { IProjectType } from '../../cli'
import { TOKENS } from '../../tokens'
import { IBackendService } from '../contracts'
import { Sort } from '../helpers'
import { ClassModel, ModuleModel } from '../models'

const dotenvTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/backend/dotenv.ejs'), 'utf8')
const eventsTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/backend/events.ejs'), 'utf8')
const infrastructuresTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/backend/infrastructures.ejs'), 'utf8')
const modelsTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/backend/models.ejs'), 'utf8')
const importsTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/imports.ejs'), 'utf8')

@injectable()
export class BackendService implements IBackendService {

	constructor(@inject(TOKENS.Project) private readonly project: IProjectType) { }

	public async Generate(projectId: string, modules: ModuleModel[]): Promise<void> {
		const outputDir = path.join(import.meta.dirname, '../', '../', '../', 'output', this.project.path, 'apps', 'backend')
		if (!fs.existsSync(outputDir)) await mkdir(outputDir, { recursive: true })

		await this.generateDotEnv(outputDir)

		for await (const module of modules) {
			const moduleDir = path.join(outputDir, 'src', 'modules', module.FileName)
			if (!fs.existsSync(moduleDir)) await mkdir(moduleDir, { recursive: true })

			await this.generateEvents(moduleDir, module)
			await this.generateModels(projectId, moduleDir, module)
			await this.generateInfrastructures(moduleDir, module)
		}
	}

	private async generateDotEnv(outputDir: string) {
		const rendered: string = ejs.render(dotenvTemplate, {}).trim()
		fs.writeFileSync(path.join(outputDir, `.env.example`), rendered, 'utf8')
	}

	private async generateEvents(outputDir: string, module: ModuleModel) {
		const eventsDir = path.join(outputDir, 'events')
		if (!fs.existsSync(eventsDir)) await mkdir(eventsDir, { recursive: true })

		const classes: Array<ClassModel> = module.Classes.filter(f => f.ReadOnly === false)

		for await (const model of classes) {
			const rendered: string = ejs.render(eventsTemplate, { Model: model }).trim()
			fs.writeFileSync(path.join(eventsDir, `${model.FileName}.events.ts`), rendered, 'utf8')
		}

		const barril: string = classes.length === 0 ? `export { }` : classes.map(m => `export * from './${m.FileName}.events'`).join('\n')

		fs.writeFileSync(path.join(eventsDir, `index.ts`), barril, 'utf8')
	}

	private async generateModels(projectId: string, outputDir: string, module: ModuleModel) {
		const modelsDir = path.join(outputDir, 'models')
		if (!fs.existsSync(modelsDir)) await mkdir(modelsDir, { recursive: true })

		const classes: Array<ClassModel> = module.Classes

		for await (const model of classes) {
			let UiImports: Record<string, string[]> = {
				"@nestjs/swagger": ["ApiProperty"],
				"class-transform": ["Expose"],
			};

			([
				// ...model.ManyToOneReversed.map(m => m.Referenced), 
				// ...model.OneToOneReversed.map(m => m.Referenced),
				...model.ManyToOne.map(m => m.Class),
				...model.OneToOne.map(m => m.Class),
			]).filter(f => f != model).forEach((reference: ClassModel) => {
				const file = (reference.Module == module)
					? `./${reference.FileName}.model`
					: `../../${reference.Module.FileName}`

				{
					const entity = `I${reference.ClassName}Model`

					if (!UiImports[file]) UiImports[file] = []
					if (!UiImports[file].includes(entity)) UiImports[file].push(entity)
				}
				{
					const entity = `I${reference.ClassName}Value`

					if (!UiImports[file]) UiImports[file] = []
					if (!UiImports[file].includes(entity)) UiImports[file].push(entity)
				}
			})

			UiImports = Sort.RecordArrayByKey<string>(UiImports)

			const Imports = ejs.render(importsTemplate, { UiImports })

			const rendered: string = ejs.render(modelsTemplate, { Model: model, Imports }).trim()
			fs.writeFileSync(path.join(modelsDir, `${model.FileName}.model.ts`), rendered, 'utf8')
		}

		const barril: string = classes.length === 0 ? `export { }` : classes.map(m => `export * from './${m.FileName}.model'`).join('\n')

		fs.writeFileSync(path.join(modelsDir, `index.ts`), barril, 'utf8')
	}

	private async generateInfrastructures(outputDir: string, module: ModuleModel) {
		const infrastructuresDir = path.join(outputDir, 'infrastructure')
		if (!fs.existsSync(infrastructuresDir)) await mkdir(infrastructuresDir, { recursive: true })

		const classes: Array<ClassModel> = module.Classes

		for await (const model of classes) {
			let UiImports: Record<string, string[]> = {
				[`typeorm`]: [`Entity`],
				[`../models`]: [`I${model.ClassName}Model`],
			}

			{
				if (model.Values.length !== 0) {
					const file = `typeorm`
					const entity = `Column`

					if (!UiImports[file]) UiImports[file] = []
					if (!UiImports[file].includes(entity)) UiImports[file].push(entity)
				}

				if (model.Key) {
					const file = `typeorm`
					if (model.Key.Properties.some(s => s.ColumnDefault !== null)) {
						const entity = `PrimaryGeneratedColumn`

						if (!UiImports[file]) UiImports[file] = []
						if (!UiImports[file].includes(entity)) UiImports[file].push(entity)
					}

					if (model.Key.Properties.some(s => s.ColumnDefault === null)) {
						const entity = `PrimaryColumn`

						if (!UiImports[file]) UiImports[file] = []
						if (!UiImports[file].includes(entity)) UiImports[file].push(entity)
					}
				}

				if (model.ManyToOne.length !== 0) {
					{
						const file = `typeorm`

						{
							const entity = `ManyToOne`
							if (!UiImports[file]) UiImports[file] = []
							if (!UiImports[file].includes(entity)) UiImports[file].push(entity)
						}
						{
							const entity = `JoinColumn`
							if (!UiImports[file]) UiImports[file] = []
							if (!UiImports[file].includes(entity)) UiImports[file].push(entity)
						}
					}

					for await (const manyToOne of model.ManyToOne) {
						const file = (manyToOne.Class.Module == module)
							? `./${manyToOne.Class.FileName}.infrastructure`
							: `../../${manyToOne.Class.Module.FileName}`

						{
							const entity = `${manyToOne.Class.ClassName}Model`
							if (!UiImports[file]) UiImports[file] = []
							if (!UiImports[file].includes(entity)) UiImports[file].push(entity)
						}
					}
				}

				// if (model.ManyToOneReversed.length !== 0) {
				// 	{
				// 		const file = `typeorm`

				// 		{
				// 			const entity = `OneToMany`
				// 			if (!UiImports[file]) UiImports[file] = []
				// 			if (!UiImports[file].includes(entity)) UiImports[file].push(entity)
				// 		}
				// 	}

				// 	for await (const manyToOne of model.ManyToOneReversed) {
				// 		const file = (manyToOne.Referenced.Module == module)
				// 			? `./${manyToOne.Referenced.FileName}.infrastructure`
				// 			: `../../${manyToOne.Referenced.Module.FileName}`

				// 		{
				// 			const entity = `${manyToOne.Referenced.ClassName}Model`
				// 			if (!UiImports[file]) UiImports[file] = []
				// 			if (!UiImports[file].includes(entity)) UiImports[file].push(entity)
				// 		}
				// 	}
				// }

				if (model.OneToOne.length !== 0) {
					{
						const file = `typeorm`

						{
							const entity = `OneToOne`
							if (!UiImports[file]) UiImports[file] = []
							if (!UiImports[file].includes(entity)) UiImports[file].push(entity)
						}
						{
							const entity = `JoinColumn`
							if (!UiImports[file]) UiImports[file] = []
							if (!UiImports[file].includes(entity)) UiImports[file].push(entity)
						}
					}

					for await (const oneToOne of model.OneToOne.filter(f => f.Class !== model)) {
						const file = (oneToOne.Class.Module == module)
							? `./${oneToOne.Class.FileName}.infrastructure`
							: `../../${oneToOne.Class.Module.FileName}`

						{
							const entity = `${oneToOne.Class.ClassName}Model`
							if (!UiImports[file]) UiImports[file] = []
							if (!UiImports[file].includes(entity)) UiImports[file].push(entity)
						}
					}
				}

				// if (model.OneToOneReversed.length !== 0) {
				// 	{
				// 		const file = `typeorm`

				// 		{
				// 			const entity = `OneToOne`
				// 			if (!UiImports[file]) UiImports[file] = []
				// 			if (!UiImports[file].includes(entity)) UiImports[file].push(entity)
				// 		}
				// 	}

				// 	for await (const oneToOne of model.OneToOneReversed.filter(f => f.Referenced !== model)) {
				// 		const file = (oneToOne.Referenced.Module == module)
				// 			? `./${oneToOne.Referenced.FileName}.infrastructure`
				// 			: `../../${oneToOne.Referenced.Module.FileName}`

				// 		{
				// 			const entity = `${oneToOne.Referenced.ClassName}Model`
				// 			if (!UiImports[file]) UiImports[file] = []
				// 			if (!UiImports[file].includes(entity)) UiImports[file].push(entity)
				// 		}
				// 	}
				// }
			}

			([
				// ...model.ManyToOneReversed.map(m => m.Referenced), 
				// ...model.OneToOneReversed.map(m => m.Referenced),
				...model.ManyToOne.map(m => m.Class), 
				...model.OneToOne.map(m => m.Class), 
			]).filter(f => f !== model).forEach((reference: ClassModel) => {
				const file = (reference.Module == module) ? `../models` : `../../${reference.Module.FileName}`
				const entity = `I${reference.ClassName}Model`

				if (!UiImports[file]) UiImports[file] = []
				if (!UiImports[file].includes(entity)) UiImports[file].push(entity)
			})

			UiImports = Sort.RecordArrayByKey<string>(UiImports)

			const Imports = ejs.render(importsTemplate, { UiImports })


			const rendered: string = ejs.render(infrastructuresTemplate, { Model: model, Imports }).trim()
			fs.writeFileSync(path.join(infrastructuresDir, `${model.FileName}.infrastructure.ts`), rendered, 'utf8')
		}

		const barril: string = classes.length === 0 ? `export { }` : classes.map(m => `export * from './${m.FileName}.infrastructure'`).join('\n')

		fs.writeFileSync(path.join(infrastructuresDir, `index.ts`), barril, 'utf8')
	}
}