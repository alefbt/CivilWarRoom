from CivilWarroomHubWorker.models.basemodel import BaseModel

class UserModel(BaseModel):
    
    def get_jsonschema(self):
        # date created_at, updated_at, update_eventsource_oid

        return {
                "$schema": "https://json-schema.org/draft/2020-12/schema",
                "$id": "https://alefbt.com/warroom/user.schema-v1.json",
                "title": "User",
                "description": "A WarRoom user",
                "type": "object",
                "required": [
                    "displayName",
                    "publicKeyFingerprint"
                ],
                "properties" : {
                    "displayName" : {"type" : "string"},
                    "isActive": {"type":"boolean"},
                    "publicKeyFingerprint": {"type" : "string"},
                    "publicKeyType": {"type":"string"},
                    "publicKey":{"type":"string"},
                    "srcInventation": {"type":"boolean"},
                    "hubPublicKeyFingerprint": {"type":"string"},
                    "hubPublicKeyType": {"type":"string"}
                }

        }