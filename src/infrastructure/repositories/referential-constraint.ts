import { inject, injectable } from 'tsyringe'
import { DataSource, type FindOptionsWhere } from 'typeorm'
import { IReferentialConstraintRepository } from '../contracts'
import { ReferentialConstraintSchema } from '../models'
import { IReferentialConstraintFilter, IReferentialConstraintModel } from '../types'

@injectable()
export class ReferentialConstraintRepository implements IReferentialConstraintRepository {
	private readonly repository

	constructor(@inject(DataSource) datasource: DataSource) {
		this.repository = datasource.getRepository(ReferentialConstraintSchema)
	}

	async Find(filter: IReferentialConstraintFilter): Promise<IReferentialConstraintModel[]> {
		return this.repository.find({
			where: this.filter(filter),
		}) as Promise<IReferentialConstraintModel[]>
	}

	private filter(filter: IReferentialConstraintFilter): FindOptionsWhere<IReferentialConstraintModel> {
		const where: FindOptionsWhere<IReferentialConstraintModel> = {}

		if (filter.ConstraintCatalog) where.ConstraintCatalog = filter.ConstraintCatalog
		if (filter.ConstraintSchema) where.ConstraintSchema = filter.ConstraintSchema
		if (filter.ConstraintName) where.ConstraintName = filter.ConstraintName
		if (filter.UniqueConstraintCatalog) where.UniqueConstraintCatalog = filter.UniqueConstraintCatalog
		if (filter.UniqueConstraintSchema) where.UniqueConstraintSchema = filter.UniqueConstraintSchema
		if (filter.UniqueConstraintName) where.UniqueConstraintName = filter.UniqueConstraintName

		return where
	}
}
