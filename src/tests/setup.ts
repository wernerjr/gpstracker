import '@testing-library/jest-dom';

// Tipos para o mock do navigator
interface MockGeolocation {
  getCurrentPosition: jest.Mock;
  watchPosition: jest.Mock;
  clearWatch: jest.Mock;
}

// Mock do GeolocationAPI
const mockGeolocation: MockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn()
};

// Override do navigator.geolocation
Object.defineProperty(navigator, 'geolocation', {
  value: mockGeolocation,
  configurable: true
});

// Mock do localStorage
const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    length: 0,
    key: jest.fn((index: number) => Object.keys(store)[index] || null)
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  configurable: true
});