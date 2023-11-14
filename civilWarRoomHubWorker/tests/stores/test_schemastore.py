import unittest
from CivilWarroomHubWorker.stores.ContextStore import ContextStore

from CivilWarroomHubWorker.stores.SchemaStore import SchemaStore
import pprint as p

class TestSchemaStore(unittest.TestCase):
        
    def test_should_be_valid_usermodel(self):
        cs = ContextStore()
        cs.set("config", {})

        ss = SchemaStore(cs)
        self.assertGreater(len(ss.list()),0, "The list of schemas should contines values")

if __name__ == '__main__':
    unittest.main()