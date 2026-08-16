import type { CommandModule } from 'yargs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { renderTable } from '../render'
import type { IProjectType } from '../types'

interface InfoArgs {
	config?: string
}

export const infoCommand: CommandModule<{}, InfoArgs> = {
	command: 'info [config]',
	describe: 'Muestra información del proyecto de configuración',
	builder: (yargs) =>
		yargs
			.positional('config', {
				type: 'string',
				default: 'codegen.config.json',
				describe: 'Ruta del archivo de configuración'
			}),
	handler: async (args) => {
		const configPath = path.resolve(args.config ?? 'codegen.config.json')

		try {
			const raw = await readFile(configPath, 'utf-8')
			const project = JSON.parse(raw) as IProjectType

			renderTable([
				{ Propiedad: 'Nombre', Valor: project.name },
				{ Propiedad: 'Descripción', Valor: project.description },
				{ Propiedad: 'Versión', Valor: project.version },
				{ Propiedad: 'Base de datos', Valor: project.connection.database },
				{ Propiedad: 'Host', Valor: `${project.connection.hostname}:${project.connection.port}` },
				{ Propiedad: 'Esquemas', Valor: Object.keys(project.schemas).join(', ') },
				{
					Propiedad: 'Layers', Valor: Object.entries(project.layers)
						.filter(([, v]) => v)
						.map(([k]) => k).join(', ')
				}
			])
		} catch (err) {
			console.error(`No se pudo leer ${configPath}:`, err)
			process.exit(1)
		}
	}
}