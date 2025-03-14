import ipAddressController from './ipaddress.controller.js';

describe('IP Address Controller', () => {
	describe('get: current IP address', () => {
		it('should return a valid IP address', async () => {
			// Call the function with the real API
			const result = await ipAddressController.get();

			// Verify the result is a valid IP address format
			expect(result.content).toContain('status: success');
			expect(result.content).toContain('query: ');
		}, 10000); // Increase timeout for API call
	});

	describe('get: specific IP address', () => {
		it('should return details for a valid IP address', async () => {
			// Use a known public IP address for testing
			const ipAddress = '8.8.8.8'; // Google's public DNS

			// Call the function with the real API
			const result = await ipAddressController.get(ipAddress);

			// Verify the response contains expected fields
			expect(result.content).toContain('status: success');
			expect(result.content).toContain(`query: ${ipAddress}`);
		}, 10000); // Increase timeout for API call

		it('should handle invalid IP addresses', async () => {
			// Use an invalid IP address
			const invalidIp = 'invalid-ip';

			// Call the function with the real API
			const result = await ipAddressController.get(invalidIp);

			// Verify the response indicates failure
			expect(result.content).toContain('status: fail');
			expect(result.content).toContain(`query: ${invalidIp}`);
		}, 10000); // Increase timeout for API call
	});
});
