from CivilWarroomHubWorker.models.basemodel import BaseModel

class WarRoomModel(BaseModel):
    def _get_schema_name(self):
        return "WarRoomSchemaV1"