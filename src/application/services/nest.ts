import fs from 'fs'
import { mkdir } from 'fs/promises'
import path from 'path'
import { inject, injectable } from 'tsyringe'
import { IProjectType } from '../../cli'
import { TOKENS } from '../../tokens'
import { INestService, INestSrcService } from '../contracts'
import { Sort } from '../helpers'
import { ModuleModel } from '../models'

@injectable()
export class NestService implements INestService {

	constructor(
		@inject(TOKENS.Project) private readonly project: IProjectType,
		@inject(TOKENS.NestSrcService) private readonly nestSrcService: INestSrcService,
	) { }

	public async Generate(projectId: string, modules: ModuleModel[]): Promise<void> {
		const outputDir = path.join(import.meta.dirname, '../', '../', '../', 'output', this.project.path, 'apps', 'backend')
		if (!fs.existsSync(outputDir)) await mkdir(outputDir, { recursive: true })

		await this.generateNestCli(outputDir)
		await this.generatePackageJson(outputDir, modules)
		await this.generateTsconfig(outputDir)
		await this.generateTsconfigBuild(outputDir)

		await this.nestSrcService.Generate(projectId, modules)
	}

	private async generateNestCli(outputDir: string) {
		const content =
		{
			"$schema": "https://json.schemastore.org/nest-cli",
			"collection": "@nestjs/schematics",
			"sourceRoot": "src",
			"compilerOptions": {
				"deleteOutDir": true,
				"watchAssets": false,
				"assets": [] as string[],
				"plugins": [
					{
						"name": "@nestjs/swagger",
						"options": {
							"classValidatorShim": true,
							"introspectComments": true,
							"dtoKeyOfComment": "description"
						}
					}
				]
			},
			"generateOptions": {
				"flat": true,
				"spec": {
					"app": false,
					"application": false,
					"cl": false,
					"class": false,
					"co": false,
					"config": false,
					"configuration": false,
					"controller": false,
					"d": false,
					"decorator": false,
					"f": false,
					"filter": false,
					"ga": false,
					"gateway": false,
					"gu": false,
					"guard": false,
					"in": false,
					"interceptor": false,
					"interface": false,
					"lib": false,
					"library": false,
					"mi": false,
					"middleware": false,
					"mo": false,
					"module": false,
					"pi": false,
					"pipe": false,
					"pr": false,
					"provider": false,
					"r": false,
					"res": false,
					"resolver": false,
					"resource": false,
					"s": false,
					"service": false,
					"sub-app": false
				}
			}
		}

		const rendered: string = JSON.stringify(content, null, '\t').trim()

		fs.writeFileSync(path.join(outputDir, `nest-cli.json`), rendered, 'utf8')
	}

	private async generatePackageJson(outputDir: string, modules: ModuleModel[]) {

		let dependencies: Record<string, string> = {
			"@nestjs/common": "^11.1.28",
			"@nestjs/config": "^4.0.4",
			"@nestjs/core": "^11.1.28",
			"@nestjs/event-emitter": "^3.1.0",
			"@nestjs/jwt": "^11.0.2",
			"@nestjs/mapped-types": "^2.1.1",
			"@nestjs/platform-express": "^11.1.28",
			"@nestjs/platform-socket.io": "^11.1.28",
			"@nestjs/schedule": "^6.1.3",
			"@nestjs/swagger": "^11.4.6",
			"@nestjs/typeorm": "^11.0.3",
			"@nestjs/websockets": "^11.1.28",
			"bcryptjs": "^3.0.3",
			"class-transformer": "^0.5.1",
			"class-validator": "^0.15.1",
			"dotenv": "^17.4.2",
			"multer": "^2.2.0",
			"passport": "^0.7.0",
			"passport-jwt": "^4.0.1",
			"pg": "^8.23.0",
			"reflect-metadata": "^0.2.2",
			"rxjs": "^7.8.2",
			"socket.io": "^4.8.3",
			"swagger-ui-express": "^5.0.1",
			"typeorm": "^1.1.0"
		}

		modules.forEach(module => { dependencies[`@packages/${module.FileName}`] = "workspace:*" })
		dependencies = Sort.RecordByKey<string>(dependencies)

		const devDependencies: Record<string, string> = {
			"@nestjs/cli": "^11.0.24",
			"@nestjs/passport": "^11.0.5",
			"@nestjs/schematics": "^11.1.0",
			"@types/express": "^5.0.6",
			"@types/multer": "^2.2.0",
			"@types/passport-jwt": "^4.0.1",
			"source-map-support": "^0.5.21",
			"ts-loader": "^9.6.2",
			"ts-node": "^10.9.2",
			"tsconfig-paths": "^4.2.0"
		}

		let content =
		{
			"name": "@apps/backend",
			"version": this.project.version,
			"description": this.project.description,
			"author": this.project.author,
			"private": true,
			"license": "UNLICENSED",
			"scripts": {
				"build": "nest build",
				"clean": "tsc -b --clean && rm -rf node_modules && rm -rf dist",
				"debug": "nest start --debug --watch --preserveWatchOutput",
				"dev": "nest start --watch --preserveWatchOutput",
				"prod": "node dist/main",
				"start": "nest start",
				"typecheck": "tsc --noEmit"
			},
			"dependencies": dependencies,
			"devDependencies": devDependencies
		}

		const rendered: string = JSON.stringify(content, null, '\t').trim()

		fs.writeFileSync(path.join(outputDir, `package.json`), rendered, 'utf8')
	}

	private async generateTsconfigBuild(outputDir: string) {
		let content =
		{
			"extends": "./tsconfig.json",
			"exclude": [
				"node_modules",
				"test",
				"dist",
				"**/*spec.ts"
			]
		}

		const rendered: string = JSON.stringify(content, null, '\t').trim()

		fs.writeFileSync(path.join(outputDir, `tsconfig.build.json`), rendered, 'utf8')
	}

	private async generateTsconfig(outputDir: string) {
		let content =
		{
			"compilerOptions": {
				"lib": ["ES2022"],
				"module": "nodenext",
				"skipLibCheck": true,
				"target": "ES2022",
				"types": ["node"],
				"allowSyntheticDefaultImports": true,
				"declaration": true,
				"incremental": true,
				"tsBuildInfoFile": "./dist/.tsbuildinfo",
				"moduleResolution": "nodenext",
				"verbatimModuleSyntax": false,
				"noFallthroughCasesInSwitch": true,
				"emitDecoratorMetadata": true,
				"esModuleInterop": true,
				"experimentalDecorators": true,
				"forceConsistentCasingInFileNames": true,
				"isolatedModules": false,
				"noImplicitAny": true,
				"outDir": "./dist",
				"removeComments": true,
				"resolvePackageJsonExports": true,
				"rootDir": "./src",
				"sourceMap": true,
				"strict": true,
				"strictBindCallApply": true,
				"strictNullChecks": false
			},
			"include": ["src/**/*"],
			"watchOptions": {
				"watchFile": "useFsEvents",
				"watchDirectory": "useFsEvents",
				"fallbackPolling": "dynamicPriority",
				"excludeDirectories": ["**/node_modules", "dist", "text"],
				"excludeFiles": ["**/*.spec.ts"]
			}
		}

		const rendered: string = JSON.stringify(content, null, '\t').trim()

		fs.writeFileSync(path.join(outputDir, `tsconfig.json`), rendered, 'utf8')
	}
}