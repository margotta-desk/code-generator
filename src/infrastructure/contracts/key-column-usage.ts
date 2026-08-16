import { IKeyColumnUsageFilter, IKeyColumnUsageKey, IKeyColumnUsageModel } from '../types'

export interface IKeyColumnUsageRepository {
	Get(key: IKeyColumnUsageKey): Promise<IKeyColumnUsageModel>
	Find(filter: IKeyColumnUsageFilter): Promise<IKeyColumnUsageModel[]>
}
