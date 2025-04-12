import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import RegisterPage from '../page';
import { register } from '@/services/api';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the API service
jest.mock('@/services/api', () => ({
  register: jest.fn(),
}));

describe('RegisterPage', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  it('renders the registration form', () => {
    render(<RegisterPage />);
    
    expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('WhatsApp Number')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('WhatsApp Channel Name')).toBeInTheDocument();
    expect(screen.getByText('Send OTP')).toBeInTheDocument();
  });

  it('shows error when required fields are missing', async () => {
    render(<RegisterPage />);
    
    fireEvent.click(screen.getByText('Send OTP'));
    
    await waitFor(() => {
      expect(screen.getByText('All fields are required')).toBeInTheDocument();
    });
  });

  it('handles successful registration and OTP sending', async () => {
    (register as jest.Mock).mockResolvedValueOnce({
      status: 200,
      message: 'OTP sent successfully',
    });

    render(<RegisterPage />);
    
    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Full Name'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('WhatsApp Number'), {
      target: { value: '1234567890' },
    });
    fireEvent.change(screen.getByPlaceholderText('WhatsApp Channel Name'), {
      target: { value: 'test-channel' },
    });

    // Submit the form
    fireEvent.click(screen.getByText('Send OTP'));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith(
        'test@example.com',
        'Test User',
        '+2341234567890',
        'test-channel'
      );
    });

    // Check if OTP input is shown
    expect(screen.getByText('Enter the 6-digit OTP sent to your WhatsApp number')).toBeInTheDocument();
  });

  it('handles registration failure', async () => {
    (register as jest.Mock).mockRejectedValueOnce(new Error('Registration failed'));

    render(<RegisterPage />);
    
    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Full Name'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('WhatsApp Number'), {
      target: { value: '1234567890' },
    });
    fireEvent.change(screen.getByPlaceholderText('WhatsApp Channel Name'), {
      target: { value: 'test-channel' },
    });

    // Submit the form
    fireEvent.click(screen.getByText('Send OTP'));

    await waitFor(() => {
      expect(screen.getByText('Registration failed')).toBeInTheDocument();
    });
  });

  it('handles OTP verification', async () => {
    // First, simulate successful registration
    (register as jest.Mock).mockResolvedValueOnce({
      status: 200,
      message: 'OTP sent successfully',
    });

    render(<RegisterPage />);
    
    // Fill in and submit the registration form
    fireEvent.change(screen.getByPlaceholderText('Full Name'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('WhatsApp Number'), {
      target: { value: '1234567890' },
    });
    fireEvent.change(screen.getByPlaceholderText('WhatsApp Channel Name'), {
      target: { value: 'test-channel' },
    });
    fireEvent.click(screen.getByText('Send OTP'));

    await waitFor(() => {
      expect(screen.getByText('Enter the 6-digit OTP sent to your WhatsApp number')).toBeInTheDocument();
    });

    // Fill in OTP
    const otpInputs = screen.getAllByRole('textbox').filter(
      (input) => input.getAttribute('type') === 'text'
    );
    
    otpInputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: (index + 1).toString() } });
    });

    // Submit OTP
    fireEvent.click(screen.getByText('Verify OTP'));

    // Check if redirected to dashboard
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });
}); 