//db = db.getSiblingDB('ADMIN');

db.createUser({
  user: process.env['MONGO_USER'],
  pwd: process.env['MONGO_PASS'],
  roles: [
    {
      role: 'readWrite',
      db: process.env['MONGO_DATABASE'],
    },
  ],
  mechanisms: ['SCRAM-SHA-1'],
});
