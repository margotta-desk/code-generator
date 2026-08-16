import 'reflect-metadata'

import path from 'path'
import { container } from 'tsyringe'
import { DataSource } from 'typeorm'
import { BackendService, IBackendService, IMetadataLoaderService, IMonorepoService, INestModulesService, INestService, INestSharedModuleService, INestSrcService, IPackagesService, MetadataLoaderService, MonorepoService, NestModulesService, NestService, NestSharedModuleService, NestSrcService, PackagesService } from './application'
import { IConnectionType } from './cli'
import { ColumnRepository, ConstraintColumnUsageRepository, IColumnRepository, IConstraintColumnUsageRepository, IKeyColumnUsageRepository, IReferentialConstraintRepository, ISchemataRepository, ITableConstraintRepository, ITableRepository, KeyColumnUsageRepository, ReferentialConstraintRepository, SchemataRepository, TableConstraintRepository, TableRepository } from './infrastructure'
import { TOKENS } from './tokens'

export async function registerContainer(connection: IConnectionType): Promise<void> {
	//	Inicializa la base de datos una sola vez
	const datasource = new DataSource({
		...connection,
		type: 'postgres',
		entities: [path.join(import.meta.dirname, 'infrastructure', 'models', '*{.js,.ts}')],
		synchronize: false
	})

	try {
		await datasource.initialize()
	} catch (error) {
		throw new Error('No se ha podido establecer la conexión con la base de datos')
	}
	container.registerInstance(DataSource, datasource)

	//	Repositorios: Token -> implementacion
	container.register<IColumnRepository>(TOKENS.ColumnRepository, { useClass: ColumnRepository })
	container.register<IConstraintColumnUsageRepository>(TOKENS.ConstraintColumnUsageRepository, { useClass: ConstraintColumnUsageRepository })
	container.register<IKeyColumnUsageRepository>(TOKENS.KeyColumnUsageRepository, { useClass: KeyColumnUsageRepository })
	container.register<IReferentialConstraintRepository>(TOKENS.ReferentialConstraintRepository, { useClass: ReferentialConstraintRepository })
	container.register<ISchemataRepository>(TOKENS.SchemataRepository, { useClass: SchemataRepository })
	container.register<ITableConstraintRepository>(TOKENS.TableConstraintRepository, { useClass: TableConstraintRepository })
	container.register<ITableRepository>(TOKENS.TableRepository, { useClass: TableRepository })

	//	Services
	container.register<IBackendService>(TOKENS.BackendService, { useClass: BackendService })
	container.register<IMetadataLoaderService>(TOKENS.MetadataLoaderService, { useClass: MetadataLoaderService })
	container.register<IMonorepoService>(TOKENS.MonorepoService, { useClass: MonorepoService })
	container.register<INestModulesService>(TOKENS.NestModulesService, { useClass: NestModulesService })
	container.register<INestService>(TOKENS.NestService, { useClass: NestService })
	container.register<INestSharedModuleService>(TOKENS.NestSharedModuleService, { useClass: NestSharedModuleService })
	container.register<INestSrcService>(TOKENS.NestSrcService, { useClass: NestSrcService })
	container.register<IPackagesService>(TOKENS.PackagesService, { useClass: PackagesService })
}

export async function destroyContainer(): Promise<void> {
	if (container.isRegistered(DataSource)) {
		const datasource = container.resolve(DataSource)
		if (datasource.isInitialized) {
			await datasource.destroy()  // Cierra el pool de PostgreSQL
		}
	}
	container.clearInstances()  // Limpia las instancias de tsyringe
}

export { container }
