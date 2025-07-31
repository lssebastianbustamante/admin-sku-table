export const getData = async (endpoint: string, retries: number, delay: number): Promise<any> => {
	const baseURL = 'https://sk3iqlradb.execute-api.us-west-2.amazonaws.com/qa';

	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			console.log('try')
			const response = await fetch(`${baseURL}${endpoint}`, {
				method: 'GET',
				mode: 'no-cors',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			/* if (!response.ok) {
				console.log('reponse', response.ok)
				console.log('hay error?')
				throw new Error(`Error ${response.status}: ${response.statusText}`)
			} */
			const contentType = response.headers.get('content-type');
			if (!contentType || !contentType.includes('application/json')) {
				throw new TypeError('La respuesta no es JSON');
			}
			const data = await response.json()
			console.log('response', data)
			return data;
		} catch (error) {
			console.log('catch')
			if (attempt === retries) {
				throw error;
			}
			console.warn(`${error} Intento ${attempt} fallido. Reintentando en ${delay} ms...`)
			await new Promise(res => setTimeout(res, delay))
		}
	}
}