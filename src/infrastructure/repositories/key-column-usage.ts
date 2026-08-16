import { inject, injectable } from 'tsyringe'
import { DataSource, type FindOptionsWhere } from 'typeorm'
import { IKeyColumnUsageRepository } from '../contracts'
import { KeyColumnUsageSchema } from '../models'
import { IKeyColumnUsageFilter, IKeyColumnUsageKey, IKeyColumnUsageModel } from '../types'

@injectable()
export class KeyColumnUsageRepository implements IKeyColumnUsageRepository {
	private readonly repository

	constructor(@inject(DataSource) datasource: DataSource) {
		this.repository = datasource.getRepository(KeyColumnUsageSchema)
	}

	async Get(key: IKeyColumnUsageKey): Promise<IKeyColumnUsageModel> {
		return this.repository.findOne({
			where: key,
			relations: {
				Column: true
			},
		}) as Promise<IKeyColumnUsageModel>
	}

	async Find(filter: IKeyColumnUsageFilter): Promise<IKeyColumnUsageModel[]> {
		return this.repository.find({
			where: this.filter(filter),
			relations: {
				Column: true
			},
			order: {
				Column: {
					OrdinalPosition: 'ASC'
				}
			}
		}) as Promise<IKeyColumnUsageModel[]>
	}

	private filter(filter: IKeyColumnUsageFilter): FindOptionsWhere<IKeyColumnUsageModel> {
		const where: FindOptionsWhere<IKeyColumnUsageModel> = {}

		if (filter.ConstraintCatalog) where.ConstraintCatalog = filter.ConstraintCatalog
		if (filter.ConstraintSchema) where.ConstraintSchema = filter.ConstraintSchema
		if (filter.ConstraintName) where.ConstraintName = filter.ConstraintName
		if (filter.TableName) where.TableName = filter.TableName

		return where
	}
}
