export class Sort {
	public static RecordByKey = <T>(arg: Record<string, T>): Record<string, T> => {
		const result: Record<string, T> = {}

		let keys: string[] = Object.keys(arg)

		keys.sort((a: string, b: string) => a > b ? 1 : -1)

		keys.forEach((m: string) => result[m] = arg[m])

		return result
	}

	public static RecordArrayByKey = <T>(arg: Record<string, T[]>): Record<string, T[]> => {
		let internal: string[] = Object.keys(arg).filter(f => f.startsWith('.'))
		let others: string[] = Object.keys(arg).filter(f => !internal.includes(f))
		
		internal.sort((a: string, b: string) => a > b ? 1 : -1)
		others.sort((a: string, b: string) => a > b ? 1 : -1)
		
		const result: Record<string, T[]> = {}
		others.forEach((m: string) => result[m] = arg[m].sort((a, b) => a > b ? 1 : -1))
		internal.forEach((m: string) => result[m] = arg[m].sort((a, b) => a > b ? 1 : -1))

		return result
	}
}