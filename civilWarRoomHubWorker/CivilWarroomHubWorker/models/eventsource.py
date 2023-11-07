from CivilWarroomHubWorker.models.basemodel import BaseModel

class EventSourceModel(BaseModel):
    
    def get_jsonschema(self):
        # date created_at, updated_at, update_eventsource_oid

        return {
                "$schema": "https://json-schema.org/draft/2020-12/schema",
                "$id": "https://alefbt.com/warroom/eventsource.schema-v1.json",
                "title": "EventSource Schema",
                "description": "EventSource Schema for recording the events",
                "type": "object",
                "required": [
                    "created_at",
                    "@version"
                ],
                "properties" : {
                    "displayName" : {"type" : "string"},
                    "@version" : {"type" : "string"},
                    "uniqueMessageId": {"type" : "string"},

                    "userFingerprint":{},
                    "hubFingerprint":{},
                    "uiFingerprint":{},

                    "source":{},
                    
                    "data": {},
                    "created_at":{},
                    
                }

        }