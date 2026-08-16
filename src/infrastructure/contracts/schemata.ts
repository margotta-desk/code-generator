import { ISchemataFilter, ISchemataKey, ISchemataModel } from '../types'

export interface ISchemataRepository {
	Get(key: ISchemataKey): Promise<ISchemataModel>
	Find(filter: ISchemataFilter): Promise<ISchemataModel[]>
}
