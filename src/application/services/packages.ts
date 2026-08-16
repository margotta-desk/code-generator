import fs from 'fs'
import { mkdir } from 'fs/promises'
import path from 'path'
import { inject, injectable } from 'tsyringe'
import { IProjectType } from '../../cli'
import { TOKENS } from '../../tokens'
import { IPackagesService } from '../contracts'
import { ClassModel, DependencyModel, ModuleModel } from '../models'
import ejs from 'ejs'
import { Sort } from '../helpers'

const enumsTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/packages/enums.ejs'), 'utf8')
const eventsTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/packages/events.ejs'), 'utf8')
const uisTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/packages/uis.ejs'), 'utf8')
const uisBodyTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/packages/uis-body.ejs'), 'utf8')
const uisParamsTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/packages/uis-params.ejs'), 'utf8')
const uisQueryTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/packages/uis-query.ejs'), 'utf8')
const uisResponseTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/packages/uis-response.ejs'), 'utf8')
const importsTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/imports.ejs'), 'utf8')

@injectable()
export class PackagesService implements IPackagesService {

	constructor(@inject(TOKENS.Project) private readonly project: IProjectType) { }

	public async Generate(_projectId: string, modules: ModuleModel[]): Promise<void> {
		const outputPath = path.join(import.meta.dirname, '../', '../', '../', 'output', this.project.path, 'packages')
		if (!fs.existsSync(outputPath)) await mkdir(outputPath, { recursive: true })

		await this.generateTsconfig(outputPath)
		await this.generateTsconfigCjs(outputPath)
		await this.generateTsconfigEsm(outputPath)

		for await (const module of modules) {
			const modulePath: string = path.join(outputPath, module.FileName)
			if (!fs.existsSync(modulePath)) await mkdir(modulePath, { recursive: true })

			await this.generateModulePackageJson(modulePath, module)
			await this.generateModuleTsconfig(modulePath, module)
			await this.generateModuleTsconfigCjs(modulePath, module)
			await this.generateModuleTsconfigEsm(modulePath, module)
			await this.generateModuleEnums(modulePath, module)
			await this.generateModuleEvents(modulePath, module)
			await this.generateModuleUIs(modulePath, module)
		}
	}

	private async generateTsconfig(outputPath: string) {
		let content =
		{
			"compilerOptions": {
				"allowSyntheticDefaultImports": true,
				"composite": true,
				"declaration": true,
				"declarationMap": true,
				"emitDecoratorMetadata": true,
				"esModuleInterop": true,
				"experimentalDecorators": true,
				"forceConsistentCasingInFileNames": true,
				"isolatedModules": true,
				"lib": [
					"ES2022",
					"DOM"
				],
				"noFallthroughCasesInSwitch": true,
				"noImplicitAny": true,
				"removeComments": false,
				"resolvePackageJsonExports": true,
				"noEmitOnError": false,
				"skipLibCheck": true,
				"sourceMap": true,
				"strict": true,
				"strictBindCallApply": true,
				"strictNullChecks": false,
				"target": "ES2022"
			}
		}

		const rendered: string = JSON.stringify(content, null, '\t').trim()

		fs.writeFileSync(path.join(outputPath, `tsconfig.json`), rendered, 'utf8')
	}

	private async generateTsconfigCjs(outputPath: string) {
		let content =
		{
			"extends": "./tsconfig.json",
			"compilerOptions": {
				"module": "NodeNext",
				"moduleResolution": "NodeNext"
			}
		}

		const rendered: string = JSON.stringify(content, null, '\t').trim()

		fs.writeFileSync(path.join(outputPath, `tsconfig.cjs.json`), rendered, 'utf8')
	}

	private async generateTsconfigEsm(outputPath: string) {
		let content =
		{
			"extends": "./tsconfig.json",
			"compilerOptions": {
				"module": "ESNext",
				"moduleResolution": "Bundler"
			}
		}

		const rendered: string = JSON.stringify(content, null, '\t').trim()

		fs.writeFileSync(path.join(outputPath, `tsconfig.esm.json`), rendered, 'utf8')
	}

	private async generateModulePackageJson(modulePath: string, module: ModuleModel) {
		// const references: ModuleModel[] = await module.getReferences()
		const references: string[] = module.References.map(m => m.FileName).sort((a, b) => a < b ? 1 : -1)
		const dependencies = Object.fromEntries(references.map(name => [`@packages/${name}`, `workspace:*`]))


		let content =
		{
			"name": `@packages/${module.FileName}`,
			"version": this.project.version,
			"description": this.project.description,
			"license": "UNLICENSED",
			"author": this.project.author,
			"sideEffects": false,
			"exports": {
				"./enums": {
					"import": {
						"types": "./dist/esm/enums/index.d.ts",
						"default": "./dist/esm/enums/index.js"
					},
					"require": {
						"types": "./dist/cjs/enums/index.d.ts",
						"default": "./dist/cjs/enums/index.js"
					}
				},
				"./events": {
					"import": {
						"types": "./dist/esm/events/index.d.ts",
						"default": "./dist/esm/events/index.js"
					},
					"require": {
						"types": "./dist/cjs/events/index.d.ts",
						"default": "./dist/cjs/events/index.js"
					}
				},
				"./ui": {
					"import": {
						"types": "./dist/esm/ui/index.d.ts",
						"default": "./dist/esm/ui/index.js"
					},
					"require": {
						"types": "./dist/cjs/ui/index.d.ts",
						"default": "./dist/cjs/ui/index.js"
					}
				}
			},
			"files": [
				"dist",
				"src"
			],
			"scripts": {
				"build": "tsc -b && node ../../postbuild.mjs",
				"clean": "tsc -b --clean && rm -rf node_modules && rm -rf dist",
				"dev": "node ../../postbuild.mjs && tsc -b --watch --preserveWatchOutput",
				"packages": "node ../../postbuild.mjs && tsc -b --watch --preserveWatchOutput",
				"typecheck": "tsc --noEmit"
			},
			"dependencies": dependencies
		}

		const rendered = JSON.stringify(content, null, '\t').trim()

		fs.writeFileSync(path.join(modulePath, "package.json"), rendered, 'utf-8')
	}

