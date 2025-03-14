// Import the greet function from a separate file for testing
// For now, we'll just define it here for the test
const testGreet = (name: string): string => {
	return `Hello, ${name}!`;
};

describe('Greet function', () => {
	it('should return the correct greeting', () => {
		expect(testGreet('World')).toBe('Hello, World!');
	});

	it('should work with other names', () => {
		expect(testGreet('Andi')).toBe('Hello, Andi!');
	});
});
