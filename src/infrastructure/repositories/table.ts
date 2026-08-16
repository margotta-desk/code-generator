import { inject, injectable } from 'tsyringe'
import { DataSource } from 'typeorm'
import { ITableRepository } from '../contracts'
import { TableSchema } from '../models'
import { ITableFilter, ITableKey, ITableModel } from '../types'

@injectable()
export class TableRepository implements ITableRepository {
	private readonly repository

	constructor(@inject(DataSource) datasource: DataSource) {
		this.repository = datasource.getRepository(TableSchema)
	}

	async Get(key: ITableKey): Promise<ITableModel> {
		return this.repository.findOne({
			where: key,
			relations: {
			},
			order: {
			}
		})
	}

	async Find(filter: ITableFilter): Promise<ITableModel[]> {
		return this.repository.find({
			where: this.filter(filter),
			// relations: { Schemata: true },
			// relations: { Table: true }
			relations: {
				// Columns: true
			}
		}) as Promise<ITableModel[]>
	}

	private filter(filter: ITableFilter): Record<string, string> {
		const where: Record<string, string> = {}

		if (filter.TableCatalog) where.TableCatalog = filter.TableCatalog
		if (filter.TableSchema) where.TableSchema = filter.TableSchema

		return where
	}
}
