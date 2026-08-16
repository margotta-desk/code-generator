import { IReferentialConstraintFilter, IReferentialConstraintModel } from '../types'

export interface IReferentialConstraintRepository {
	Find(filter: IReferentialConstraintFilter): Promise<IReferentialConstraintModel[]>
}
