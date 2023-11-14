import unittest
from CivilWarroomHubWorker.Encryption import Encryption

from CivilWarroomHubWorker.models.warroomhub import WarRoomHubModel
from CivilWarroomHubWorker.stores.ContextStore import ContextStore
from CivilWarroomHubWorker.stores.SchemaStore import SchemaStore

class TestUserModel(unittest.TestCase):
    def setUp(self):
        self.context = ContextStore()
        self.context.set("config", {})
        self.schemaStore = SchemaStore(self.context)
        self.context.set(SchemaStore.__name__, self.schemaStore)
        
    def test_usermodel_missing_required(self):
        test_public_key = """-----BEGIN PGP PUBLIC KEY BLOCK-----

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
Mv0w
=DowN
-----END PGP PUBLIC KEY BLOCK-----
"""
        
        warRoomHubModel = WarRoomHubModel(self.context, {
            "displayName": Encryption.get_name(test_public_key),
            "publicKeyFingerprint": Encryption.get_fingerprint(test_public_key),
            "publicKey": test_public_key,
            "publicKeyType": "openpgp"
        })

        warRoomHubModel.validate()

        mod = warRoomHubModel.get_model()

        self.assertEqual(mod['isActive'],True) # check the default value
        self.assertEqual(mod['displayName'],"Christie Mueller") # check the value from pgp

if __name__ == '__main__':
    unittest.main()