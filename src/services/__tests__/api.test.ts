import axios from 'axios';
import { register } from '../api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a user', async () => {
      const mockResponse = {
        status: 200,
        message: 'Registration successful',
        data: [],
        meta: []
      };

      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await register(
        'test@example.com',
        'Test User',
        '+2341234567890',
        'test-channel'
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/register'),
        {
          email: 'test@example.com',
          name: 'Test User',
          phone: '+2341234567890',
          group_name: 'test-channel'
        },
        expect.any(Object)
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle registration failure', async () => {
      const errorResponse = {
        response: {
          data: {
            message: 'Registration failed'
          }
        }
      };

      mockedAxios.post.mockRejectedValueOnce(errorResponse);

      await expect(
        register('test@example.com', 'Test User', '+2341234567890', 'test-channel')
      ).rejects.toThrow('Registration failed');
    });

    it('should handle network errors', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        register('test@example.com', 'Test User', '+2341234567890', 'test-channel')
      ).rejects.toThrow('Network error');
    });
  });
}); 