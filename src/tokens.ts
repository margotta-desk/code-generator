export const TOKENS = {
	DataSource: 'DataSource',

	//	Infrastructure
	ColumnRepository: 'IColumnRepository',
	ConstraintColumnUsageRepository: 'IConstraintColumnUsageRepository',
	KeyColumnUsageRepository: 'IKeyColumnUsageRepository',
	ReferentialConstraintRepository: 'IReferentialConstraintRepository',
	SchemataRepository: 'ISchemataRepository',
	TableConstraintRepository: 'ITableConstraintRepository',
	TableRepository: 'ITableRepository',

	//	Application
	BackendService: 'IBackendService',
	MetadataLoaderService: 'IMetadataLoaderService',
	MonorepoService: 'IMonorepoService',
	NestModulesService: 'INestModulesService',
	NestService: 'INestService',
	NestSharedModuleService: 'INestSharedModuleService',
	NestSrcService: 'INestSrcService',
	PackagesService: 'IPackagesService',

	//	Configuración
    Project: 'IProjectType',
} as const