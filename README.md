# osa4

You need to setup .env -file to run this locally. Note that the following skeleton assumes that you are also running MongoDB in local host for testing/development purposes. SECRET is used for token generation.

.env skeleton (substitute your own info to user, password and mongohost):

TEST_MONGODB_URI=mongodb://localhost/bloglist
DEV_MONGODB_URI=mongodb://localhost/bloglist
MONGODB_URI=mongodb+srv://user:password@mongohost/bloglist?retryWrites=true&w=majority
PORT=3001
SECRET=HuppaLuppa
