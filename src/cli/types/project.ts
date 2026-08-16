import { IAuthorType } from './author'
import { IConnectionType } from './connection'
import { ILayersType } from './layers'

export interface IProjectType {
	name: string
	description: string
	path: string
	version: string
	author: IAuthorType
	connection: IConnectionType
	schemas: Record<string, boolean>
	layers: ILayersType
}