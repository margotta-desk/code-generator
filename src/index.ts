#!/usr/bin/env node
import 'reflect-metadata'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { generateCommand, infoCommand, initCommand } from './cli'
import { destroyContainer } from './container'

export function runCli(): void {
	yargs(hideBin(process.argv))
		.scriptName('codegen')
		.usage('$0 <comando> [opciones]')
		.command(generateCommand)
		.command(initCommand)
		.command(infoCommand)
		.demandCommand(1, 'Debes especificar un comando')
		.help()
		.alias('h', 'help')
		.version()
		.alias('v', 'version')
		.strict()
		.parse()
}


function setupSignalHandlers(): void {
	const shutdown = (code: number) => {
		destroyContainer()
			.catch(() => { /* ignorar errores al cerrar */ })
			.finally(() => process.exit(code))
	}
	process.on('SIGINT', () => shutdown(130))   // Ctrl+C
	process.on('SIGTERM', () => shutdown(143))  // kill
}

setupSignalHandlers()
runCli()