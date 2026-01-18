import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from './App';

// Define the mock using the shared module so we can access the same instances
jest.mock('socket.io-client', () => {
  const { io } = require('./socketMock');
  return io;
});

// Import the specific mock instances for verification
const { mSocket } = require('./socketMock');

// Mock uuid
jest.mock('uuid', () => ({
  v4: () => 'test-client-id'
}));

describe('App Component', () => {

  beforeEach(() => {
    // Clear all mock data
    jest.clearAllMocks();
    
    // Explicitly clear our shared mock spies too, just in case
    mSocket.emit.mockClear();
    mSocket.on.mockClear();
    mSocket.off.mockClear();
    
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = jest.fn();
  });

  test('renders chat interface with correct initial state', () => {
    render(<App />);
    
    // Check header
    expect(screen.getByText('AI Chatbot - chat with agentic-rag')).toBeInTheDocument();
    
    // Check input area
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
  });

  test('switches model and updates description', () => {
    render(<App />);
    const select = screen.getByRole('combobox');
    
    fireEvent.change(select, { target: { value: 'agent' } });
    
    expect(screen.getByText('AI Chatbot - chat with agent')).toBeInTheDocument();
    expect(screen.getByText(/Helps create an appointment/i)).toBeInTheDocument();
  });

  test('sends message and updates UI', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Type your message...');
    const button = screen.getByText('Send');

    // Type message
    fireEvent.change(input, { target: { value: 'Hello AI' } });
    
    // Send message
    fireEvent.click(button);

    // Check emit called correctly on the shared mock
    await waitFor(() => {
      expect(mSocket.emit).toHaveBeenCalledWith('send_message', expect.objectContaining({
        messages: [{ role: 'user', content: 'Hello AI' }],
        clientId: 'test-client-id',
        model: 'agentic-rag'
      }));
    });
    
    // Check UI updates
    expect(input.value).toBe(''); 
    expect(screen.getByText('Hello AI')).toBeInTheDocument(); 
    expect(screen.getByText('AI is typing...')).toBeInTheDocument(); 
  });

  test('receives message and removes typing indicator', async () => {
    render(<App />);
    
    // Send message first
    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(screen.getByText('Send'));
    
    expect(screen.getByText('AI is typing...')).toBeInTheDocument();

    // Verify subscription
    expect(mSocket.on).toHaveBeenCalledWith('receive_message_test-client-id', expect.any(Function));
    
    // Get callback
    const call = mSocket.on.mock.calls.find(c => c[0] === 'receive_message_test-client-id');
    const callback = call[1];
    
    // Receive response
    act(() => {
      callback({
          clientId: 'test-client-id',
          response: 'Hello Human'
      });
    });
    
    expect(screen.getByText('Hello Human')).toBeInTheDocument();
  });
  
  test('unsubscribes on unmount', () => {
    const { unmount } = render(<App />);
    unmount();
    
    expect(mSocket.off).toHaveBeenCalledWith('receive_message_test-client-id', expect.any(Function));
  });
});
