import { IConstraintColumnUsageFilter, IConstraintColumnUsageModel } from '../types'

export interface IConstraintColumnUsageRepository {
	Find(filter: IConstraintColumnUsageFilter): Promise<IConstraintColumnUsageModel[]>
}
