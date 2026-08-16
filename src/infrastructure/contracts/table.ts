import { ITableFilter, ITableKey, ITableModel } from '../types'

export interface ITableRepository {
	Get(key: ITableKey): Promise<ITableModel>
	Find(filter: ITableFilter): Promise<ITableModel[]>
}
