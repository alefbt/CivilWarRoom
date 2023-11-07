import unittest

from CivilWarroomHubWorker.models.user import UserModel

class TestUserModel(unittest.TestCase):
    def test_usermodel_missing_required(self):
        dict_user  = {
            "displayName": "Valid name",
            # "publicKeyFingerprint": "g-g-g-gg-g" <--- required should be missing
        }
        um = UserModel(dict_user)
        
        with self.assertRaises(Exception):
            um.validate()

    def test_should_be_valid_usermodel(self):
       
        dict_user  = {
            "displayName": "Valid name",
            "publicKeyFingerprint": "g-g-g-gg-g"
        }

        um = UserModel(dict_user)
        success = False
        err = ""

        try:
            um.validate()
            success = True
        except Exception as inst:
            err=inst
            success = False

        self.assertTrue(success,err)

if __name__ == '__main__':
    unittest.main()