from CivilWarroomHubWorker.models.basemodel import BaseModel

class UserModel(BaseModel):
    def _get_schema_name(self):
        return "UserSchemaV1"
    
    # def get_jsonschema(self):
    #     return getSchemaStoreFromContext(self.context).getSchemas("UserSchemaV1")