import { inject, injectable } from 'tsyringe'
import { DataSource, type FindOptionsWhere } from 'typeorm'
import { ITableConstraintRepository } from '../contracts'
import { TableConstraintSchema } from '../models'
import { ITableConstraintFilter, ITableConstraintModel } from '../types'

@injectable()
export class TableConstraintRepository implements ITableConstraintRepository {
	private readonly repository

	constructor(@inject(DataSource) datasource: DataSource) {
		this.repository = datasource.getRepository(TableConstraintSchema)
	}

	async GetPrimaryKey(filter: ITableConstraintFilter): Promise<ITableConstraintModel> {
		return this.repository.findOne({
			where: { ...this.filter(filter), ConstraintType: 'PRIMARY KEY' },
			relations: {
				KeyColumnUsages: {
					Column: true
				}
			},
			order: {
				KeyColumnUsages: {
					OrdinalPosition: 'ASC'
				}
			}
		}) as Promise<ITableConstraintModel>
	}

	async GetForeignKey(filter: ITableConstraintFilter): Promise<ITableConstraintModel[]> {
		return this.repository.find({
			where: { ...this.filter(filter), ConstraintType: 'FOREIGN KEY' },
			relations: {
				KeyColumnUsages: true,
				ReferentialConstraint:
				{
					UniqueKeyColumnUsage: true
				}
			},
			order: {
				TableCatalog: 'ASC',
				TableSchema: 'ASC',
				TableName: 'ASC',
				ConstraintName: 'ASC',
				KeyColumnUsages: {
					OrdinalPosition: 'ASC',
				},
				ReferentialConstraint: {
					UniqueKeyColumnUsage: {
						OrdinalPosition: 'ASC'
					}
				}
			}
		}) as Promise<ITableConstraintModel[]>
	}


	async Find(filter: ITableConstraintFilter): Promise<ITableConstraintModel[]> {
		return this.repository.find({
			where: this.filter(filter),
			// relations: { Schemata: true },
			// relations: { TableConstraint: true }
			// relations: {
			// 	Columns: true
			// }
		}) as Promise<ITableConstraintModel[]>
	}

	private filter(filter: ITableConstraintFilter): FindOptionsWhere<ITableConstraintModel> {
		const where: FindOptionsWhere<ITableConstraintModel> = {}

		if (filter.TableCatalog) where.TableCatalog = filter.TableCatalog
		if (filter.TableSchema) where.TableSchema = filter.TableSchema
		if (filter.TableName) where.TableName = filter.TableName
		if (filter.ConstraintType) where.ConstraintType = filter.ConstraintType

		return where
	}
}
