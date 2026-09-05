import ejs from 'ejs'
import fs from 'fs'
import { mkdir } from 'fs/promises'
import path from 'path'
import { inject, injectable } from 'tsyringe'
import { IProjectType } from '../../cli'
import { TOKENS } from '../../tokens'
import { IMonorepoService } from '../contracts'
import { ModuleModel } from '../models'

// const agentMdTemplate = fs.readFileSync(path.join(import.meta.dirname, '../../templates/monorepo/agents-md.ejs'), 'utf8')
const editorconfigTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/monorepo/editorconfig.ejs'), 'utf8')
const gitignoreTemplate = fs.readFileSync(path.join(import.meta.dirname, '../templates/monorepo/gitignore.ejs'), 'utf8')
const pnpmWorkspaceYaml = fs.readFileSync(path.join(import.meta.dirname, '../templates/monorepo/pnpm-workspace-yaml.ejs'), 'utf8')
const postbuildMjs = fs.readFileSync(path.join(import.meta.dirname, '../templates/monorepo/postbuild.mjs.ejs'), 'utf8')


@injectable()
export class MonorepoService implements IMonorepoService {

	constructor(@inject(TOKENS.Project) private readonly project: IProjectType) { }

	public async Generate(projectId: string, modules: ModuleModel[]): Promise<void> {
		const outputPath = path.join(import.meta.dirname, '../', '../', '../', 'output', this.project.path)

		if (!fs.existsSync(outputPath)) await mkdir(outputPath, { recursive: true })

		await this.generateEditorConfig(outputPath)
		await this.generateGitignore(outputPath)
		await this.generatePnpmWorkspaceYaml(outputPath)
		await this.generatePostbuildMjs(outputPath)
		await this.generatePackageJson(projectId, outputPath)

		return
	}

	private async generateEditorConfig(outputPath: string) {
		const rendered: string = ejs.render(editorconfigTemplate, {}).trim()
		fs.writeFileSync(path.join(outputPath, `.editorconfig`), rendered, 'utf8')
	}

	private async generateGitignore(outputPath: string) {
		const rendered: string = ejs.render(gitignoreTemplate, {}).trim()
		fs.writeFileSync(path.join(outputPath, `.gitignore`), rendered, 'utf8')
	}

	private async generatePnpmWorkspaceYaml(outputPath: string) {
		const rendered: string = ejs.render(pnpmWorkspaceYaml, {}).trim()
		fs.writeFileSync(path.join(outputPath, `pnpm-workspace.yaml`), rendered, 'utf8')
	}

	private async generatePostbuildMjs(outputPath: string) {
		const rendered: string = ejs.render(postbuildMjs, {}).trim()
		fs.writeFileSync(path.join(outputPath, `postbuild.mjs`), rendered, 'utf8')
	}

	private async generatePackageJson(projectId: string, outputPath: string) {
		const author: Record<string, string> = {
			name: this.project.author.name,
			email: this.project.author.email,
			url: this.project.author.url,
		}

		let content: Record<string, Record<string, boolean | string | Record<string, string>> | boolean | string | string[]> =
		{
			"name": `${projectId}`,
			"version": this.project.version,
			"description": `${this.project.description}`,
			"private": true,
			"author": author,
			"scripts": {
				"build": "pnpm -r run build",
				"clean": "pnpm -r run clean && rm -rf node_modules",
				"test": "pnpm -r run test",
				"typecheck": "pnpm -r run typecheck",
				"watch": "pnpm -r --parallel run watch"
			},
			"keywords": [],
			"license": "ISC",
			"engines": {
				"node": ">=20.0.0",
				"pnpm": ">=9.0.0"
			},
			"packageManager": "pnpm@11.5.2",
			"type": "module",
			"dependencies": {
				"luxon": "^3.7.2"
			},
			"devDependencies": {
				"@types/luxon": "^3.7.4",
				"@types/node": "^26.2.0",
				"typescript": "^6.0.3"
			}
		}

		const rendered: string = JSON.stringify(content, null, '\t').trim()
		fs.writeFileSync(path.join(outputPath, `package.json`), rendered, 'utf8')
	}
}