import { inject, injectable } from 'tsyringe'
import { DataSource, FindOperator, In, Not, Repository } from 'typeorm'
import { ISchemataRepository } from '../contracts'
import { SchemataSchema } from '../models'
import { ISchemataFilter, ISchemataKey, ISchemataModel } from '../types'

@injectable()
export class SchemataRepository implements ISchemataRepository {
	private readonly repository: Repository<ISchemataModel>

	constructor(@inject(DataSource) datasource: DataSource) {
		this.repository = datasource.getRepository(SchemataSchema)
	}

	async Get(key: ISchemataKey): Promise<ISchemataModel> {
		return this.repository.findOne({
			where: key,
			relations: {
				Tables: {
					Columns: true
				}
			},
			order: {
				Tables: {
					TableName: 'ASC',
					Columns: {
						OrdinalPosition: 'ASC'
					}
				}
			}
		}) as Promise<ISchemataModel>

	}

	async Find(filter: ISchemataFilter): Promise<ISchemataModel[]> {
		return this.repository.find({
			where: this.filter(filter),
			relations: {
			},
			order: {
				SchemaName: 'asc',
			}
		}) as Promise<ISchemataModel[]>
	}

	private filter(filter: ISchemataFilter): Record<string, FindOperator<string> | string> {
		const where: Record<string, FindOperator<string> | string> = {}

		if (filter.ExcludeSystem == true) where.SchemaName = Not(In(['information_schema', 'pg_catalog', 'pg_toast']))
		if (filter.CatalogName) where.CatalogName = filter.CatalogName

		return where
	}
}
