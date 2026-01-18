const mSocket = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
};

const io = {
  connect: jest.fn(() => mSocket),
};

module.exports = {
  mSocket,
  io
};
