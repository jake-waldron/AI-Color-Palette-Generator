import { useState } from 'react';

export default function Home() {
	const [colors, setColors] = useState<string[]>([]);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const userInput = formData.get('userInput');
		try {
			const res = await fetch('/api/generate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ input: userInput }),
			});
			const data = await res.json();
			console.log(data);
			// setColors(data);
		} catch (err) {
			console.log(err);
		}
	}

	return (
		<main className={`flex min-h-screen flex-col items-center justify-center`}>
			<form className={`flex h-12 z-50`} onSubmit={handleSubmit}>
				<input
					type='text'
					placeholder='Color Palette Theme'
					className={`h-12 p-2 border border-gray-300 rounded-l-lg border-r-0`}
					name='userInput'
				/>
				<button className='bg-lime-200 h-full rounded-r-lg p-2'>Generate</button>
			</form>
		</main>
	);
}
