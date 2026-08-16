import { inject, injectable } from 'tsyringe'
import { DataSource } from 'typeorm'
import { IConstraintColumnUsageRepository } from '../contracts'
import { ConstraintColumnUsageSchema } from '../models'
import { IConstraintColumnUsageFilter, IConstraintColumnUsageModel } from '../types'

@injectable()
export class ConstraintColumnUsageRepository implements IConstraintColumnUsageRepository {
	private readonly repository

	constructor(@inject(DataSource) datasource: DataSource) {
		this.repository = datasource.getRepository(ConstraintColumnUsageSchema)
	}

	async Find(filter: IConstraintColumnUsageFilter): Promise<IConstraintColumnUsageModel[]> {
		return this.repository.find({
			where: this.filter(filter),
		}) as Promise<IConstraintColumnUsageModel[]>
	}

	private filter(_filter: IConstraintColumnUsageFilter): Record<string, string> {
		const where: Record<string, string> = {}

		return where
	}
}
