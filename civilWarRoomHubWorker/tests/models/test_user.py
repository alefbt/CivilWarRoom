import unittest

from CivilWarroomHubWorker.models.user import UserModel
from CivilWarroomHubWorker.stores.ContextStore import ContextStore
from CivilWarroomHubWorker.stores.SchemaStore import SchemaStore

class TestUserModel(unittest.TestCase):
    def setUp(self):
        self.context = ContextStore()
        self.context.set("config", {})
        self.schemaStore = SchemaStore(self.context)
        self.context.set(SchemaStore.__name__, self.schemaStore)
        
    def test_usermodel_missing_required(self):

    
        dict_user  = {
            "displayName": "Valid name",
            # "publicKeyFingerprint": "g-g-g-gg-g" <--- required should be missing
        }
        um = UserModel(self.context, dict_user)
        
        with self.assertRaises(Exception):
            um.validate()

    def test_should_be_valid_usermodel(self):
       
        dict_user  = {
            "displayName": "Valid name",
            "publicKeyFingerprint": "g-g-g-gg-g"
        }

        um = UserModel(self.context, dict_user)
        success = False
        err = ""

        try:
            um.validate()
            success = True
        except Exception as inst:
            err=inst
            success = False

        self.assertTrue(success,err)
        
    def test_integration(self):
        data = "{'userPuKfingerprint': 'c70f972d0a64fb35210d03a340033e9f376af365', 'publicKey': '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\n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\nMv0w\n=DowN\n-----END PGP PUBLIC KEY BLOCK-----\n', 'publicKeyType': 'openpgp', 'displayName': 'Christie Mueller', 'isActive': True, 'srcInventation': 'registration', 'hubPublicKey': '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\n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\n=LbnN\n-----END PGP PUBLIC KEY BLOCK-----\n', 'hubPublicKeyType': 'openpgp'}"

if __name__ == '__main__':
    unittest.main()