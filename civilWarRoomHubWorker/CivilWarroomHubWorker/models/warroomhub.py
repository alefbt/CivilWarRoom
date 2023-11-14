from CivilWarroomHubWorker.models.basemodel import BaseModel

class WarRoomHubModel(BaseModel):
    def _get_schema_name(self):
        return "WarRoomHubSchemaV1"