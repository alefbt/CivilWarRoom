const expect = require('chai').expect;
const  openpgp = require('openpgp')
const utilsTools = require('../../utils/tools')

//write your test here
 describe('Testing signetures', function() {

    const publicKeyArmored = `-----BEGIN PGP PUBLIC KEY BLOCK-----

xsFNBGU1BnUBEACcFhIFXF9lKiDnqB8UfAvblfSkJvRyLO6SjS8V7vxb/qZ6
4gdpDjo9Hwx/50EpehoMrd6E+TKz71NI+SBFD5xDQmT733FaSkPFr4UveYZR
g8zXODZ1HIoXJ6nOq7tdFZi7VWYvuZxU57IDksRHNOf6DzNeSab3cVmDt8E+
zQdkaSEVNkRXJgs7OVrnPCLxsnTNb8l74J4HMzttbvAcmGKaYv0dVkRrWzuI
e1ay49HADxt3vsGxjWpJjH1cUyIzSWBrq1dCZMB9uAZsXAGORYdQiPi7VEMK
xR9UhVaPa1yl1PgE8hU78AB72sByV3PjwHkXeFuc1ZaIYKPVcDLH52MD7d0W
5zonLaYxvVqqMPvi4KcOvbEw+LDm9VlwieHjBWsyPgIU1+iuvFPDdo95yenM
PLR7YMMq1tWZ00/CutmcYxJwtUdWfqb+Lsu+A5XN5T5pfveo86keIplshCZZ
Vbbb7LM+ahncODImH2stGxkG6/loHpISSAR7b8xfpmOskdr7VX7n1DRniZOd
OUeLwTKC1FPy8LLE/Of8FzQvIM8ZeFY4uzP+vKZodzA/T40Ph2qVX6hykp9o
w95VqhuCsyb0RZtM2TU+4UoRNAxnizUjs8KT7P0MF6Rowm2YcEDLizDAUzkB
DU8gtflJriZLGDBfqAQYo+63DYJ7joJ5IlUdLwARAQABzShFcm5lc3RpbmUg
RXJkbWFuIDxTaWxhcy5CYXVjaEB5YWhvby5jb20+wsGKBBABCAA+BYJlNQZ1
BAsJBwgJkLdFxhgKYg0YAxUICgQWAAIBAhkBApsDAh4BFiEEFoNNk55WUOdS
br5ht0XGGApiDRgAAI+sD/45cPiuv+K8KFKk05jFQbxoeSiqm5y7RGYNJRNW
zaj1iRwztUUaO5oep1/LZDSJd26Ll2kDZId/MhnAGlMVDeH9sL9H3Bp2mKXR
ne3fLrd2Gr5TtYAj/6nIfdBcvsbovBUt5n5Zsa/6Jh4Ocv5WUiD/+NdqMeX5
FuOX3wLwpHInCNTqG4Tz7Vxw4KeybmhRDzlOW6E7EhlQFh74S7vi9EcDa5qH
t7fzxd+vv+6B0J8aRbP38GHzkwdxdaTTNLshps/+meL9CcpVqrhG4YoCIRn8
bqwCOVaNH5/yqImHFCsvSRLpBO2L6P+Zp9VjOOI8rjW343/UnPW5YM1uCJZ3
WpN6WS+w1jRFzmIA9PBmiKNo6HFA6b7r0pS/TXhYySTiULlvtoVKqEPgzkrF
Zb7h9jpcFtgxQaBd2WyJIhal/fJ5JOaNY/AnA/7I7tMKkR4uo4ooR97TIm01
bwbKia4pqHsnY8ZaU1fzpGnq6cwCJVkfVwwInffSGZSyvV+lVB9/xxWxyOn0
wsmZKtnn1iVFWUFvwocvvYOHjJHVywbRS9V+eRD1/GU7DifDNkFMC3YqIHcY
YzXUu9A2Y/F0MAOP4T5tU8pARYAGLc++roQetXGG3W5HL1EDsNUzI+R7QoFc
IlP+LZF9WSVGinqbhWsM5FE3FW1V+/ZbG/DJSC2QMJVdus7BTQRlNQZ1ARAA
qhp0q+C8vZpCkL3m72zkLhcJBfca2ct0V0uc0NOsnRmBJNvqBlPeVt682aY/
gBsx9KiCcdkTyMH0avkVF4bE/P7TMKpYguyY+InmGxeDW//jurziH/TDnM+5
6AX8Ildcd1V65XESl1j9FGxY7iWUHoJ3EhGfi51sFC6F/jkwiGOlzZsbJE72
mAVQqEX+lPxbM4XFwDLVZZSWKTrDvjmyYBvoLbEAtspIcuxy9/q31eRnXyQB
NS90vbGcf1gEhnr1DnNK9ca43lmX6VC781j+UJatCCzOham2n48Hvf/pNmG6
rpw96jd7ishzFFGMbeaeSwOCjiSi4Su3g0gGhdBLF9d66nV1KcVlbP3S+q4/
L9uuuhVxPsywinAeQ326LA0Ef4Kxp0gKoh5/geYQy6EvZOePHjHJF+x560PB
OWZLu01lXumZVI8y7FSZrLuKQLrNV6okd5fAJK0gcNrQ2f/vO7qZ99ThI8GF
bumLqR8o7DxsJ1kUuWIM63fUZxa1s6gNwYBhq7RLfZMxXOi6SuejTwtlcqQa
YGNTbxFZvm09Fszavb6HRxmGRQ3WFconrOYr3MBiPgsRToauUnHmZQF7G+zY
VbYlcCbmWoJDAY2Lz7HcrjRTv744w0mmz8KSDX1SsXruf3Mi6bOxAbGQOSPv
BBUwUnln7O7UfhcaYBUBJk0AEQEAAcLBdgQYAQgAKgWCZTUGdQmQt0XGGApi
DRgCmwwWIQQWg02TnlZQ51JuvmG3RcYYCmINGAAAC8YP/A7Pspc+55Xu+JPr
8FcIYoxKWrtxLRsiidMG+gk9CVtUBpknojVLG+ZYsNv+IWB/L0dvzZG8OEFu
8802z4Rx/q/hMNPQO1lCj9fA8xdRfPdLANndMuqcYVmF1EFDKaStTOiWnYPo
DNq1rSEFg8a0QQlH8+Ou2Id0Z6OZacrSXFPIG5vzFYV+1LFhw1YrELCF4BJF
K6XaA4AbA0WDXzLXg7hLXy0QcvgCE6ME8zMZmo6w4N+Q+a2KQi9TkfvcfX/0
W3K0yx6xquqwK4Cgh+s8f9xfgPwE3apf/z0wd89CFwT9SW3RRe56YHcI3I9E
aO64WLoznbincz2r7vUfXDO62EcgXL+WRqajjeGJiYO+yyWhw1NqQHQFDRP+
EVb2PpCsuiVRvAovRjTBe1NbKh+C1QN0hRRJKk+dZxXPZYuomJL4jADt/cCM
jc/eY7GE5MSninWAloXqErJHA+pgOE35FdommgFo4QxiM3H0GmbcGu9nSeil
19HvnYwwpFUzVZLAB8jV32dLrsSkmt4kpRpwgJVhHpDrIRjd2Dim64BJwVWH
Rz6x8+WdgBTXEtDioI+YadmIL6UCFncm8rUPlKK32KFTrACRtTjAjxhaxX1I
ae+Y8mRQahTVboD97CMo+ElC+wWWkbe9pkFjes6nTXG+4JYCrmIUl257S/Gn
fLpCNh4U
=hvwB
-----END PGP PUBLIC KEY BLOCK-----
`;
    const privateKeyArmored = `-----BEGIN PGP PRIVATE KEY BLOCK-----

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
zqdNcb7glgKuYhSXbntL8ad8ukI2HhQ=
=XnNx
-----END PGP PRIVATE KEY BLOCK-----
`; 
    const passphrase = "123"; // what the private key is encrypted with

    
    let publicKey = null
    let privateKeyObjUn = null
    let privateKey = null

    before( (done) => {

        (async ()=>{
            publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
            privateKeyObjUn  =await openpgp.readKey({ armoredKey: privateKeyArmored })
            privateKey = await openpgp.decryptKey({
                privateKey: privateKeyObjUn,
                passphrase: passphrase,
            });


            done()
        })()

        
    });

    it('Signeture verification test', function(done) {


        const data = {
            "TestdatA": "me",
            "a": 1
        }

        let detachedSignature = "";

        ( async ()=>{
            const cleartextMessage =  utilsTools.objToBase64(data)
            const unsignedMessage = await openpgp.createMessage({ text: cleartextMessage });
            console.log("b")

            const detachedSignature = await openpgp.sign({
                message: unsignedMessage, // Message object
                signingKeys: privateKey,
                detached: true
            });

            console.log(detachedSignature)

        })();
      

        
        expect(detachedSignature).to.not.empty;

         
         
         done();
     });
     

 });
