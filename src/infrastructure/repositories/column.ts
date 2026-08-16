import { inject, injectable } from 'tsyringe'
import { DataSource } from 'typeorm'
import { IColumnRepository } from '../contracts'
import { ColumnSchema } from '../models'
import { IColumnFilter, IColumnModel } from '../types'

@injectable()
export class ColumnRepository implements IColumnRepository {
	private readonly repository

	constructor(@inject(DataSource) datasource: DataSource) {
		this.repository = datasource.getRepository(ColumnSchema)
	}

	async Find(filter: IColumnFilter): Promise<IColumnModel[]> {
		return this.repository.find({
			where: this.filter(filter),
			order: {
				OrdinalPosition: 'ASC'
			}
		}) as Promise<IColumnModel[]>
	}

	private filter(filter: IColumnFilter): Record<string, string> {
		const where: Record<string, string> = {}

		if (filter.TableCatalog) where.TableCatalog = filter.TableCatalog
		if (filter.TableSchema) where.TableSchema = filter.TableSchema
		if (filter.TableName) where.TableName = filter.TableName

		return where
	}
}
