export const EVENTS = {
  NEW_LOCATION_RECORD: 'newLocationRecord'
};

export const emitNewLocationRecord = () => {
  window.dispatchEvent(new Event(EVENTS.NEW_LOCATION_RECORD));
}; 