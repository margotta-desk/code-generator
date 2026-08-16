export class Convert {
	/**
	 * Convierte una cadena en snake_case a camelCase, PascalCase y kebab-case.
	 * @param input Cadena en formato snake_case (p. ej. "user_profile_data")
	 * @returns Objeto con las tres conversiones
	 */

	static ToCamelCase = (value: string): string => {
		const words = value.split('_').filter((word) => word.length > 0)

		const capitalize = (word: string): string => word.charAt(0).toUpperCase() + word.slice(1)

		return words.map((word, index) => (index === 0 ? word : capitalize(word))).join('')
	}

	static ToPascalCase = (value: string): string => {
		const words = value.split('_').filter((word) => word.length > 0)

		const capitalize = (word: string): string => word.charAt(0).toUpperCase() + word.slice(1)

		return words.map(capitalize).join('')
	}

	static ToKebabCase = (value: string): string => {
		const words = value.split('_').filter((word) => word.length > 0)

		const capitalize = (word: string): string => word.charAt(0).toUpperCase() + word.slice(1)

		return words.join('-')
	}
}
