from models.serializable import BaseMongoObject


class SiteUser(BaseMongoObject):
    def __init__(self, _id=None, username=None, password=None, firstname=None, surname=None, loginToken=None, roles=None, allowLogging=True, *args, **kwargs):
        super().__init__(_id, *args, **kwargs)
        self.username = username
        self.password = password
        self.firstname = firstname
        self.surname = surname
        self.loginToken = loginToken
        self.roles = roles
        self.allowLogging = allowLogging
