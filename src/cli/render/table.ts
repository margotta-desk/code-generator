export function renderTable<T extends Record<string, unknown>>(rows: T[]): void {
	console.table(rows)
}