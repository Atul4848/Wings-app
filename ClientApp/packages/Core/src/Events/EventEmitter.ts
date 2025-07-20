class EventEmitter {
  on(type: any, listener: any) {
    window.addEventListener(type, listener);
  }

  off(type: any, listener: any) {
    window.removeEventListener(type, listener);
  }

  emit(type: any, data: any) {
    window.dispatchEvent(
      new CustomEvent(type, { detail: data })
    );
  }
}

const EventInstance = new EventEmitter();

export default EventInstance