import EventEmitter from "events";

class ApplicationEmitter extends EventEmitter {}

const applicationEmitter = new ApplicationEmitter();

export default applicationEmitter;
