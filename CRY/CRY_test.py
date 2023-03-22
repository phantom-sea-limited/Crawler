#!/usr/bin/env python
# -*- coding: utf-8 -*-
import base64
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_v1_5 as Cipher_PKC
from Crypto import Random
# from Crypto.Hash import SHA256
# from Crypto.Signature import PKCS1_v1_5 as Signature_PKC


class CRYRSA():
    """
    pem_path: 导入的pem文件所在目录

    """

    def __init__(self, pem_path: str = ""):
        try:
            self.private = RSA.import_key(
                open(pem_path + "private.pem").read())
        except Exception:
            self.private = None
        try:
            self.public = RSA.import_key(open(pem_path + "public.pem").read())
        except Exception:
            self.public = None

    def encrypt(self, plaintext):
        """
        进行加密
        plaintext:需要加密的明文文本，公钥加密，私钥解密
        """

        # 加载公钥
        rsa_key = self.private
        # 加密
        cipher_rsa = Cipher_PKC.new(rsa_key)
        en_data = cipher_rsa.encrypt(plaintext.encode("utf-8"))  # 加密

        # base64 进行编码
        base64_text = base64.b64encode(en_data)

        return base64_text.decode()

    def encrypt_more(self, plaintext: str):
        """
        进行加密
        plaintext:需要加密的明文文本，公钥加密，私钥解密
        """
        # import math
        plaintext = plaintext.encode()
        # n = int(math.ceil(len(plaintext) * 1.0 / 117))

        ret = ""
        f = 0
        i = 0
        while True:
            # for i in range(n):
            data = plaintext[i * 117 + f:(i + 1) * 117 + f]
            if data == b"":
                break
            # ret = ret + rsa.encrypt(data.decode()) + "\n"
            data, fi = fix(data)
            f += fi
            ret += self.encrypt(data) + "\n"
            i += 1
        return ret

    def decrypt(self, en_data):
        """
        进行解密
        en_data:加密过后的数据，传进来是一个字符串

        """
        # base64 解码
        base64_data = base64.b64decode(en_data.encode("utf-8"))

        # 读取私钥
        private_key = self.public

        # 解密
        cipher_rsa = Cipher_PKC.new(private_key)
        data = cipher_rsa.decrypt(base64_data, None)

        return data.decode()

    def decrypt_more(self, en_data: str):
        """
        进行解密
        en_data:加密过后的数据，传进来是一个字符串

        """
        en_list = en_data.split("\n")
        data = ""
        for l in en_list:
            if l != "":
                data += self.decrypt(l)
        return data

    @staticmethod
    def create_rsa_key():
        random_gen = Random.new().read
        # 生成秘钥对实例对象：1024是秘钥的长度
        rsa = RSA.generate(1024, random_gen)
        private_pem = rsa.exportKey()
        with open("private.pem", "wb") as f:
            f.write(private_pem)

        public_pem = rsa.publickey().exportKey()
        with open("public.pem", "wb") as f:
            f.write(public_pem)


def fix(data):
    fix = 0
    while True:
        try:
            data = data.decode()
        except:
            data = data[0:-1]
            fix -= 1
        else:
            return data, fix


if __name__ == "__main__":
    Rsa = CRYRSA()
    plaintext = '''啊吧啊吧啊吧？！\n A?'''*1000
    o = Rsa.encrypt_more(plaintext)
    # print(plaintext)
    e = Rsa.decrypt_more(o)
    print(len(e))
    # print(e)
    print(plaintext == e)
