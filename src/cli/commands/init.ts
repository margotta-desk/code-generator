import type { CommandModule } from 'yargs'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { showSpinner } from '../render'
import type { IProjectType } from '../types'

interface InitArgs {
	output?: string
	force?: boolean
}

export const initCommand: CommandModule<{}, InitArgs> = {
	command: 'init [output]',
	describe: 'Crea el archivo de configuración del proyecto',
	builder: (yargs) =>
		yargs
			.positional('output', {
				type: 'string',
				default: 'codegen.config.json',
				describe: 'Ruta del archivo de configuración a crear'
			})
			.option('force', {
				type: 'boolean',
				alias: 'f',
				default: false,
				describe: 'Sobrescribir si el archivo ya existe'
			}),
	handler: async (args) => {
		const target = path.resolve(args.output ?? 'codegen.config.json')

		// (Opcional) prompts interactivos para recoger los datos
		const project: IProjectType = {
			name: 'MiProyecto',
			description: 'Proyecto generado',
			path: './src/',
			version: '1.0.0',
			author: {
				name: 'Tu Nombre',
				email: 'tu@email.com',
				url: 'https://tusitio.cl'
			},
			connection: {
				hostname: 'localhost',
				port: 5432,
				database: 'mi-db',
				username: 'postgres',
				password: ''
			},
			schemas: { public: true },
			layers: {
				packages: true,
				backend: false,
				frontend: false
			}
		}

		const spinner = showSpinner('Creando configuración...')
		try {
			await writeFile(target, JSON.stringify(project, null, '\t'), 'utf-8')
			spinner.succeed(`Configuración creada en ${target}`)
		} catch (err) {
			spinner.fail('Error al crear la configuración')
			console.error(err)
			process.exit(1)
		}
	}
}