from models.serializable import JsonSerializable


class SiteUser(JsonSerializable):
    def __init__(self, _id=None, username=None, password=None, firstname=None, surname=None, loginToken=None, roles=None, *args, **kwargs):
        self._id = _id
        self.username = username
        self.password = password
        self.firstname = firstname
        self.surname = surname
        self.loginToken = loginToken
        self.roles = roles
