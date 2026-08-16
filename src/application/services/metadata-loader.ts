import { TableSchema } from './../../infrastructure/models/table'
import { inject, injectable } from 'tsyringe'
import { IProjectType } from '../../cli'
import { IKeyColumnUsageModel, IKeyColumnUsageRepository, ISchemataModel, ISchemataRepository, ITableConstraintModel, ITableConstraintRepository, ITableRepository } from '../../infrastructure'
import { TOKENS } from '../../tokens'
import { IMetadataLoaderService } from '../contracts'
import { ClassModel, DependencyModel, DependencyPropertiesModel, KeyModel, ModuleModel, PropertyModel } from '../models'
import { Convert } from '../helpers'

@injectable()
export class MetadataLoaderService implements IMetadataLoaderService {
	private cache: ModuleModel[] | null = null

	constructor(
		@inject(TOKENS.KeyColumnUsageRepository) private readonly keyColumnUsageRepository: IKeyColumnUsageRepository,
		@inject(TOKENS.Project) private readonly project: IProjectType,
		@inject(TOKENS.SchemataRepository) private readonly schemataRepository: ISchemataRepository,
		@inject(TOKENS.TableConstraintRepository) private readonly tableConstraintRepository: ITableConstraintRepository,
	) { }

	async Load(): Promise<ModuleModel[]> {
		this.cache = []

		//	Obtiene esquemas, tablas, columnas y primary keys
		for await (const schema of Object.keys(this.project.schemas).filter(f => this.project.schemas[f] == true)) {
			const schemata: ISchemataModel = await this.schemataRepository.Get({
				CatalogName: this.project.connection.database,
				SchemaName: schema
			})

			const module: ModuleModel = new ModuleModel()
			module.SchemaName = schema
			module.FileName = Convert.ToKebabCase(schema)
			module.ModuleName = Convert.ToPascalCase(schema)
			module.Classes = [] as ClassModel[]
			module.References = [] as ModuleModel[]

			for await (const table of schemata.Tables) {

				const classModel: ClassModel = new ClassModel()
				classModel.TableName = table.TableName
				classModel.Module = module
				classModel.Properties = [] as PropertyModel[]
				classModel.Values = [] as PropertyModel[]
				classModel.ManyToOne = [] as DependencyModel[]
				classModel.ManyToOneReversed = [] as DependencyModel[]
				classModel.OneToOne = [] as DependencyModel[]
				classModel.OneToOneReversed = [] as DependencyModel[]

				for await (const column of table.Columns) {
					const property: PropertyModel = new PropertyModel()

					property.Class = classModel
					property.ColumnDefault = column.ColumnDefault
					property.ColumnName = column.ColumnName
					property.DataType = column.DataType
					property.GenerationExpression = column.GenerationExpression
					property.Identity = column.IsIdentity
					property.MaxLength = column.CharacterMaximumLength
					property.Nullable = column.IsNullable
					property.NumericPrecision = column.NumericPrecision
					property.NumericScale = column.NumericScale
					property.Position = column.OrdinalPosition
					property.UdtType = column.UdtName
					property.Updatable = column.IsUpdatable

					classModel.Properties.push(property)
				}

				const constraint: ITableConstraintModel = await this.tableConstraintRepository.GetPrimaryKey({
					TableCatalog: table.TableCatalog,
					TableSchema: table.TableSchema,
					TableName: table.TableName
				})

				if (constraint) {

					const key: KeyModel = new KeyModel()
					key.KeyName = Convert.ToPascalCase(constraint.ConstraintName)
					key.ConstraintName = constraint.ConstraintName
					key.Class = classModel
					key.Properties = []


					const keyColumnUsage: IKeyColumnUsageModel[] = await this.keyColumnUsageRepository.Find({
						ConstraintCatalog: constraint.ConstraintCatalog,
						ConstraintSchema: constraint.ConstraintSchema,
						ConstraintName: constraint.ConstraintName
					})

					for await (const keyColumn of keyColumnUsage) {
						key.Properties.push(classModel.Properties.find(f => f.ColumnName == keyColumn.ColumnName))
					}

					classModel.Key = key
				}

				classModel.Values = classModel.Properties.filter(f => !classModel.Key?.Properties.includes(f))

				module.Classes.push(classModel)
			}

			this.cache.push(module)
		}

		//	Obtiene foreign keys
		for await (const module of this.cache) {
			for await (const classModel of module.Classes) {
				const tableConstraints: ITableConstraintModel[] = await this.tableConstraintRepository.GetForeignKey({
					TableCatalog: this.project.connection.database,
					TableSchema: classModel.Module.SchemaName,
					TableName: classModel.TableName
				})

				for await (const tableConstraint of tableConstraints) {
					const referencedTableSchema: string = tableConstraint.ReferentialConstraint.UniqueKeyColumnUsage.find(f => f).TableSchema
					const referencedTableName: string = tableConstraint.ReferentialConstraint.UniqueKeyColumnUsage.find(f => f).TableName

					const currentTableSchema: string = tableConstraint.KeyColumnUsages.find(f => f).TableSchema
					const currentTableName: string = tableConstraint.KeyColumnUsages.find(f => f).TableName
					const constraintName: string = tableConstraint.ConstraintName


					{	//	Incorpora la dependencia del módulo para los imports
						const referencedModule: ModuleModel = this.cache.find(f => f.SchemaName == referencedTableSchema)
						if (!module.References.includes(referencedModule) && module != referencedModule)
							module.References.push(referencedModule)
					}

					const dependency: DependencyModel = new DependencyModel()
					dependency.Type = 'many-to-one'
					dependency.ConstraintName = constraintName

					dependency.Class = this.cache.find(f => f.SchemaName == referencedTableSchema).Classes.find(f => f.TableName == referencedTableName)
					dependency.Referenced = this.cache.find(f => f.SchemaName == currentTableSchema).Classes.find(f => f.TableName == currentTableName)

					dependency.Properties = tableConstraint.KeyColumnUsages.map(keyColumnUsage => {
						const primaryPosition = tableConstraint.ReferentialConstraint.UniqueKeyColumnUsage.find(f => f.OrdinalPosition == keyColumnUsage.OrdinalPosition).OrdinalPosition

						const dependencyProperties: DependencyPropertiesModel = new DependencyPropertiesModel()
						dependencyProperties.Primary = this.cache.find(f => f.SchemaName == referencedTableSchema)?.Classes.find(f => f.TableName == referencedTableName)?.Properties.find(f => f.Position == primaryPosition)
						dependencyProperties.Foreign = classModel.Properties.find(f => f.ColumnName == keyColumnUsage.ColumnName)

						return dependencyProperties
					})


					if ((dependency.Properties.some(s => s.Foreign.Class.Key.Properties.includes(s.Foreign))) && (dependency.Properties.length == dependency.Properties[0].Foreign.Class.Key.Properties.length))
						dependency.Type = 'one-to-one'

					if (dependency.Type == 'many-to-one') {
						if (dependency.Class.Module == module) dependency.Properties[0].Primary?.Class.ManyToOneReversed.push(dependency)
						dependency.Properties[0].Foreign?.Class.ManyToOne.push(dependency)
					}
					else {
						dependency.Properties[0].Primary?.Class.OneToOneReversed.push(dependency)
						dependency.Properties[0].Foreign?.Class.OneToOne.push(dependency)
					}
				}
			}
		}

		return this.cache
	}

	async ValidateSchemas(schemas: Record<string, boolean>): Promise<Record<string, boolean>> {
		const schematas: ISchemataModel[] = await this.schemataRepository.Find({
			CatalogName: this.project.connection.database,
			ExcludeSystem: true
		})

		for await (const schemata of schematas) {
			if (!(schemata.SchemaName in this.project.schemas))
				this.project.schemas[schemata.SchemaName] = false
		}

		Object
			.keys(this.project.schemas)
			.filter(f => !schematas.map(m => m.SchemaName).includes(f))
			.forEach(schemata => { delete this.project.schemas[schemata] })


		const result: Record<string, boolean> = {}

		Object
			.keys(this.project.schemas)
			.sort((a, b) => a > b ? 1 : -1)
			.forEach(schema => result[schema] = this.project.schemas[schema])

		return result
	}
}