# NOTES

* Split middleware so we call in and out directly...
* make MW use await and force running order

## Permissions

### raw crud access to data

ui.route.account                                access to account route in ui
ui.route.admin                                  access to admin route in ui

api.identity.user                               base access to your user
api.identity.user.organisation                  access to users in your org (same org)
api.identity.user.system                        access to all users system wide

api.identity.organisation                       base access to your organisation
api.identity.organisation.system                access to all organisations

api.identity.department                         base access to department your logged in as
api.identity.department.organisation            access to departments in the organisation your logged in as
api.identity.department.system                  access to departments in the system

api.system.configuration                        base access to configuration

examples of checking a permission as written in code and what will resolve to it db perm > code check

one.two.three > one.two.three || one.two.three/four || one.two.three/four/five
one.two.three.four > one.two.three.four || one.two.three/foo.four/bar || one.two.three/foo/faz.four/bar/baz