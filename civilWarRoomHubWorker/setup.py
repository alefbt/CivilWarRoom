import os
from setuptools import setup

def read(fname):
    return open(os.path.join(os.path.dirname(__file__), fname)).read()

setup(
    name = "CivilWarRoomHubWorker",
    version = "0.0.1",
    author = "Yehuda Korotkin",
    author_email = "it.is.yehuda@gmail.com",
    description = ("""A system that supports a state of war for civilian needs. Because of a war situation in Israel, the people of Israel unite and open war rooms to help each other in a war situation."""),
    license = "GPL3",
    keywords = "Civil WarRoom Hub Worker",
    url = "https://github.com/alefbt/CivilWarRoom",
    packages=['cwrhubworker', 'tests'],
    long_description=read('README.md'),
    classifiers=[
        "Development Status :: 2 - Pre-Alpha",
        "Topic :: Utilities",
        "License :: OSI Approved :: GNU General Public License v3 or later (GPLv3+)",
    ],
)