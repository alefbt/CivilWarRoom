import pgpy
import xxhash
from expiringdict import ExpiringDict
from pgpy.constants import PubKeyAlgorithm, KeyFlags, HashAlgorithm, SymmetricKeyAlgorithm, CompressionAlgorithm

class EncryptionDriver():
   def __init__(self) -> None:
      self.cache = ExpiringDict(max_len=100, max_age_seconds=100)
   
   def get_key(self, plainKey):
      hashkey = xxhash.xxh64(plainKey).hexdigest()
      if ( hashkey in self.cache):
         return self.cache[hashkey]
      
      keyinst = self.get_key_instance(plainKey)
      self.cache[hashkey] = keyinst
      return keyinst
   
   def get_type_name(self):
      raise Exception("undefined type name")
   
   def get_key_instance(self, plainKey):
      pass
   
   def get_fingerprint(self, plainKey):
      pass

   def get_name(self, plainKey):
      pass  

   def generate_keys(self, displayName ,password):
      pass

class OpenPGPEncryptionDriver(EncryptionDriver):
   #@staticmethod
    def get_type_name(self):
       return "openpgp"
    
    def get_key_instance(self,plainKey) -> pgpy.PGPKey:
      empty_key = pgpy.PGPKey()
      empty_key.parse(plainKey)
      return empty_key
    
    def get_fingerprint(self,plainKey):
      return str(self.get_key(plainKey).fingerprint).upper()

    def get_name(self,plainKey):
      return ", ".join([ k.name for k in self.get_key(plainKey).userids])
    
    def generate_keys(self, displayName ,password):
      key = pgpy.PGPKey.new(PubKeyAlgorithm.RSAEncryptOrSign, 4096)
      uid = pgpy.PGPUID.new(displayName)

      key.add_uid(uid, usage={KeyFlags.Sign, KeyFlags.EncryptCommunications, KeyFlags.EncryptStorage},
                  hashes=[HashAlgorithm.SHA256, HashAlgorithm.SHA384, HashAlgorithm.SHA512, HashAlgorithm.SHA224],
                  ciphers=[SymmetricKeyAlgorithm.AES256, SymmetricKeyAlgorithm.AES192, SymmetricKeyAlgorithm.AES128],
                  compression=[CompressionAlgorithm.ZLIB, CompressionAlgorithm.BZ2, CompressionAlgorithm.ZIP, CompressionAlgorithm.Uncompressed])

      key.protect(password, SymmetricKeyAlgorithm.AES256, HashAlgorithm.SHA256)

      return {
          "displayName": displayName,
          "publicKey": str(key.pubkey),
          "privateKey": str(key),
          "fingerprint": key.fingerprint
      }

class Encryption:
    driver = OpenPGPEncryptionDriver()

    @staticmethod
    def get_driver() -> EncryptionDriver:
       return Encryption.driver
    
    def __init__(self) -> None:
      self.driver = Encryption.get_driver()
    
    @staticmethod
    def get_type_name():
       return Encryption.get_driver().get_type_name()

    @staticmethod
    def get_name(plainKey):
       return Encryption.get_driver().get_name(plainKey)

    @staticmethod
    def get_fingerprint(plainKey):
       return Encryption.get_driver().get_fingerprint(plainKey)
    
    @staticmethod
    def generate_keys(displayName ,password):
       return Encryption.get_driver().generate_keys(displayName ,password)
       
    