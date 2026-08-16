export const YesNoTransformer = {
	from: (value: string): boolean => value === 'YES',
	to: (value: boolean): string => value ? 'YES' : 'NO'
}
