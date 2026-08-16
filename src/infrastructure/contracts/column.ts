import { IColumnFilter, IColumnModel } from '../types'

export interface IColumnRepository {
	Find(filter: IColumnFilter): Promise<IColumnModel[]>
}
