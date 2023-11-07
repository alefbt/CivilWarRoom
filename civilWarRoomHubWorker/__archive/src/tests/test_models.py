import unittest

import jsonschema

from CivilWarroomHubWorker.models.user import UserModel

class TestModels(unittest.TestCase):

    def test_usermodel_should_insert_only_relevant_from_dict(self):
        dict_user  = {
            "not-valid-key": 123,
            "name": "Valid name"

        }
        um = UserModel(dict_user)
        print("xxx")
        print(um.get_model())

        success = False


        try:
            um.validate()
            success = True
        except Exception:
            print("ERRPR")
            success = False

        self.assertTrue(success,"Should success work")
        

    def test_upper(self):
        self.assertEqual('foo'.upper(), 'FOO')

    def test_isupper(self):
        self.assertTrue('FOO'.isupper())
        self.assertFalse('Foo'.isupper())

    def test_split(self):
        s = 'hello world'
        self.assertEqual(s.split(), ['hello', 'world'])
        # check that s.split fails when the separator is not a string
        with self.assertRaises(TypeError):
            s.split(2)

if __name__ == '__main__':
    unittest.main()