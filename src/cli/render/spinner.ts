import ora from 'ora'

export function showSpinner(text: string) {
	const spinner = ora(text).start()
	return spinner  // tiene .succeed(), .fail(), .stop()
}