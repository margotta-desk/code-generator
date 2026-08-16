import { ITableConstraintFilter, ITableConstraintModel } from '../types'

export interface ITableConstraintRepository {
	GetPrimaryKey(filter: ITableConstraintFilter): Promise<ITableConstraintModel>
	GetForeignKey(filter: ITableConstraintFilter): Promise<ITableConstraintModel[]>
	Find(filter: ITableConstraintFilter): Promise<ITableConstraintModel[]>
}
