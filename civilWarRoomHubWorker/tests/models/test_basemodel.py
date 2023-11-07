import unittest

from CivilWarroomHubWorker.models.basemodel import BaseModel


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
    

class TestsOfBaseModel(unittest.TestCase):
    def test_should_insert_only_relevant_from_dict(self):
        non_existing_field = "not-valid-key-that-shouldnt-exists"

        dict_user  = {
            non_existing_field: 123,
            "name": "Valid name"
        }

        um = TestBaseModel(dict_user)
        model =  um.get_model()
        self.assertNotIn(non_existing_field,model.keys())    

if __name__ == '__main__':
    unittest.main()