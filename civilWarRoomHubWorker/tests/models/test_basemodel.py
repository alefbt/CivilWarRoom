import unittest

from CivilWarroomHubWorker.models.basemodel import BaseModel
from CivilWarroomHubWorker.stores.ContextStore import ContextStore
from CivilWarroomHubWorker.stores.SchemaStore import SchemaStore


class TestBaseModel(BaseModel):
    def get_jsonschema(self):
        return {
                "$schema": "https://json-schema.org/draft/2020-12/schema",
                "$id": "https://alefbt.com/warroom/user.schema-v1.json",
                "title": "Test Model",
                "description": "For testing",
                "type": "object",
                "properties" : {
                    "name" : {"type" : "string"},
                },
        }
    
class Test2BaseModel(BaseModel):
    pass

class Test3BaseModel(BaseModel):
    pass
           

class TestsOfBaseModel(unittest.TestCase):
    def setUp(self):
        self.context = ContextStore()
        self.context.set("config", {})

        self.schemaStore = SchemaStore(self.context)

        self.schemaStore.schemas["Test2BaseModelV1"] = {
                "$schema": "https://json-schema.org/draft/2020-12/schema",
                "$id": "https://alefbt.com/warroom/Test2BaseModelV1.schema-v1.json",
                "title": "Test Model",
                "description": "For testing",
                "type": "object",
                "properties" : {
                    "name" : {"type" : "string"},
                }
        }

        self.context.set(SchemaStore.__name__, self.schemaStore)


    def test_valid_model_has_schemaname(self):
        m = Test2BaseModel(self.context, {})
        self.assertEqual("Test2BaseModelV1",m._get_schema_name())

    def test_non_existing_schema_for_model_should_throw_error(self):
        with self.assertRaises(Exception):
            Test3BaseModel(self.context, {})

    def test_should_insert_only_relevant_from_dict(self):
        non_existing_field = "not-valid-key-that-shouldnt-exists"

        dict_user  = {
            non_existing_field: 123,
            "name": "Valid name"
        }
        
        um = TestBaseModel(self.context, dict_user)
        model =  um.get_model()
        self.assertNotIn(non_existing_field,model.keys())    

if __name__ == '__main__':
    unittest.main()