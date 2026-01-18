const mSocket = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
};

const connect = jest.fn(() => mSocket);

const io = {
  connect,
};

export { mSocket, connect };
export default io;
