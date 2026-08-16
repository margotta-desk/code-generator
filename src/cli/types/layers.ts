export interface ILayersType {
	packages: boolean
	backend: boolean | 'lambda' | 'nest' | 'express'
	frontend: boolean | 'react' | 'angular'
}