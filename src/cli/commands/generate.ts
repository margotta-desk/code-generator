import { BackendService } from './../../application/services/backend'
import fs from 'fs'
import { mkdir, rm } from 'node:fs/promises'
import path from 'path'
import { container } from 'tsyringe'
import { CommandModule } from 'yargs'
import { IBackendService, IMetadataLoaderService, IMonorepoService, INestService, IPackagesService, ModuleModel } from '../../application'
import { destroyContainer, registerContainer } from '../../container'
import { TOKENS } from '../../tokens'
import { showSpinner } from '../render'
import { IProjectType } from '../types'

interface ArgsOptions {
	project?: string
	verbose?: boolean
}

export const generateCommand: CommandModule<{}, ArgsOptions> = {
	command: 'generate [project]',
	describe: 'Genera código a partir de la metadata de la BD',
	builder: (yargs) =>
		yargs
			.positional('project', { type: 'string', describe: 'Proyecto a generar' })
			.option('verbose', { type: 'boolean', alias: 'v', describe: 'Salida detallada' }),
	handler: async (argv) => {
		const spinner = showSpinner('Cargando proyecto...')

		try {
			const args = argv as unknown as ArgsOptions

			const configPath = path.join(import.meta.dirname, '..', '..', '..', 'projects')

			const projectPath = path.join(configPath, `projects.json`)
			//const configPath = path.join(os.homedir(), '.codegen')

			if (!fs.existsSync(configPath))
				await mkdir(configPath, { recursive: true })

			if (!fs.existsSync(projectPath))
				throw new Error(`No se ha encontrado el archivo de proyectos`)

			if (!args.project)
				throw new Error('No se ha especificado el proyecto')

			const config: string = fs.readFileSync(projectPath, { encoding: 'utf-8' })
			const projects: Record<string, IProjectType> = JSON.parse(config)

			if (!projects[args.project])
				throw new Error(`No se ha encontrado el proyecto ${args.project}`)

			const project: IProjectType = projects[args.project]

			container.register(TOKENS.Project, { useValue: project })

			spinner.succeed('Proyecto cargado exitósamente')

			spinner.start('Estableciendo conexión con la base de datos...')

			await registerContainer(project.connection)

			const loader = container.resolve<IMetadataLoaderService>(TOKENS.MetadataLoaderService)

			project.schemas = await loader.ValidateSchemas(project.schemas)
			projects[args.project] = project

			fs.writeFileSync(projectPath, JSON.stringify(projects, null, '\t'), 'utf-8')

			spinner.succeed('Conexión establecida exitosamente')

			spinner.start('Cargando metadata...')

			const modules: ModuleModel[] = await loader.Load()

			spinner.succeed('Metadata cargada exitósamente')

			{	//	Limpieza de directorio destino
				const outputPath = path.join(import.meta.dirname, '../', '../', '../', 'output', project.path)
				if (fs.existsSync(outputPath)) await rm(outputPath, { recursive: true, force: true })
			}

			spinner.start('Generando monorepo...')

			const monorepoService = container.resolve<IMonorepoService>(TOKENS.MonorepoService)

			await monorepoService.Generate(args.project, modules)

			spinner.succeed('Monorepo generado exitósamente')

			if (project.layers.packages) {
				spinner.start('Generando packages...')

				const packagesService = container.resolve<IPackagesService>(TOKENS.PackagesService)

				await packagesService.Generate(args.project, modules)

				spinner.succeed('Packages generado exitósamente')
			}


			if (project.layers.backend == 'nest') {
				spinner.start('Generando backend NestJS...')

				const backendService = container.resolve<IBackendService>(TOKENS.BackendService)
				const nestService = container.resolve<INestService>(TOKENS.NestService)

				await backendService.Generate(args.project, modules)
				await nestService.Generate(args.project, modules)

				spinner.succeed('Backend NestJS generado exitósamente')
			}

		} catch (err) {
			const message = err instanceof Error ? err.message : String(err)
			spinner.fail(message)
			process.exitCode = 1
		}
		finally {
			spinner.stop()
			await destroyContainer()
		}
	}
}