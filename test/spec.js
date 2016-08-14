var Sequelize = require('sequelize');
var expect = require('chai').expect;

var db = new Sequelize(process.env.CONN);

var User = db.define('user', {
  name: Sequelize.STRING
});

var Role = db.define('role', {
  name: Sequelize.STRING
});

var UserRole = db.define('users_roles', {});

User.hasMany(UserRole);
Role.hasMany(UserRole);
UserRole.belongsTo(Role);
UserRole.belongsTo(User);


describe('DB', function(){
  var moe;
  beforeEach(function(done){
    db.sync({ force: true })
      .then(function(){
        return Promise.all([
          User.create({ name: 'moe' }),
          Role.create({ name: 'Admin' }),
          Role.create({ name: 'Staff' }),
          Role.create({ name: 'Executive' }),
        ]);
      })
      .then(function(result){
        return Promise.all([
          UserRole.create({ userId: result[0].id, roleId: result[1].id}),
          UserRole.create({ userId: result[0].id, roleId: result[2].id}),
        ]);
      })
      .then(function(){
        return User.findOne({ where: { name: 'moe' }, include: [ {
          model: UserRole,
          include: [ Role ]
        } ] });
      })
      .then(function(_moe){
        moe = _moe;
        done();
      
      });
  });

  it('moe has two roles', function(){
    expect(moe.users_roles.length).to.equal(2);
    var roleNames = moe.users_roles.map(function(ur){
      return ur.role.name;
    });

    expect(roleNames).to.contain('Admin');
    expect(roleNames).to.contain('Staff');
    expect(roleNames).not.to.contain('Executive');
  });
});