	private async generateModuleTsconfig(modulePath: string, module: ModuleModel) {
		let content =
		{
			"files": [] as string[],
			"references": [
				{
					"path": "./tsconfig.cjs.json"
				},
				{
					"path": "./tsconfig.esm.json"
				}
			]
		}

		const rendered = JSON.stringify(content, null, '\t').trim()

		fs.writeFileSync(path.join(modulePath, "tsconfig.json"), rendered, 'utf-8')
	}

	private async generateModuleTsconfigCjs(modulePath: string, module: ModuleModel) {
		let content =
		{
			"extends": "../tsconfig.cjs.json",
			"compilerOptions": {
				"rootDir": "./src",
				"outDir": "./dist/cjs",
				"tsBuildInfoFile": "./dist/cjs/.tsbuildinfo"
			},
			"include": [
				"src/**/*"
			],
			"exclude": [
				"node_modules",
				"dist"
			]
		}

		const rendered = JSON.stringify(content, null, '\t').trim()

		fs.writeFileSync(path.join(modulePath, "tsconfig.cjs.json"), rendered, 'utf-8')
	}

	private async generateModuleTsconfigEsm(modulePath: string, module: ModuleModel) {
		let content =
		{
			"extends": "../tsconfig.esm.json",
			"compilerOptions": {
				"rootDir": "./src",
				"outDir": "./dist/esm",
				"tsBuildInfoFile": "./dist/esm/.tsbuildinfo"
			},
			"include": [
				"src/**/*"
			],
			"exclude": [
				"node_modules",
				"dist"
			]
		}

		const rendered = JSON.stringify(content, null, '\t').trim()

		fs.writeFileSync(path.join(modulePath, "tsconfig.esm.json"), rendered, 'utf-8')
	}

	private async generateModuleEnums(modulePath: string, module: ModuleModel) {
		const outputDir = path.join(modulePath, 'src', 'enums')

		if (!fs.existsSync(outputDir))
			await mkdir(outputDir, { recursive: true })

		const classes: ClassModel[] = module.Classes.filter(f => f.ReadOnly === true && f.Type == 'entity')

		for await (const model of classes) {
			const rendered: string = ejs.render(enumsTemplate, { Model: model }).trim()

			fs.writeFileSync(path.join(outputDir, `${model.FileName}.enum.ts`), rendered, 'utf8')
		}

		const barril: string = classes.length === 0 ? "export { }" : classes.map(m => `export * from './${m.FileName}.enum'`).join('\n')

		fs.writeFileSync(path.join(outputDir, `index.ts`), barril, 'utf8')
	}

	private async generateModuleEvents(modulePath: string, module: ModuleModel) {
		const outputDir = path.join(modulePath, 'src', 'events')

		if (!fs.existsSync(outputDir))
			await mkdir(outputDir, { recursive: true })

		const classes: ClassModel[] = module.Classes.filter(f => false)//.filter(f => f.ReadOnly === false && f.Type == 'entity')

		for await (const model of classes) {
			const rendered: string = ejs.render(eventsTemplate, { Model: model }).trim()

			fs.writeFileSync(path.join(outputDir, `${model.FileName}.event.ts`), rendered, 'utf8')
		}

		const barril: string = classes.length === 0 ? "export { }" : classes.map(m => `export * from './${m.FileName}.event'`).join('\n')

		fs.writeFileSync(path.join(outputDir, `index.ts`), barril, 'utf8')
	}

	private async generateModuleUIs(modulePath: string, module: ModuleModel) {
		const outputDir = path.join(modulePath, 'src', 'ui')

		if (!fs.existsSync(outputDir))
			await mkdir(outputDir, { recursive: true })

		const classes: ClassModel[] = module.Classes//.filter(f => f.ReadOnly === false)

		for await (const model of classes) {

			let UiImports: Record<string, string[]> = {};

			([...model.ManyToOne, ...model.OneToOne]).filter(f => f.Class !== model).forEach((dependency: DependencyModel) => {
				const file = (dependency.Class.Module == module) ? `./${dependency.Class.FileName}` : `@packages/${dependency.Class.Module.FileName}/ui`
				const entity = `I${dependency.Class.ClassName}Response`

				if (!UiImports[file]) UiImports[file] = []
				if (!UiImports[file].includes(entity)) UiImports[file].push(entity)
			})

			UiImports = Sort.RecordArrayByKey<string>(UiImports)

			const Imports = ejs.render(importsTemplate, { UiImports })
			const Body: string | null = model.ReadOnly == false && model.Type == 'entity' ? ejs.render(uisBodyTemplate, { Model: model }).trim() : null
			const Params: string = ejs.render(uisParamsTemplate, { Model: model }).trim()
			const Query: string = ejs.render(uisQueryTemplate, { Model: model }).trim()
			const Response: string = ejs.render(uisResponseTemplate, { Model: model }).trim()
			const Rendered: string = ejs.render(uisTemplate, { Model: model, Imports, Body, Params, Query, Response }).trim()

			fs.writeFileSync(path.join(outputDir, `${model.FileName}.ts`), Rendered, 'utf8')
		}

		const barril: string = classes.length === 0 ? "export { }" : classes.map(m => `export * from './${m.FileName}'`).join('\n')

		fs.writeFileSync(path.join(outputDir, `index.ts`), barril, 'utf8')
	}
}