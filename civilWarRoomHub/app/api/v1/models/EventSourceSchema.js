const mongoose = require('mongoose');
const logger = require('../../../../utils/logger');

exports.name = "EventSource"

exports.mongooseSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.UUID,
    eventType: String,
    warRoomId: String,
    userPuKfingerprint:String,
    data: Object,
    timestamp: String,
    sourceJWT: String,
    corrolationId: String
  });

exports.eventTypes = {
    TEST: "TEST",
    CREATE_WARROOM_REQUEST: 'CREATE_WARROOM_REQUEST'
}